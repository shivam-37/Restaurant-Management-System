const { OpenAI } = require('openai');
require('dotenv').config({ path: 'c:\\Users\\shiwa\\OneDrive\\Desktop\\Restaurant-Management-System\\backend\\.env' });

const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1'
});

async function run() {
    const stream = await openai.chat.completions.create({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [
            { role: 'system', content: 'You are a backend restaurant AI. Maintain a highly professional, gourmet tone. For array or JSON answers, output strictly JSON without markdown tags.' },
            { role: 'user', content: 'The user wants to add a new menu item based on this request: "Butter Chicken". Generate a complete restaurant menu item profile. Output ONLY a rigid JSON object containing: { "name": "Catchy, appetizing name", "description": "1-2 sentence delicious description", "category": "Must be exactly one of: \'Appetizer\', \'Main Course\', \'Dessert\', \'Beverage\'", "imagePrompt": "A highly detailed, comma-separated midjourney-style image prompt for food photography of this exact dish on a beautiful plate, e.g., \'gourmet spicy mexican tacos, professional food photography, dark background, 8k resolution, highly detailed\'" }' }
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 512,
        stream: false
    });
    console.log(stream.choices[0].message.content);
}

run().catch(console.error);
