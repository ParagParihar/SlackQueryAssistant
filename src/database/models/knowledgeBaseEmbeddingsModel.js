const { DataTypes } = require('sequelize');

/**
 * Utility helps in defining ORM for KnowledgeBaseEmbeddings
 * @param sequelize used to define KnowledgeBaseEmbeddings table
 * @returns KnowledgeBaseEmbeddings table model
 */
module.exports = (sequelize) => {
    const KnowledgeBaseEmbeddings = sequelize.define('KnowledgeBaseEmbeddings', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        knowledgebase_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'KnowledgeBase',
                key: 'id',
            },
        },
        embeddings: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        tableName: 'KnowledgeBaseEmbeddings',
        // timestamps: true,
    });

    return KnowledgeBaseEmbeddings;
};
