require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function main() {
    const ai = new GoogleGenAI();
    try {
        const models = await ai.models.list();
        console.log('Available Models:', models.map(m => m.name));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
