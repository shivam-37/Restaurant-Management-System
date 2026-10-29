const asyncHandler = require('express-async-handler');
const AIAnalytics = require('../models/AIAnalytics');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const InventoryItem = require('../models/InventoryItem');

// ── Rate limiter configuration ──────────────────────────────────────────────
let lastCallTime = 0;
const MIN_INTERVAL_MS = 1500;

// ── Multi-Provider AI Resolver ──────────────────────────────────────────────
const getAIProviders = () => {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });

    const providers = [];

    // 1. Google Gemini (OpenAI-compatible endpoint)
    if (process.env.GEMINI_API_KEY) {
        providers.push({
            name: 'Gemini',
            apiKey: process.env.GEMINI_API_KEY,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
            model: process.env.AI_MODEL || 'gemini-1.5-flash'
        });
    }

    // 2. Groq (High-speed OpenAI-compatible endpoint)
    if (process.env.GROQ_API_KEY) {
        providers.push({
            name: 'Groq',
            apiKey: process.env.GROQ_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1',
            model: process.env.AI_MODEL || 'llama-3.3-70b-versatile'
        });
    }

    // 3. OpenAI
    if (process.env.OPENAI_API_KEY) {
        providers.push({
            name: 'OpenAI',
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: 'https://api.openai.com/v1',
            model: process.env.AI_MODEL || 'gpt-4o-mini'
        });
    }

    // 4. OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
        providers.push({
            name: 'OpenRouter',
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: 'https://openrouter.ai/api/v1',
            model: process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct'
        });
    }

    // 5. NVIDIA NIM (Active models: meta/llama-3.2-11b-vision-instruct, mistralai/mistral-7b-instruct-v0.3)
    if (process.env.NVIDIA_API_KEY) {
        providers.push({
            name: 'NVIDIA',
            apiKey: process.env.NVIDIA_API_KEY,
            baseURL: 'https://integrate.api.nvidia.com/v1',
            model: process.env.AI_MODEL || 'meta/llama-3.2-11b-vision-instruct'
        });
    }

    // 6. Custom AI Provider
    if (process.env.AI_API_KEY && process.env.AI_BASE_URL) {
        providers.push({
            name: 'Custom',
            apiKey: process.env.AI_API_KEY,
            baseURL: process.env.AI_BASE_URL,
            model: process.env.AI_MODEL || 'gpt-4o-mini'
        });
    }

    // 7. Built-in Free Cloud Fallback (Zero key required, OpenAI compatible)
    providers.push({
        name: 'Pollinations-Free',
        apiKey: 'dummy-key',
        baseURL: 'https://text.pollinations.ai/openai',
        model: 'openai'
    });

    return providers;
};

// ── Unified Multi-Provider Execution with Automatic Fallback ────────────────
const rateLimitedAICall = async (prompt, systemPrompt = "You are a backend restaurant AI. Maintain a highly professional, gourmet tone. For array or JSON answers, output strictly JSON without markdown tags.") => {
    const now = Date.now();
    const timeSinceLast = now - lastCallTime;
    if (timeSinceLast < MIN_INTERVAL_MS) {
        await new Promise(r => setTimeout(r, MIN_INTERVAL_MS - timeSinceLast));
    }
    lastCallTime = Date.now();

    const providers = getAIProviders();
    let lastError = null;

    for (const provider of providers) {
        try {
            const client = new OpenAI({
                apiKey: provider.apiKey,
                baseURL: provider.baseURL,
                timeout: 12000
            });

            const stream = await client.chat.completions.create({
                model: provider.model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                temperature: 0.20,
                max_tokens: 512,
                stream: true
            });

            let text = '';
            for await (const chunk of stream) {
                text += chunk.choices[0]?.delta?.content || '';
            }

            if (text.includes('<think>') && text.includes('</think>')) {
                text = text.replace(/<think>[\s\S]*?<\/think>\n?/g, '');
            }

            text = text.trim();
            if (text) {
                return text;
            }
        } catch (error) {
            console.warn(`[AI Provider ${provider.name}]: ${error.status || error.message}. Trying fallback...`);
            lastError = error;
        }
    }

    throw lastError || new Error('All AI providers failed');
};

