require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Explain how AI works in a few words",
        });
        console.log('Text:', response.text);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
