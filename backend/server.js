const path = require('path');
const dotenv = require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 5001;

connectDB();

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
