
/**
 * wrapper to dynamically load the db file based on DB_TYPE
 * if set to postgresql use PostgreSQL DB, else, if nothing is passed fallback to SQLite DB
 */
const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../.env')
});

let database;
if (process.env.DB_TYPE === 'postgresql') {
    database = require('./pgKnowledgeBaseDb'); 
} else { 
    database = require('./knowledgeBaseDb');
} 

module.exports = database;
