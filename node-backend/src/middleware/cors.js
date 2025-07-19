const cors = require('cors');

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://347c218b-c3f1-4362-b557-999679b43c69.preview.emergentagent.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

module.exports = cors(corsOptions);