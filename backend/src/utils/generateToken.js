const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

module.exports = generateToken;
