require('dotenv').config();

module.exports = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  SSL_CA: process.env.SSL_CA
};
console.log('Loaded env:', process.env.DB_HOST, process.env.DB_USER);