// ── Cache helpers ────────────────────────────────────────────────────────────
const getCache = async (type, identifier) => {
    try {
        const cached = await AIAnalytics.findOne({
            type,
            identifier,
            expiresAt: { $gt: new Date() }
        });
        return cached?.data || null;
    } catch {
        return null;
    }
};

const setCache = async (type, identifier, data, ttlHours = 24) => {
    try {
        const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
        await AIAnalytics.findOneAndUpdate(
            { type, identifier },
            { type, identifier, data, expiresAt },
            { upsert: true, returnDocument: 'after' }
        );
    } catch (e) {
        console.error('Failed to set AI cache:', e.message);
    }
};

// ── Local Fallback Helpers ──────────────────────────────────────────────────
const descriptionFallback = (name, category) => {
    const descriptors = {
        'Appetizer': 'Crispy, flavorful bite crafted with fresh seasonal ingredients and aromatic herbs, perfect for beginning your meal.',
        'Main Course': 'Artisanal culinary preparation featuring premium ingredients, cooked to perfection and served with harmonious seasonings.',
        'Dessert': 'Decadent, house-crafted sweet delight balanced with luscious textures and elegant gourmet presentation.',
        'Beverage': 'Refreshing and invigorating drink curated to cleanse the palate and pair seamlessly with our culinary offerings.'
    };
    const desc = descriptors[category] || 'Freshly prepared to order using authentic gourmet recipes and finest local ingredients.';
    return `${name} — ${desc}`;
};

const calculateSmartStockPredictions = (rawMaterials = [], menuItems = [], recentOrders = []) => {
    // 1. Calculate dish sales volume
    const dishSales = {};
    recentOrders.forEach(order => {
        (order.items || []).forEach(item => {
            const name = item.name || item.menuItem?.name;
            if (name) {
                dishSales[name] = (dishSales[name] || 0) + (item.quantity || 1);
            }
        });
    });

    // 2. Calculate ingredient consumption based on recipes
    const ingredientBurn = {};
    menuItems.forEach(item => {
        const sales = dishSales[item.name] || 0;
        if (sales > 0 && Array.isArray(item.recipe)) {
            item.recipe.forEach(r => {
                const ingId = (r.ingredient?._id || r.ingredient)?.toString();
                if (ingId) {
                    ingredientBurn[ingId] = (ingredientBurn[ingId] || 0) + (Number(r.amountNeeded) || 1) * sales;
                }
            });
        }
    });

    const risks = [];

    // 3. Evaluate raw material ingredients from pantry
    rawMaterials.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const threshold = Number(item.lowStockThreshold) || 10;
        const burn = ingredientBurn[item._id.toString()] || 0;

        if (qty <= threshold) {
            risks.push({
                name: `${item.name} (Ingredient)`,
                risk: 'High',
                priority: 1,
                reason: `Pantry stock is critical at ${qty} ${item.unit} (alert threshold: ${threshold} ${item.unit})${burn > 0 ? ` with ${burn} ${item.unit} consumed in recent orders` : ''}.`,
                recommendation: `Urgent: Restock at least ${Math.ceil(threshold * 3)} ${item.unit} of ${item.name} immediately to avoid kitchen stockouts.`
            });
        } else if (qty <= threshold * 3 || (burn > 0 && qty < burn * 2.5)) {
            risks.push({
                name: `${item.name} (Ingredient)`,
                risk: 'Medium',
                priority: 2,
                reason: `Current stock is ${qty} ${item.unit} (threshold: ${threshold} ${item.unit}). Usage is high across active menu recipes.`,
                recommendation: `Order ${Math.ceil(threshold * 2)} ${item.unit} of ${item.name} within 48 hours to maintain kitchen buffer.`
            });
        }
    });

    // 4. Evaluate prepared menu dishes
    menuItems.forEach(item => {
        const stock = Number(item.stock) || 0;
        const sales = dishSales[item.name] || 0;

        if (stock <= 5) {
            risks.push({
                name: item.name,
                risk: 'High',
                priority: 1,
                reason: `Only ${stock} portions available with ${sales} recent sales recorded.`,
                recommendation: `Prepare a fresh batch of ${item.name} immediately to fulfill incoming orders.`
            });
        } else if (stock <= sales * 4 || stock <= 30) {
            risks.push({
                name: item.name,
                risk: 'Medium',
                priority: 2,
                reason: `Stock is ${stock} portions with strong recent customer demand (${sales} ordered recently).`,
                recommendation: `Monitor sales rate and prep ingredients before peak dining periods.`
            });
        }
    });

    // 5. If still fewer than 3 risks, highlight highest velocity menu items
    if (risks.length < 3) {
        const sortedBySales = [...menuItems].sort((a, b) => (dishSales[b.name] || 0) - (dishSales[a.name] || 0));
        for (const item of sortedBySales) {
            if (risks.some(r => r.name === item.name || r.name.startsWith(item.name))) continue;
            const sales = dishSales[item.name] || 0;
            const stock = Number(item.stock) || 0;
            risks.push({
                name: item.name,
                risk: stock < 100 ? 'Medium' : 'Low',
                priority: 3,
                reason: `Popular item with ${sales} recent orders. Current stock of ${stock} portions will require regular monitoring.`,
                recommendation: `Keep recipe ingredients ready and schedule regular kitchen restocks.`
            });
            if (risks.length >= 3) break;
        }
    }

    risks.sort((a, b) => a.priority - b.priority);
    return risks.slice(0, 3).map(({ priority, ...rest }) => rest);
};

