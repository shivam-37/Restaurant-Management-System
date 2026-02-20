const path = require('path');
const dotenv = require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
