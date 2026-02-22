const { GoogleGenAI } = require("@google/genai");
const asyncHandler = require('express-async-handler');

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

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
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a gourmet food critic and menu writer. Write a short, appetizing description (max 2 sentences) for the following menu item. Item: ${name}, Category: ${category || 'Main Course'}`
        });

        res.json({ description: response.text.trim() });
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
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a helpful restaurant assistant. Convert the user's rough notes into polite, clear special instructions for the kitchen. Notes: ${prompt}`
        });

        res.json({ instructions: response.text.trim() });
    } catch (error) {
        console.error('GEMINI API ERROR (Instructions):', error.message);
        res.status(500);
        throw new Error(`AI Generation failed: ${error.message}`);
    }
});

module.exports = { generateDescription, generateOrderInstructions };
