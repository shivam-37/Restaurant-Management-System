const http = require('http');

const data = JSON.stringify({
  identifier: 'shiwammaxx@gmail.com',
  password: 'password123' // password doesn't matter much if it matches or not, we just want to see if it triggers an error
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
      console.log('Response:', body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
