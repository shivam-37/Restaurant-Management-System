const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const test = async () => {
    try {
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: 'v1' });
        const m = 'models/gemini-2.5-flash';

        console.log(`Trying model: ${m}...`);
        const res = await client.models.generateContent({
            model: m,
            contents: "Hi"
        });

        console.log('Keys of res:', Object.keys(res));
        console.log('Response structure:', JSON.stringify(res, null, 2));

        if (res.response && typeof res.response.text === 'function') {
            console.log('Text:', res.response.text());
        }

    } catch (err) {
        console.error('ERROR:', err.message);
    }
};

test();
