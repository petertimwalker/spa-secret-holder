const express = require('express');
const app = express();
const dotenv = require('dotenv');
const booksRouter = require('./books');
const cors = require('cors');
app.use(cors());
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? 443 : 3001;

// Store your API key securely in an environment variable
const API_KEY = process.env.API_KEY || 'API_KEY not defined';

// Middleware to log requests to the terminal
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Route for the root URL '/'
app.get('/', (req, res) => {
  res.send('Hi from api.peterwalker.xyz');
});

// Route for '/api/key'
app.get('/api/key', (req, res) => {
  res.json({ apiKey: API_KEY });
});

app.use('/api/books', booksRouter);

if (isProduction) {
  const https = require('https');
  const fs = require('fs');

  app.use(
    cors({
      origin: 'https://peterwalker.xyz',
    }),
  );

  const options = {
    key: fs.readFileSync(
      '/etc/letsencrypt/live/api.peterwalker.xyz/privkey.pem',
    ),
    cert: fs.readFileSync('/etc/letsencrypt/live/api.peterwalker.xyz/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/api.peterwalker.xyz/chain.pem'),
  };

  https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
  });
} else {
  const http = require('http');

  http.createServer(app).listen(PORT, () => {
    console.log(`HTTP Server is running on port ${PORT}`);
  });
}
