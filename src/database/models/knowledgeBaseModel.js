const { DataTypes } = require('sequelize');

/**
 * Utility helps in defining ORM for KnowledgeBase
 * @param sequelize used to define knowledgebase table
 * @returns KnowledgeBase table model
 */
module.exports = (sequelize) => {
    const KnowledgeBase = sequelize.define('KnowledgeBase', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        url: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        last_updated: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: 'KnowledgeBase',
        timestamps: true,
    });

    return KnowledgeBase;
};
