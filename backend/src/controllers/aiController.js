const { GoogleGenAI } = require("@google/genai");
const asyncHandler = require('express-async-handler');
const AIAnalytics = require('../models/AIAnalytics');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: 'v1beta'
});

const MODEL_NAME = "models/gemini-2.0-flash";

// ── In-memory request queue to prevent burst calls ──────────────────────────
let lastCallTime = 0;
const MIN_INTERVAL_MS = 15000; // At most 1 call per 15 seconds (4/min staying safely under 5 RPM)

const rateLimitedAICall = async (prompt) => {
    const now = Date.now();
    const timeSinceLast = now - lastCallTime;
    if (timeSinceLast < MIN_INTERVAL_MS) {
        await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - timeSinceLast));
    }
    lastCallTime = Date.now();
    const result = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return result.candidates[0].content.parts[0].text.trim();
};

// ── Cache helpers ────────────────────────────────────────────────────────────
const getCache = async (type, identifier) => {
    const cached = await AIAnalytics.findOne({
        type,
        identifier,
        expiresAt: { $gt: new Date() }
    });
    return cached?.data || null;
};

const setCache = async (type, identifier, data, ttlHours = 24) => {
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    await AIAnalytics.findOneAndUpdate(
        { type, identifier },
        { type, identifier, data, expiresAt },
        { upsert: true, new: true }
    );
};

// ── Fallback helpers ─────────────────────────────────────────────────────────
const descriptionFallback = (name, category) =>
    `A carefully prepared ${category || 'dish'} featuring ${name}. Made fresh to order with quality ingredients.`;

const recommendationFallback = () => [];

const inventoryFallback = (items) => {
    // Simple rule-based fallback: flag items with stock < recentSales * 2
    return items
        .filter(i => i.stock < (i.recentSales || 0) * 2 && i.stock < 10)
        .slice(0, 3)
        .map(i => ({
            name: i.name,
            risk: i.stock < 5 ? 'High' : 'Medium',
            reason: `Stock is ${i.stock} but ${i.recentSales || 0} sold recently.`,
            recommendation: `Reorder ${i.name} soon to avoid running out.`
        }));
};

// ── Controllers ──────────────────────────────────────────────────────────────

// @desc    Generate menu item description
// @route   POST /api/ai/generate-description
// @access  Private/Admin
const generateDescription = asyncHandler(async (req, res) => {
    const { name, category } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please provide a menu item name');
    }

    const cacheId = `${name}-${category || 'main'}`.toLowerCase().replace(/\s+/g, '-');

    // 1. Return cached version if available
    const cached = await getCache('description', cacheId);
    if (cached) {
        console.log('[AI Cache HIT] description:', cacheId);
        return res.json({ description: cached, cached: true });
    }

    // 2. Try AI, fall back to template
    try {
        const text = await rateLimitedAICall(
            `You are a gourmet menu writer. Write a short, appetizing description (max 2 sentences) for: ${name} (${category || 'Main Course'})`
        );
        await setCache('description', cacheId, text, 168); // Cache 1 week - descriptions rarely change
        res.json({ description: text });
    } catch (error) {
        console.error('[AI FALLBACK] description:', error.message);
        const fallback = descriptionFallback(name, category);
        res.json({ description: fallback, fallback: true });
    }
});

// @desc    Generate order special instructions
// @route   POST /api/ai/generate-instructions
// @access  Private
const generateOrderInstructions = asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        res.status(400);
        throw new Error('Please provide a prompt for instructions');
    }

    // Instructions are user-specific, no caching (short, cheap call)
    try {
        const text = await rateLimitedAICall(
            `You are a restaurant assistant. Convert these rough notes into concise, polite kitchen instructions in 1-2 sentences: ${prompt}`
        );
        res.json({ instructions: text });
    } catch (error) {
        console.error('[AI FALLBACK] instructions:', error.message);
        // Clean up the prompt text as a simple fallback
        res.json({ instructions: prompt, fallback: true });
    }
});

const Order = require('../models/Order');
const Menu = require('../models/Menu');

