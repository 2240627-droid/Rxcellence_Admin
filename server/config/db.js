// filepath: c:\xampp\htdocs\RxcellenceAdmin\server\config\db.js
require('dotenv').config(); // Load environment variables first

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const env = require('./env');

// Build pool configuration from environment variables
const poolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME
};

// Add SSL if certificate path is provided
if (env.SSL_CA) {
  poolConfig.ssl = {
    ca: fs.readFileSync(path.resolve(env.SSL_CA))
  };
}

// Debug log to confirm values are loaded correctly
console.log('DB config:', poolConfig);

const pool = mysql.createPool(poolConfig);

module.exports = pool;
