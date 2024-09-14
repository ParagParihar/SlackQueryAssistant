const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const dbType = process.env.DB_TYPE || 'sqlite';

// db configurations to be utilized while initializing sequelize
const config = {
    sqlite: {
        dialect: 'sqlite',
        storage: path.join(__dirname, '../db/knowledgeBaseDb.db'),
    },
    postgresql: {
        dialect: 'postgres',
        host: process.env.POSTGRESQL_DB_HOST,
        database: process.env.POSTGRESQL_DB_DATABASE,
        username: process.env.POSTGRESQL_DB_USER,
        password: process.env.POSTGRESQL_DB_PASSWORD,
        port: process.env.POSTGRESQL_DB_PORT,
    },
    current: dbType === 'postgresql' ? 'postgresql' : 'sqlite',
};

module.exports = config;