// @desc    Generate personalized recommendations
// @route   POST /api/ai/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    const { restaurantId } = req.body;
    const userId = req.user._id.toString();
    const cacheId = `${userId}-${restaurantId || 'all'}`;

    // 1. Return cached version (cache for 6 hours)
    const cached = await getCache('recommendation', cacheId);
    if (cached) {
        console.log('[AI Cache HIT] recommendations:', cacheId);
        return res.json(cached);
    }

    // 2. Gather data
    const query = { user: req.user._id };
    if (restaurantId) query.restaurant = restaurantId;

    const userOrders = await Order.find(query).sort({ createdAt: -1 }).limit(5).populate('items.menuItem');
    const historyNames = userOrders.flatMap(o => o.items.map(i => i.name)).slice(0, 15);

    const menuQuery = { isAvailable: true };
    if (restaurantId) menuQuery.restaurant = restaurantId;
    const menuItems = await Menu.find(menuQuery).select('name category description');

    // If no menu, return empty
    if (menuItems.length === 0) return res.json([]);

    const menuText = menuItems.map(i => `- ${i.name} (${i.category})`).join('\n');
    const prompt = `
        User's past orders: ${historyNames.length > 0 ? historyNames.join(', ') : 'None'}
        Menu: ${menuText}
        Suggest exactly 3 menu items the user should try next. Respond ONLY as a JSON array of item names: ["item1","item2","item3"]
    `;

    try {
        const text = await rateLimitedAICall(prompt);
        const jsonMatch = text.match(/\[.*\]/s);
        const names = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        const finalQuery = { name: { $in: names }, isAvailable: true };
        if (restaurantId) finalQuery.restaurant = restaurantId;
        const recommendations = await Menu.find(finalQuery).limit(3);

        await setCache('recommendation', cacheId, recommendations, 6);
        res.json(recommendations);
    } catch (error) {
        console.error('[AI FALLBACK] recommendations:', error.message);
        // Fallback: return 3 random menu items
        const fallbackItems = await Menu.find(menuQuery).limit(3);
        res.json(fallbackItems);
    }
});

// @desc    Predict inventory needs based on stock and orders
// @route   POST /api/ai/predict-inventory
// @access  Private/Admin
const predictInventory = asyncHandler(async (req, res) => {
    const { restaurantId } = req.body;
    const cacheId = restaurantId || 'all';

    // 1. Return cached version (6 hour cache — inventory changes slowly)
    const cached = await getCache('inventory-prediction', cacheId);
    if (cached) {
        console.log('[AI Cache HIT] inventory:', cacheId);
        return res.json(cached);
    }

    // 2. Gather data
    const menuQuery = {};
    if (restaurantId) menuQuery.restaurant = restaurantId;
    const menuItems = await Menu.find(menuQuery).select('name stock category');

    const orderQuery = {};
    if (restaurantId) orderQuery.restaurant = restaurantId;
    const recentOrders = await Order.find(orderQuery).sort({ createdAt: -1 }).limit(100);

    const salesVolume = {};
    recentOrders.forEach(order => {
        order.items.forEach(item => {
            salesVolume[item.name] = (salesVolume[item.name] || 0) + item.quantity;
        });
    });

    const inventoryData = menuItems.map(item => ({
        name: item.name,
        stock: item.stock,
        category: item.category,
        recentSales: salesVolume[item.name] || 0
    }));

    const prompt = `
        Restaurant inventory data: ${JSON.stringify(inventoryData)}
        Identify up to 3 items at risk of running out. Consider: low stock + high recent sales.
        Respond ONLY as JSON: [{"name":"...","risk":"High|Medium","reason":"...","recommendation":"..."}]
    `;

    try {
        const text = await rateLimitedAICall(prompt);
        const jsonMatch = text.match(/\[.*\]/s);
        const prediction = jsonMatch ? JSON.parse(jsonMatch[0]) : inventoryFallback(inventoryData);

        await setCache('inventory-prediction', cacheId, prediction, 6);
        res.json(prediction);
    } catch (error) {
        console.error('[AI FALLBACK] inventory:', error.message);
        const fallback = inventoryFallback(inventoryData);
        res.json(fallback);
    }
});

module.exports = { generateDescription, generateOrderInstructions, getRecommendations, predictInventory };