const generateSmartGridTables = (numTables = 8, capacity = 4) => {
    const tables = [];
    const cols = Math.min(Math.ceil(Math.sqrt(numTables * 1.3)), 5);
    const rows = Math.ceil(numTables / cols);
    const xStep = Math.floor(75 / (cols > 1 ? cols - 1 : 1));
    const yStep = Math.floor(70 / (rows > 1 ? rows - 1 : 1));

    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (count >= numTables) break;
            tables.push({
                number: count + 1,
                capacity: capacity,
                x: 12 + c * xStep,
                y: 15 + r * yStep
            });
            count++;
        }
    }
    return tables;
};

// ── Controllers ──────────────────────────────────────────────────────────────

// @desc    Generate menu item description
// @route   POST /api/ai/generate-description
// @access  Private/Admin
const generateDescription = asyncHandler(async (req, res) => {
    const { name, category } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please provide a menu item name');
    }

    const cacheId = `${name}-${category || 'main'}`.toLowerCase().replace(/\s+/g, '-');

    const cached = await getCache('description', cacheId);
    if (cached) {
        return res.json({ description: cached, cached: true });
    }

    try {
        const text = await rateLimitedAICall(
            `You are a gourmet menu writer. Write a short, appetizing description (max 2 sentences) for: ${name} (${category || 'Main Course'})`
        );
        await setCache('description', cacheId, text, 168);
        res.json({ description: text });
    } catch (error) {
        console.error('[AI FALLBACK] description:', error.message);
        const fallback = descriptionFallback(name, category);
        res.json({ description: fallback, fallback: true });
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
        const text = await rateLimitedAICall(
            `You are a restaurant assistant. Convert these rough notes into concise, polite kitchen instructions in 1-2 sentences: ${prompt}`
        );
        res.json({ instructions: text });
    } catch (error) {
        console.error('[AI FALLBACK] instructions:', error.message);
        res.json({ instructions: prompt, fallback: true });
    }
});

