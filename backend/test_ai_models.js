const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const test = async () => {
    try {
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1' });

        const modelsToTry = [
            'models/gemini-2.5-flash',
            'models/gemini-2.5-pro',
            'models/gemini-2.0-flash',
            'models/gemini-2.0-flash-001',
            'models/gemini-2.0-flash-lite-001',
            'models/gemini-2.0-flash-lite',
            'models/gemini-2.5-flash-lite'
        ];

        for (const m of modelsToTry) {
            console.log(`Trying model: ${m}...`);
            try {
                const res = await client.models.generateContent({
                    model: m,
                    contents: "Hi"
                });
                console.log(`SUCCESS with ${m}!`);
                return;
            } catch (e) {
                console.log(`FAILED with ${m}: ${e.message.substring(0, 100)}...`);
            }
        }

    } catch (err) {
        console.error('ERROR:', err.message);
    }
};

test();
