const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('../config/dbConfig');

const sequelizeConfig = {
    dialect: config.current,
    logging: false,
};

if (config.current === 'sqlite') {
    sequelizeConfig.storage = config.sqlite.storage;
} else if (config.current === 'postgresql') {
    sequelizeConfig.host = config.postgresql.host;
    sequelizeConfig.database = config.postgresql.database;
    sequelizeConfig.username = config.postgresql.username;
    sequelizeConfig.password = config.postgresql.password;
    sequelizeConfig.port = config.postgresql.port;
}

// Initializing Sequelize instance
const sequelize = new Sequelize(sequelizeConfig);

const KnowledgeBase = require('./knowledgeBaseModel')(sequelize);
const KnowledgeBaseEmbeddings = require('./knowledgeBaseEmbeddingsModel')(sequelize);

// defining relations in tables
KnowledgeBase.hasOne(KnowledgeBaseEmbeddings, { foreignKey: 'knowledgebase_id' });
KnowledgeBaseEmbeddings.belongsTo(KnowledgeBase, { foreignKey: 'knowledgebase_id' });

module.exports = {
    sequelize,
    KnowledgeBase,
    KnowledgeBaseEmbeddings,
};