// @desc    Generate personalized recommendations
// @route   POST /api/ai/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    const { restaurantId } = req.body;
    const userId = req.user ? req.user._id.toString() : 'guest';
    const cacheId = `${userId}-${restaurantId || 'all'}`;

    const cached = await getCache('recommendation', cacheId);
    if (cached) {
        return res.json(cached);
    }

    const query = req.user ? { user: req.user._id } : {};
    if (restaurantId) query.restaurant = restaurantId;

    let historyNames = [];
    if (req.user) {
        const userOrders = await Order.find(query).sort({ createdAt: -1 }).limit(5).populate('items.menuItem');
        historyNames = userOrders.flatMap(o => o.items.map(i => i.name)).slice(0, 15);
    }

    const menuQuery = { isAvailable: true };
    if (restaurantId) menuQuery.restaurant = restaurantId;
    const menuItems = await Menu.find(menuQuery).select('name category description price image');

    if (menuItems.length === 0) return res.json([]);

    const menuText = menuItems.map(i => `- ${i.name} (${i.category})`).join('\n');
    const prompt = `
        User's past orders: ${historyNames.length > 0 ? historyNames.join(', ') : 'None'}
        Menu: ${menuText}
        Suggest exactly 3 menu items the user should try next. Respond ONLY as a JSON array of item names: ["item1","item2","item3"]
    `;

    try {
        const text = await rateLimitedAICall(prompt);
        const jsonMatch = text.match(/\[.*\]/s);
        const names = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        const finalQuery = { name: { $in: names }, isAvailable: true };
        if (restaurantId) finalQuery.restaurant = restaurantId;
        let recommendations = await Menu.find(finalQuery).limit(3);

        if (recommendations.length === 0) {
            recommendations = await Menu.find(menuQuery).limit(3);
        }

        await setCache('recommendation', cacheId, recommendations, 6);
        res.json(recommendations);
    } catch (error) {
        console.error('[AI FALLBACK] recommendations:', error.message);
        const fallbackItems = await Menu.find(menuQuery).limit(3);
        res.json(fallbackItems);
    }
});

// @desc    Predict inventory needs based on stock and orders
// @route   POST /api/ai/predict-inventory
// @access  Private/Admin
const predictInventory = asyncHandler(async (req, res) => {
    let { restaurantId, forceRefresh } = req.body;

    // Resolve restaurant context (handle owner/admin defaults)
    if (!restaurantId && req.user) {
        restaurantId = req.user.restaurant?._id || req.user.restaurant;
    }
    if (!restaurantId) {
        const anyRest = await Restaurant.findOne({});
        if (anyRest) restaurantId = anyRest._id;
    }

    const cacheId = restaurantId ? restaurantId.toString() : 'all';

    // 1. Check cache (only return if non-empty array)
    if (!forceRefresh) {
        const cached = await getCache('inventory-prediction', cacheId);
        if (cached && Array.isArray(cached) && cached.length > 0) {
            return res.json(cached);
        }
    }

    // 2. Fetch raw materials, menu items, and recent orders
    const invQuery = restaurantId ? { restaurant: restaurantId } : {};
    const menuQuery = restaurantId ? { restaurant: restaurantId } : {};
    const orderQuery = restaurantId ? { restaurant: restaurantId } : {};

    const [rawMaterials, menuItems, recentOrders] = await Promise.all([
        InventoryItem.find(invQuery),
        Menu.find(menuQuery).select('name stock category recipe'),
        Order.find(orderQuery).sort({ createdAt: -1 }).limit(100)
    ]);

    const fallbackPredictions = calculateSmartStockPredictions(rawMaterials, menuItems, recentOrders);

    if (fallbackPredictions.length === 0) {
        return res.json([]);
    }

    // 3. Try AI for richer, contextual culinary predictions
    const summaryData = {
        rawIngredients: rawMaterials.map(r => ({ name: r.name, stock: `${r.quantity} ${r.unit}`, threshold: `${r.lowStockThreshold} ${r.unit}` })),
        menuDishes: menuItems.map(m => ({ name: m.name, stock: m.stock })),
        computedPredictions: fallbackPredictions
    };

    const prompt = `
        Restaurant Inventory & Sales Data:
        ${JSON.stringify(summaryData)}

        Analyze this stock data. Output exactly 3 inventory stock risk predictions.
        Focus on items with low stock or high sales burn rate.
        Respond ONLY as a strict JSON array without markdown formatting:
        [
          {
            "name": "Item or Ingredient Name",
            "risk": "High or Medium",
            "reason": "1-2 sentence data-backed reason mentioning current stock or sales",
            "recommendation": "1-2 sentence concrete reorder or kitchen prep action"
          }
        ]
    `;

    try {
        const text = await rateLimitedAICall(prompt);
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        let prediction = null;
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
                prediction = parsed.map(p => ({
                    name: p.name || 'Stock Item',
                    risk: p.risk === 'High' ? 'High' : 'Medium',
                    reason: p.reason || 'Stock is low relative to recent order volume.',
                    recommendation: p.recommendation || 'Reorder from supplier soon.'
                }));
            }
        }

        const finalResult = (prediction && prediction.length > 0) ? prediction : fallbackPredictions;
        if (finalResult.length > 0) {
            await setCache('inventory-prediction', cacheId, finalResult, 6);
        }
        res.json(finalResult);
    } catch (error) {
        console.warn('[AI FALLBACK] inventory:', error.message);
        if (fallbackPredictions.length > 0) {
            await setCache('inventory-prediction', cacheId, fallbackPredictions, 6);
        }
        res.json(fallbackPredictions);
    }
});

