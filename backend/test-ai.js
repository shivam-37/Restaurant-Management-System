const dotenv = require('dotenv');
dotenv.config();

async function testAI() {
    console.log("Starting fetch...");
    try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "deepseek-ai/deepseek-v3.2",
                messages: [{ role: "user", content: "Say hello!" }],
                temperature: 0.60,
                max_tokens: 100,
                stream: false
            })
        });

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch(e) {
        console.error("Fetch failed:", e);
    }
}
testAI();
