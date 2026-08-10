const asyncHandler = require('express-async-handler');
const AIAnalytics = require('../models/AIAnalytics');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');

const MODEL_NAME = "meta/llama-3.1-8b-instruct";

// ── In-memory request queue to prevent burst calls ──────────────────────────
let lastCallTime = 0;
const MIN_INTERVAL_MS = 2000; // Reduced to 2s for significantly better UI responsiveness

const rateLimitedAICall = async (prompt) => {
    const now = Date.now();
    const timeSinceLast = now - lastCallTime;
    if (timeSinceLast < MIN_INTERVAL_MS) {
        await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - timeSinceLast));
    }
    lastCallTime = Date.now();

    // Ensure fresh env
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });

    const openai = new OpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    const stream = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
            { role: "system", content: "You are a backend restaurant AI. Maintain a highly professional, gourmet tone. For array or JSON answers, output strictly JSON without markdown tags." },
            { role: "user", content: prompt }
        ],
        temperature: 0.20,
        top_p: 0.70,
        max_tokens: 512,
        frequency_penalty: 0.00,
        presence_penalty: 0.00,
        stream: true
    });

    let text = '';
    for await (const chunk of stream) {
        text += chunk.choices[0]?.delta?.content || '';
    }

    // Strip any leftover <think>...</think> blocks
    if (text.includes('<think>') && text.includes('</think>')) {
        text = text.replace(/<think>[\s\S]*?<\/think>\n?/g, '');
    }
    return text.trim();
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
        { upsert: true, returnDocument: 'after' }
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
        // console.log('[AI Cache HIT] description:', cacheId);
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
        // console.log('[AI Cache HIT] recommendations:', cacheId);
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
        // console.log('[AI Cache HIT] inventory:', cacheId);
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

// @desc    Generate a complete menu item from a single text prompt
// @route   POST /api/ai/generate-full-item
// @access  Private/Admin
const generateFullMenuItem = asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        res.status(400);
        throw new Error('Please provide a prompt to generate a dish (e.g. "Spicy Mexican Tacos")');
    }

    const aiPrompt = `
        The user wants to add a new menu item based on this request: "${prompt}".
        Generate a complete restaurant menu item profile.
        Output ONLY a rigid JSON object containing:
        {
          "name": "Catchy, appetizing name",
          "description": "1-2 sentence delicious description",
          "category": "Must be exactly one of: 'Appetizer', 'Main Course', 'Dessert', 'Beverage'",
          "imagePrompt": "A highly detailed, comma-separated midjourney-style image prompt for food photography of this exact dish on a beautiful plate, e.g., 'gourmet spicy mexican tacos, professional food photography, dark background, 8k resolution, highly detailed'"
        }
    `;

    try {
        const text = await rateLimitedAICall(aiPrompt);

        let parsedData;
        try {
            // Find JSON block just in case the model wraps it
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text;
            parsedData = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse AI JSON:", text);
            throw new Error("AI returned malformed data format.");
        }

        // Validate Category Enum
        const validCategories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];
        if (!validCategories.includes(parsedData.category)) {
            parsedData.category = 'Main Course'; // Fallback
        }

        // Generate free image via Pollination AI
        const safeImagePrompt = encodeURIComponent(parsedData.imagePrompt || `${parsedData.name} plate professional food photography`);
        const image = `https://image.pollinations.ai/prompt/${safeImagePrompt}?width=800&height=600&nologo=true`;

        res.json({
            name: parsedData.name || prompt,
            description: parsedData.description || "Freshly prepared dish.",
            category: parsedData.category,
            price: 0,
            stock: 0,
            image: image
        });

    } catch (error) {
        console.error('[AI FALLBACK] generateFullMenuItem:', error.message);
        
        // Provide a graceful fallback if the AI generation fails
        // e.g. due to missing NVIDIA_API_KEY, rate limits, or parse errors
        const safeImagePrompt = encodeURIComponent(prompt + " plate professional food photography delicious");
        const image = `https://image.pollinations.ai/prompt/${safeImagePrompt}?width=800&height=600&nologo=true`;

        res.json({
            name: prompt,
            description: `Delicious ${prompt} prepared fresh by our chef.`,
            category: 'Main Course',
            price: 0,
            stock: 0,
            image: image
        });
    }
});