// @desc    Generate a complete menu item from a single text prompt
// @route   POST /api/ai/generate-full-item
// @access  Private/Admin
const generateFullMenuItem = asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        res.status(400);
        throw new Error('Please provide a prompt to generate a dish (e.g. "Spicy Mexican Tacos")');
    }

    const aiPrompt = `
        The user wants to add a new menu item based on this request: "${prompt}".
        Generate a complete restaurant menu item profile.
        Output ONLY a rigid JSON object containing:
        {
          "name": "Catchy, appetizing name",
          "description": "1-2 sentence delicious description",
          "category": "Must be exactly one of: 'Appetizer', 'Main Course', 'Dessert', 'Beverage'",
          "imagePrompt": "A highly detailed, comma-separated midjourney-style image prompt for food photography of this exact dish on a beautiful plate, e.g., 'gourmet spicy mexican tacos, professional food photography, dark background, 8k resolution, highly detailed'"
        }
    `;

    try {
        const text = await rateLimitedAICall(aiPrompt);

        let parsedData;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text;
            parsedData = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse AI JSON:", text);
            throw new Error("AI returned malformed data format.");
        }

        const validCategories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];
        if (!validCategories.includes(parsedData.category)) {
            parsedData.category = 'Main Course';
        }

        const safeImagePrompt = encodeURIComponent(parsedData.imagePrompt || `${parsedData.name} plate professional food photography`);
        const image = `https://image.pollinations.ai/prompt/${safeImagePrompt}?width=800&height=600&nologo=true`;

        res.json({
            name: parsedData.name || prompt,
            description: parsedData.description || "Freshly prepared dish.",
            category: parsedData.category,
            price: 0,
            stock: 0,
            image: image
        });

    } catch (error) {
        console.error('[AI FALLBACK] generateFullMenuItem:', error.message);
        
        const lowerPrompt = prompt.toLowerCase();
        let guessedCategory = 'Main Course';
        if (lowerPrompt.includes('drink') || lowerPrompt.includes('tea') || lowerPrompt.includes('coffee') || lowerPrompt.includes('shake') || lowerPrompt.includes('soda') || lowerPrompt.includes('juice')) {
            guessedCategory = 'Beverage';
        } else if (lowerPrompt.includes('cake') || lowerPrompt.includes('ice cream') || lowerPrompt.includes('pastry') || lowerPrompt.includes('pie') || lowerPrompt.includes('dessert') || lowerPrompt.includes('sweet')) {
            guessedCategory = 'Dessert';
        } else if (lowerPrompt.includes('roll') || lowerPrompt.includes('wings') || lowerPrompt.includes('soup') || lowerPrompt.includes('salad') || lowerPrompt.includes('snack') || lowerPrompt.includes('fry') || lowerPrompt.includes('fries') || lowerPrompt.includes('starter')) {
            guessedCategory = 'Appetizer';
        }

        const safeImagePrompt = encodeURIComponent(`${prompt} plate professional gourmet food photography appetizing`);
        const image = `https://image.pollinations.ai/prompt/${safeImagePrompt}?width=800&height=600&nologo=true`;

        res.json({
            name: prompt.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            description: descriptionFallback(prompt, guessedCategory),
            category: guessedCategory,
            price: 0,
            stock: 0,
            image: image
        });
    }
});

