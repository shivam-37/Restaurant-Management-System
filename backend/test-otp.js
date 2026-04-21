const dotenv = require('dotenv').config({ path: './.env' });
const { sendOtp } = require('./src/controllers/authController');

const req = {
    body: {
        phone: '+911234567890'
    }
};

const res = {
    status: function(s) { this.statusCode = s; return this; },
    json: function(j) { console.log('Response JSON:', j); return this; }
};

const next = (err) => {
    console.error('Next Error:', err.message);
    console.error(err.stack);
};

console.log('Testing sendOtp...');
sendOtp(req, res, next).catch(err => {
    console.error('Caught Async Error:', err.message);
    console.error(err.stack);
});
