const { GoogleGenAI } = require("@google/genai");
const asyncHandler = require('express-async-handler');

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: 'v1'
});

// @desc    Generate menu item description
// @route   POST /api/ai/generate-description
// @access  Private/Admin
const generateDescription = asyncHandler(async (req, res) => {
    const { name, category } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please provide a menu item name');
    }

    try {
        const result = await ai.models.generateContent({
            model: "models/gemini-2.5-flash",
            contents: `You are a gourmet food critic and menu writer. Write a short, appetizing description (max 2 sentences) for the following menu item. Item: ${name}, Category: ${category || 'Main Course'}`
        });

        const text = result.candidates[0].content.parts[0].text.trim();

        res.json({ description: text });
    } catch (error) {
        console.error('GEMINI API ERROR (Description):', error.message);
        res.status(500);
        throw new Error(`AI Generation failed: ${error.message}`);
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

    try {
        const result = await ai.models.generateContent({
            model: "models/gemini-2.5-flash",
            contents: `You are a helpful restaurant assistant. Convert the user's rough notes into polite, clear special instructions for the kitchen. Notes: ${prompt}`
        });
        const text = result.candidates[0].content.parts[0].text.trim();

        res.json({ instructions: text });
    } catch (error) {
        console.error('GEMINI API ERROR (Instructions):', error.message);
        res.status(500);
        throw new Error(`AI Generation failed: ${error.message}`);
    }
});

const Order = require('../models/Order');
const Menu = require('../models/Menu');

// @desc    Generate personalized recommendations
// @route   POST /api/ai/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    // 1. Fetch user's order history (limited to last 20 items for context)
    const userOrders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('items.menuItem');

    const historyNames = userOrders.flatMap(order =>
        order.items.map(item => item.name)
    ).slice(0, 15);

    // 2. Fetch available menu
    const menuItems = await Menu.find({ isAvailable: true }).select('name category description');
    const menuText = menuItems.map(item => `- ${item.name} (${item.category}): ${item.description}`).join('\n');

    const prompt = `
        User's Order History: ${historyNames.length > 0 ? historyNames.join(', ') : 'No history yet'}
        Full Menu:
        ${menuText}

        Based on the user's history, suggest exactly 3 items they should try next from the menu. 
        Format your response as a JSON array of item names only. 
        Example: ["Pizza", "Pasta", "Salad"]
        If there's no history, suggest 3 popular diverse items.
    `;

    try {
        const result = await ai.models.generateContent({
            model: "models/gemini-2.5-flash",
            contents: prompt
        });
        const text = result.candidates[0].content.parts[0].text.trim();
        // Extract JSON array from response
        const jsonMatch = text.match(/\[.*\]/s);
        const recommendationsNames = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        // Fetch full item details for the recommended names
        const recommendations = await Menu.find({
            name: { $in: recommendationsNames },
            isAvailable: true
        }).limit(3);

        res.json(recommendations);
    } catch (error) {
        console.error('GEMINI API ERROR (Recommendations):', error.message);
        res.status(500);
        throw new Error(`AI Recommendation failed: ${error.message}`);
    }
});

// @desc    Predict inventory needs based on stock and orders
// @route   POST /api/ai/predict-inventory
// @access  Private/Admin
const predictInventory = asyncHandler(async (req, res) => {
    const menuItems = await Menu.find({}).select('name stock category description');

    // Fetch last 100 orders to see what's selling
    const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(100);

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
        Context: Restaurant Inventory Prediction.
        Current Inventory & Recent Sales (last 100 orders):
        ${JSON.stringify(inventoryData)}

        Analyze this data and identify up to 3 items that are "High Risk" of running out soon. 
        Consider low stock + high sales volume.
        Provide a brief (1 sentence) recommendation for each at-risk item.
        Respond in JSON format: [{"name": "Item Name", "risk": "High/Medium", "reason": "...", "recommendation": "..."}]
    `;

    try {
        const result = await ai.models.generateContent({
            model: "models/gemini-2.5-flash",
            contents: prompt
        });
        const text = result.candidates[0].content.parts[0].text.trim();
        const jsonMatch = text.match(/\[.*\]/s);
        const prediction = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        res.json(prediction);
    } catch (error) {
        console.error('GEMINI API ERROR (Inventory):', error.message);
        res.status(500);
        throw new Error(`Inventory Prediction failed: ${error.message}`);
    }
});

module.exports = { generateDescription, generateOrderInstructions, getRecommendations, predictInventory };
