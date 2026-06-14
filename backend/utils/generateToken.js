const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'rentora_secret_key_123', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