// @desc    Process general chat (with multi-provider and robust fallbacks)
// @route   POST /api/ai/chat
// @access  Optional Auth
const chatWithNvidia = asyncHandler(async (req, res) => {
    const { messages, restaurantId } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of messages');
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // 1. Fetch DB Context
    let restaurant = null;
    let menuItems = [];
    let restaurantContext = "";

    if (restaurantId) {
        try {
            restaurant = await Restaurant.findById(restaurantId);
            menuItems = await Menu.find({ restaurant: restaurantId, isAvailable: true }).select('name category description price');
            
            if (restaurant) {
                const menuList = menuItems.length > 0 
                    ? menuItems.map(item => `- ${item.name} (₹${item.price}): ${item.description || item.category}`).join('\n')
                    : 'EMPTY_MENU_NO_ITEMS_AVAILABLE';
                
                restaurantContext = `
You are specifically representing a restaurant named "${restaurant.name}".
Cuisine Type/Description: ${restaurant.cuisine || restaurant.description || 'Not specified'}.

CRITICAL INSTRUCTION: Here is our current live menu. YOU MUST ONLY suggest, recommend, or discuss items from this specific menu. 
If the menu below says "EMPTY_MENU_NO_ITEMS_AVAILABLE", you MUST inform the customer that the menu is currently empty or still being set up, and you CANNOT recommend any dishes.
DO NOT invent, hallucinate, or recommend ANY random items, dishes, or drinks outside of this exact list under ANY circumstances. Do not use generic examples like "Biryani" or "Paneer" unless they are explicitly in the list below.
CRITICAL INSTRUCTION: When mentioning prices, you MUST ALWAYS use the Indian Rupee symbol (₹). Do NOT use dollar signs ($) or any other currency format.

[LIVE MENU START]
${menuList}
[LIVE MENU END]
`;
            }
        } catch (dbErr) {
            console.error('Error fetching restaurant context:', dbErr.message);
        }
    } else {
        try {
            const allRestaurants = await Restaurant.find({}).select('name cuisine description');
            if (allRestaurants.length > 0) {
                const restList = allRestaurants.map(r => `- ${r.name} (${r.cuisine || 'Various'}): ${r.description || 'A great place to dine.'}`).join('\n');
                restaurantContext = `
You are representing the Dine Flow global platform. The user has NOT selected a specific restaurant yet.
Your job is to help the user choose a restaurant from our platform.
Here is the list of available restaurants:
${restList}

CRITICAL INSTRUCTION: Since the user has not selected a restaurant, YOU DO NOT HAVE A MENU YET. 
You MUST NOT recommend any specific dishes, appetizers, or drinks. DO NOT invent or hallucinate any menus.
If the user asks for food recommendations, tell them they must first select a restaurant from the list above.
`;
            } else {
                restaurantContext = `
You are representing the Dine Flow global platform. There are currently no restaurants registered on the platform.
`;
            }
        } catch (dbErr) {
            console.error('Error fetching platform context:', dbErr.message);
        }
    }

    // Determine AI personality based on user role
    let systemContent = "";
    if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
        systemContent = `You are an intelligent, helpful, and polite Restaurant Management Assistant. Your job is to help the restaurant owner/admin manage their business, analyze inventory, understand orders, and generate menu ideas. Keep your answers reasonably concise, professional, and well-organized. If asked about something unrelated to restaurant management, politely steer the conversation back.\n${restaurantContext}`;
    } else {
        if (restaurantId) {
            systemContent = `You are 'Dine AI', a helpful, friendly, and polite Restaurant Concierge for a customer. Your job is to answer questions about the provided menu, assist with dining options, and provide excellent customer service. Do NOT provide any information about restaurant management, stock predictions, revenue, or backend operations. Keep your answers concise, appetizing, and focused on the dining experience. If asked about something unrelated to dining or food, politely steer the conversation back.\n${restaurantContext}`;
        } else {
            systemContent = `You are 'Dine AI', a helpful, friendly, and polite Platform Concierge for the Dine Flow platform. Your job is to help customers discover and select a restaurant from our platform. Do NOT provide any information about restaurant management, stock predictions, revenue, or backend operations. Keep your answers concise and focused on helping them choose a restaurant. If asked about something unrelated to dining or restaurants, politely steer the conversation back.\n${restaurantContext}`;
        }
    }

    const systemMessage = {
        role: "system",
        content: systemContent
    };

    // 2. Try Calling Multi-Provider AI (Gemini -> Groq -> OpenAI -> OpenRouter -> NVIDIA -> Pollinations)
    const providers = getAIProviders();
    let replyContent = '';

    for (const provider of providers) {
        try {
            const client = new OpenAI({
                apiKey: provider.apiKey,
                baseURL: provider.baseURL,
                timeout: 12000
            });

            const stream = await client.chat.completions.create({
                model: provider.model,
                messages: [systemMessage, ...messages],
                temperature: 0.20,
                max_tokens: 512,
                stream: true
            });

            for await (const chunk of stream) {
                replyContent += chunk.choices[0]?.delta?.content || '';
            }

            if (replyContent.includes('<think>') && replyContent.includes('</think>')) {
                replyContent = replyContent.replace(/<think>[\s\S]*?<\/think>\n?/g, '');
            }

            replyContent = replyContent.trim();
            if (replyContent) {
                return res.json({ reply: replyContent });
            }
        } catch (providerError) {
            console.warn(`[AI Chat Provider ${provider.name} Failed]:`, providerError.status || providerError.message);
            replyContent = '';
        }
    }

    // 3. Robust Domain Fallback Engine (Never fail with 500 error!)
    console.log('[AI Chat Fallback Engine Activated]');
    const lowerMsg = lastMessage.toLowerCase();

    // Case A: Table Layout Generation (from Settings.jsx)
    if (/table|layout|floor plan|capacity/i.test(lastMessage) && /JSON/i.test(lastMessage)) {
        const numbers = lastMessage.match(/\d+/g);
        const numTables = numbers && numbers.length > 0 ? parseInt(numbers[0], 10) : 8;
        const capacity = numbers && numbers.length > 1 ? parseInt(numbers[1], 10) : 4;
        const layoutTables = generateSmartGridTables(numTables, capacity);
        return res.json({ reply: JSON.stringify(layoutTables) });
    }

    // Case B: Customer Menu Inquiry with Restaurant Context
    if (restaurant && menuItems.length > 0) {
        if (lowerMsg.includes('drink') || lowerMsg.includes('beverage')) {
            const drinks = menuItems.filter(i => i.category === 'Beverage');
            if (drinks.length > 0) {
                const list = drinks.map(d => `• **${d.name}** (₹${d.price})`).join('\n');
                return res.json({ reply: `Here are the refreshing beverages available at ${restaurant.name}:\n\n${list}\n\nWould you like to add any of these to your order?` });
            }
        }

        if (lowerMsg.includes('dessert') || lowerMsg.includes('sweet')) {
            const desserts = menuItems.filter(i => i.category === 'Dessert');
            if (desserts.length > 0) {
                const list = desserts.map(d => `• **${d.name}** (₹${d.price})`).join('\n');
                return res.json({ reply: `Here are our delectable desserts at ${restaurant.name}:\n\n${list}\n\nSave room for something sweet!` });
            }
        }

        if (lowerMsg.includes('recommend') || lowerMsg.includes('special') || lowerMsg.includes('best') || lowerMsg.includes('popular') || lowerMsg.includes('what should i eat')) {
            const topDishes = menuItems.slice(0, 3);
            const list = topDishes.map(d => `• **${d.name}** (₹${d.price}): ${d.description || d.category}`).join('\n');
            return res.json({ reply: `Welcome to **${restaurant.name}**! Here are our chef's top recommendations today:\n\n${list}\n\nLet me know if you would like more details on any dish!` });
        }

        if (lowerMsg.includes('menu') || lowerMsg.includes('food') || lowerMsg.includes('dish')) {
            const samples = menuItems.slice(0, 4).map(i => `• **${i.name}** (₹${i.price})`).join('\n');
            return res.json({ reply: `At **${restaurant.name}**, we serve delicious ${restaurant.cuisine || 'culinary specialties'}. Here are a few highlights from our live menu:\n\n${samples}\n\nYou can browse our full menu and place orders right from your table!` });
        }

        return res.json({
            reply: `Hello! Welcome to **${restaurant.name}**. I am your Dine AI concierge. Feel free to ask me about our menu items, chef recommendations, or dietary options!`
        });
    }

    // Case C: Platform Inquiries (No restaurant selected)
    if (!restaurantId) {
        try {
            const allRest = await Restaurant.find({}).limit(5).select('name cuisine');
            if (allRest.length > 0) {
                const rList = allRest.map(r => `• **${r.name}** (${r.cuisine || 'Multi-cuisine'})`).join('\n');
                return res.json({
                    reply: `Welcome to **Dine Flow**! We have fantastic restaurants on our platform:\n\n${rList}\n\nPlease select a restaurant to view its live menu and place reservations or orders!`
                });
            }
        } catch {}
    }

    // Default polite hospitality response
    res.json({
        reply: "Hello! I am your Dine Flow AI Assistant. I am here to help you explore our gourmet menus, discover chef recommendations, and assist with your dining experience. How may I serve you today?"
    });
});

