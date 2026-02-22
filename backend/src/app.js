const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');

const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', { value: req.query, writable: true, enumerable: true, configurable: true });
    Object.defineProperty(req, 'params', { value: req.params, writable: true, enumerable: true, configurable: true });
    next();
});

app.use(helmet());
// app.use(xss());
app.use(mongoSanitize());
// app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500 // Increased for development
});
// app.use(limiter);

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Restaurant Management System API' });
});

app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

app.use(errorHandler);

module.exports = app;
