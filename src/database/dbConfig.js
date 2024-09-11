const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../.env')
});
const { Pool } = require('pg');

// create a connection setup to database
const pool = new Pool({
    user: process.env.POSTGRESQL_DB_USER,
    host: process.env.POSTGRESQL_DB_HOST,
    database: process.env.POSTGRESQL_DB_DATABASE,
    password: process.env.POSTGRESQL_DB_PASSWORD,
    port: process.env.POSTGRESQL_DB_PORT,
});

module.exports = pool;