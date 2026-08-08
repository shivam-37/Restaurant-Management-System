const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');


const createOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        res.status(400);
        throw new Error('Please provide an amount');
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        res.status(500);
        throw new Error('Razorpay keys are not configured on the server');
    }

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: Math.round(amount * 100), 
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
    };

    try {
        const order = await instance.orders.create(options);
        res.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID 
        });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500);
        throw new Error('Failed to create Razorpay order');
    }
});


const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400);
        throw new Error('Missing payment verification details');
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        
        res.json({
            success: true,
            message: "Payment verified successfully"
        });
    } else {
        res.status(400);
        throw new Error('Invalid signature. Payment verification failed.');
    }
});

module.exports = {
    createOrder,
    verifyPayment
};
