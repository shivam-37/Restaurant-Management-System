const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
require('dotenv').config();

const test = async () => {
    try {
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1' });
        const res = await client.models.list();
        const modelNames = (res.models || res.pageInternal || []).map(m => m.name);
        fs.writeFileSync('available_models.txt', modelNames.join('\n'));
        console.log(`Saved ${modelNames.length} models to available_models.txt`);
    } catch (err) {
        console.error('ERROR:', err.message);
    }
};

test();
