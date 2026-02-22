require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function main() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ parts: [{ text: "Explain how AI works in a few words" }] }],
        });
        console.log('Text:', response.text);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
