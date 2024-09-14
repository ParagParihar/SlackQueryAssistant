const { KnowledgeBase, KnowledgeBaseEmbeddings, sequelize } = require('../models/initialize');

/**
 * Function to create & initialize the tables if not existing
 */
const createTablesIfNotExist = async () => {
    try {
        // Makes sure all database models are created, if not existing
        await sequelize.sync();
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

/**
 * Function to store knowledge base data in the database
 * @param data to be inserted/ updated
 * @returns true if inserted/ updated successfully
 */
const storeKnowledgeBaseDataInDB = async (data) => {
    try {
        const { url, title, content, lastUpdated, author } = data;
        await createTablesIfNotExist();

        // Check if the url already exists
        const existingRow = await KnowledgeBase.findOne({
            where: { url }
        });

        if(existingRow) {
            const shouldUpdate = existingRow.title !== title || existingRow.content !== content || existingRow.author !== author;
            if(!shouldUpdate) {
                console.log(`Article ${url} does not need to be updated.`);
                return true;
            }
        }
        // Upsert knowledge base data
        const [row, created] = await KnowledgeBase.upsert({
            url,
            title,
            content,
            last_updated: lastUpdated,
            author,
        });

        if (created) {
            console.log(`Article ${url} inserted.`);
        } else {
            console.log(`Article ${url} updated.`);
        }

        return true;
    } catch (error) {
        console.error('Error storing knowledge base data:', error);
        return false;
    }
};

/**
 * Function to store knowledge base embeddings data in the database
 * @param data to be inserted/ updated
 * @returns true if inserted/ updated successfully
 */
const storeKnowledgeBaseEmbeddingsDataInDB = async (data) => {
    try {
        const { knowledgebase_id, embeddings } = data;
        await createTablesIfNotExist();

        // Check if the knowledgebase_id already exists
        const existingRow = await KnowledgeBaseEmbeddings.findOne({
            where: { knowledgebase_id }
        });

        const jsonEmbeddings = JSON.stringify(embeddings);

        if(existingRow) {
            const shouldUpdate = existingRow.embeddings !== jsonEmbeddings;
            if(!shouldUpdate) {
                console.log(`knowledgebase_id ${knowledgebase_id} need not be updated.`);
                return true;
            }
        }

        const [row, created] = await KnowledgeBaseEmbeddings.upsert({
            knowledgebase_id,
            embeddings: jsonEmbeddings,
        });

        if (created) {
            console.log(`knowledgebase_id ${knowledgebase_id} inserted.`);
        } else {
            console.log(`knowledgebase_id ${knowledgebase_id} updated.`);
        }

        return row;
    } catch (error) {
        console.error('Error storing embeddings data:', error);
        return false;
    }
};

/**
 * Function to fetch all the rows of the knowledgebase table
 * @returns knowledgebase rows
 */
const fetchCompleteKnowledgeBase = async () => {
    try {
        const rows = await KnowledgeBase.findAll();
        return rows;
    } catch (error) {
        console.error('Error fetching knowledge base data:', error);
        throw error;
    }
};

/**
 * Function to fetch all the rows of the knowledgebaseEmbeddings table
 * @returns KnowledgeBaseEmbeddings rows
 */
const fetchCompleteKnowledgeBaseEmbeddings = async () => {
    try {
        const rows = await KnowledgeBaseEmbeddings.findAll();
        return rows;
    } catch (error) {
        console.error('Error fetching embeddings data:', error);
        throw error;
    }
};

/**
 * Function to return row of knowledgebase based on knowledgebaseId
 * @param knowledgebaseId used to find the row
 * @returns row data having passed knowledgebaseId
 */
const getKnowledgeBaseDataById = async (knowledgebaseId) => {
    try {
        const row = await KnowledgeBase.findByPk(knowledgebaseId);
        return row;
    } catch (error) {
        console.error('Error fetching knowledge base data by ID:', error);
        throw error;
    }
};

module.exports = {
    storeKnowledgeBaseDataInDB,
    fetchCompleteKnowledgeBase,
    storeKnowledgeBaseEmbeddingsDataInDB,
    fetchCompleteKnowledgeBaseEmbeddings,
    getKnowledgeBaseDataById,
};