// @desc    Process general chat using NVIDIA Qwen AI
// @route   POST /api/ai/chat
// @access  Private
const chatWithNvidia = asyncHandler(async (req, res) => {
    const { messages, restaurantId } = req.body;

    if (!messages || !Array.isArray(messages)) {
        res.status(400);
        throw new Error('Please provide an array of messages');
    }

    try {
        // Ensure fresh env
        dotenv.config({ path: path.resolve(__dirname, '../../.env') });

        const openai = new OpenAI({
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: 'https://integrate.api.nvidia.com/v1',
        });
        
        let restaurantContext = "";
        if (restaurantId) {
            const Restaurant = require('../models/Restaurant');
            const Menu = require('../models/Menu');
            
            const restaurant = await Restaurant.findById(restaurantId);
            const menuItems = await Menu.find({ restaurant: restaurantId, isAvailable: true }).select('name category description price');
            
            if (restaurant) {
                const menuList = menuItems.length > 0 
                    ? menuItems.map(item => `- ${item.name} (₹${item.price}): ${item.description || item.category}`).join('\n')
                    : 'EMPTY_MENU_NO_ITEMS_AVAILABLE';
                
                restaurantContext = `
You are specifically representing a restaurant named "${restaurant.name}".
Cuisine Type/Description: ${restaurant.cuisine || restaurant.description || 'Not specified'}.

CRITICAL INSTRUCTION: Here is our current live menu. YOU MUST ONLY suggest, recommend, or discuss items from this specific menu. 
If the menu below says "EMPTY_MENU_NO_ITEMS_AVAILABLE", you MUST inform the customer that the menu is currently empty or still being set up, and you CANNOT recommend any dishes.
DO NOT invent, hallucinate, or recommend ANY random items, dishes, or drinks outside of this exact list under ANY circumstances. Do not use generic examples like "Biryani" or "Paneer" unless they are explicitly in the list below.
CRITICAL INSTRUCTION: When mentioning prices, you MUST ALWAYS use the Indian Rupee symbol (₹). Do NOT use dollar signs ($) or any other currency format.

[LIVE MENU START]
${menuList}
[LIVE MENU END]
`;
            }
        } else {
            const Restaurant = require('../models/Restaurant');
            const allRestaurants = await Restaurant.find({}).select('name cuisine description');
            
            if (allRestaurants.length > 0) {
                const restList = allRestaurants.map(r => `- ${r.name} (${r.cuisine || 'Various'}): ${r.description || 'A great place to dine.'}`).join('\n');
                restaurantContext = `
You are representing the Dine Flow global platform. The user has NOT selected a specific restaurant yet.
Your job is to help the user choose a restaurant from our platform.
Here is the list of available restaurants:
${restList}

CRITICAL INSTRUCTION: Since the user has not selected a restaurant, YOU DO NOT HAVE A MENU YET. 
You MUST NOT recommend any specific dishes, appetizers, or drinks. DO NOT invent or hallucinate any menus.
If the user asks for food recommendations, tell them they must first select a restaurant from the list above, or you can recommend one of the restaurants from the list based on their cuisine preferences.
`;
            } else {
                restaurantContext = `
You are representing the Dine Flow global platform. The user has NOT selected a specific restaurant yet.
CRITICAL INSTRUCTION: There are currently NO restaurants available on the platform. You MUST inform the user that no restaurants are available yet. DO NOT invent or recommend any food or restaurants.
`;
            }
        }

        // Determine AI personality based on user role
        let systemContent = "";
        if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
             systemContent = `You are an intelligent, helpful, and polite Restaurant Management Assistant. Your job is to help the restaurant owner/admin manage their business, analyze inventory, understand orders, and generate menu ideas. Keep your answers reasonably concise, professional, and well-organized. If asked about something unrelated to restaurant management, politely steer the conversation back.\n${restaurantContext}`;
        } else {
             if (restaurantId) {
                 systemContent = `You are 'Dine AI', a helpful, friendly, and polite Restaurant Concierge for a customer. Your job is to answer questions about the provided menu, assist with dining options, and provide excellent customer service. Do NOT provide any information about restaurant management, stock predictions, revenue, or backend operations. Keep your answers concise, appetizing, and focused on the dining experience. If asked about something unrelated to dining or food, politely steer the conversation back.\n${restaurantContext}`;
             } else {
                 systemContent = `You are 'Dine AI', a helpful, friendly, and polite Platform Concierge for the Dine Flow platform. Your job is to help customers discover and select a restaurant from our platform. Do NOT provide any information about restaurant management, stock predictions, revenue, or backend operations. Keep your answers concise and focused on helping them choose a restaurant. If asked about something unrelated to dining or restaurants, politely steer the conversation back.\n${restaurantContext}`;
             }
        }

        const systemMessage = {
            role: "system",
            content: systemContent
        };

        const stream = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [systemMessage, ...messages],
            temperature: 0.20,
            top_p: 0.70,
            max_tokens: 512,
            frequency_penalty: 0.00,
            presence_penalty: 0.00,
            stream: true
        });

        let replyContent = '';
        for await (const chunk of stream) {
            replyContent += chunk.choices[0]?.delta?.content || '';
        }

        // Strip thinking tokens if present
        if (replyContent.includes('<think>') && replyContent.includes('</think>')) {
            replyContent = replyContent.replace(/<think>[\s\S]*?<\/think>\n?/g, '').trim();
        }

        res.json({ reply: replyContent });
    } catch (error) {
        console.error('[AI CHAT ERROR]:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to generate chat response. Please check API key and Model limits.' });
    }
});

module.exports = { generateDescription, generateOrderInstructions, getRecommendations, predictInventory, chatWithNvidia, generateFullMenuItem };