// @desc    Generate a single upsell recommendation for the cart
// @route   POST /api/ai/upsell
// @access  Optional Auth (Both guest & authenticated users)
const generateUpsellRecommendation = asyncHandler(async (req, res) => {
    const { cartItems, restaurantId } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !restaurantId) {
        return res.json(null);
    }

    // Gather available menu
    const menuItems = await Menu.find({ restaurant: restaurantId, isAvailable: true }).select('name category price image description');
    if (menuItems.length === 0) return res.json(null);

    // Filter out items already in the cart
    const cartItemNamesLower = cartItems.map(i => (i.name || i.menuItem?.name || '').toLowerCase());
    const availableForUpsell = menuItems.filter(i => !cartItemNamesLower.includes(i.name.toLowerCase()));

    if (availableForUpsell.length === 0) return res.json(null);

    // User's history (safe for guests where req.user is undefined)
    let historyNames = [];
    if (req.user && req.user._id) {
        try {
            const userOrders = await Order.find({ user: req.user._id, restaurant: restaurantId }).sort({ createdAt: -1 }).limit(3).populate('items.menuItem');
            historyNames = userOrders.flatMap(o => o.items.map(i => i.name)).slice(0, 10);
        } catch (e) {
            console.warn('Could not fetch user order history for upsell:', e.message);
        }
    }

    const cartNames = cartItems.map(i => i.name || i.menuItem?.name || 'Item').join(', ');
    const menuText = availableForUpsell.map(i => `- ${i.name} (${i.category}, ₹${i.price})`).join('\n');

    const prompt = `
        User's current cart: ${cartNames}
        User's past orders: ${historyNames.length > 0 ? historyNames.join(', ') : 'None'}
        Available Menu Add-ons: 
        ${menuText}
        
        Suggest exactly ONE high-margin or complimentary menu item from the "Available Menu Add-ons" list that the user should add to their current cart. 
        Respond ONLY as a strict JSON object with two keys: "name" (exact name from the list) and "reason" (a short, appetizing 1-sentence reason to add it).
        Example: {"name": "Garlic Bread", "reason": "It pairs perfectly with your pasta."}
    `;

    try {
        const text = await rateLimitedAICall(prompt);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        
        const suggestion = JSON.parse(jsonMatch[0]);
        const recommendedItem = await Menu.findOne({ name: suggestion.name, restaurant: restaurantId, isAvailable: true });
        
        if (recommendedItem) {
            return res.json({
                item: recommendedItem,
                reason: suggestion.reason
            });
        }
    } catch (error) {
        console.warn('[AI FALLBACK] upsell:', error.message);
    }

    // Smart Domain Fallback: Pair beverages, desserts, or appetizers with the cart
    const beverageOrDessert = availableForUpsell.find(i => i.category === 'Beverage' || i.category === 'Dessert');
    const appetizer = availableForUpsell.find(i => i.category === 'Appetizer');
    const fallbackItem = beverageOrDessert || appetizer || availableForUpsell[0];

    const pairingReasons = {
        'Beverage': `A refreshing beverage to complete your meal.`,
        'Dessert': `The perfect sweet finish to accompany your order.`,
        'Appetizer': `A delicious appetizer to elevate your dining experience.`,
        'Main Course': `One of our chef's highly rated specialties.`
    };

    return res.json({
        item: fallbackItem,
        reason: pairingReasons[fallbackItem.category] || `Chef recommended complement for your current selection.`
    });
});

module.exports = {
    generateDescription,
    generateOrderInstructions,
    getRecommendations,
    predictInventory,
    chatWithNvidia,
    generateFullMenuItem,
    generateUpsellRecommendation
};
