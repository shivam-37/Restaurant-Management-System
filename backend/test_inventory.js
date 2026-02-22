const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://127.0.0.1:5001/api';

const testInventory = async () => {
    try {
        console.log('--- Testing AI Inventory Predictor ---');

        // Using real admin ID from database
        const adminId = '699b24e8bcef7a47b81f94d3';
        const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const res = await axios.post(`${API_URL}/ai/predict-inventory`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('AI Prediction Result:', JSON.stringify(res.data, null, 2));
        console.log('--- SUCCESS ---');
    } catch (err) {
        console.error('Test Failed:', err.response?.data?.message || err.message);
        if (err.response?.data) console.log('Error Data:', err.response.data);
    }
};

testInventory();
