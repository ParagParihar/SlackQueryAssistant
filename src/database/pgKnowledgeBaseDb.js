/**
 * DB file for PostgreSQL db
 * Please make sure any utility added or changed is reflected in SQLite db file aswell
 */
const pool = require('./dbConfig');

/**
 * Function to crerate the knowledgebase table if not existing
 * @returns a promise which resolves if created
 */
const createKnowledgeBaseTableIfNotExists = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS knowledgebase (
                id SERIAL PRIMARY KEY,
                url TEXT UNIQUE NOT NULL,
                title TEXT,
                content TEXT,
                last_updated TEXT,
                author TEXT
            )
        `;
        await pool.query(query);
    } catch (err) {
        console.error('Error creating table:', err);
        throw err;
    }
};

/**
 * Funtion to find a row having the passed url in the knowledgebase table
 * @param url which we need to find in knowledgebase table
 * @returns promise which resolves with the row
 */
const findKnowledgeBaseDataRowByUrl = async (url) => {
    try {
        const query = `SELECT * FROM knowledgebase WHERE url = $1`;
        const result = await pool.query(query, [url]);
        return result.rows[0];
    } catch (err) {
        console.error('Error finding article by URL:', err);
        throw err;
    }
};

/**
 * Funtion to insert a new row in knowledgebase table
 * @param data to be inserted
 * @returns promise which resolves wuth true if inserted
 */
const insertRowIntoKnowledgeBase = async (data) => {
    const { url, title, content, lastUpdated, author } = data;
    try {
        const query = `
            INSERT INTO knowledgebase (url, title, content, last_updated, author)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        await pool.query(query, [url, title, content, lastUpdated, author]);
        console.log(`Article ${url} inserted.`);
    } catch (err) {
        console.error('Error inserting article:', err);
        throw err;
    }
};

/**
 * Funtion to updates a given row in knowledgebase table
 * @param data to be inserted
 * @returns promise which resolves wuth true if updated
 */
const updateKnowledgebaseDataRow = async (data) => {
    const { url, title, content, lastUpdated, author } = data;
    try {
        const query = `
            UPDATE knowledgebase
            SET title = $1, content = $2, last_updated = $3, author = $4
            WHERE url = $5
        `;
        await pool.query(query, [title, content, lastUpdated, author, url]);
        console.log(`Article ${url} updated.`);
    } catch (err) {
        console.error('Error updating article:', err);
        throw err;
    }
};

/**
 * Function to store knowledge base data in the database
 * @param data to be inserted/ updated
 * @returns true if inserted/ updated successfully
 */
const storeKnowledgeBaseDataInDB = async (data) => {
    const { url, title, content, lastUpdated, author } = data;

    try {
        // Ensure the table exists
        await createKnowledgeBaseTableIfNotExists();

        // Check if the article already exists
        const existingRow = await findKnowledgeBaseDataRowByUrl(url);

        if (existingRow) {
            const shouldUpdate = (existingRow.content !== content) || (existingRow.author !== author);

            if (shouldUpdate) {
                await updateKnowledgebaseDataRow(data);
            } else {
                console.log(`Article ${url} does not need to be updated.`);
            }
        } else {
            await insertRowIntoKnowledgeBase(data);
        }

        return true;
    } catch (err) {
        console.error("Error storing knowledge base data:", err);
        return false;
    }
};

/**
 * Function to crerate the knowledgebaseEmbeddings table if not existing
 * @returns a promise which resolves if created
 */
const createEmbeddingsTableIfNotExists = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS knowledgebaseEmbeddings (
                id SERIAL PRIMARY KEY,
                knowledgebase_id INTEGER,
                embeddings TEXT NOT NULL,
                FOREIGN KEY (knowledgebase_id) REFERENCES knowledgebase(id)
            );
        `);
    } catch (err) {
        console.error('Error creating table:', err);
        throw err;
    }
};

/**
 * Funtion to find a row having the passed knowledgebase_id in the knowledgebaseEmbeddings table
 * @param knowledgebase_id which we need to find in knowledgebaseEmbeddings table
 * @returns promise which resolves with the row
 */
const findEmbeddingsDataRowByknowledgebaseId = async (knowledgebase_id) => {
    try {
        const result = await pool.query(`SELECT * FROM knowledgebaseEmbeddings WHERE knowledgebase_id = $1`, [knowledgebase_id]);
        return result.rows[0];  // Return the first row or undefined if not found
    } catch (err) {
        console.error('Error finding row by knowledgebase_id:', err);
        throw err;
    }
};

/**
 * Funtion to insert a new row in knowledgebaseEmbeddings table
 * @param data to be inserted
 * @returns promise which resolves wuth true if inserted
 */
const insertRowIntoEmbeddingsData = async (data) => {
    const { knowledgebase_id, embeddings } = data;
    try {
        await pool.query(
            `INSERT INTO knowledgebaseEmbeddings (knowledgebase_id, embeddings) VALUES ($1, $2)`,
            [knowledgebase_id, JSON.stringify(embeddings)]
        );
        console.log(`knowledgebase_id ${knowledgebase_id} inserted.`);
        return true;
    } catch (err) {
        console.error(`Error inserting knowledgebase_id ${knowledgebase_id}:`, err);
        throw err;
    }
};

/**
 * Funtion to updates a given row in knowledgebaseEmbeddings table
 * @param data to be inserted
 * @returns promise which resolves wuth true if updated
 */
const updateEmbeddingsDataRow = async (data) => {
    const { knowledgebase_id, embeddings } = data;
    try {
        await pool.query(
            `UPDATE knowledgebaseEmbeddings SET embeddings = $1 WHERE knowledgebase_id = $2`,
            [JSON.stringify(embeddings), knowledgebase_id]
        );
        console.log(`knowledgebase_id ${knowledgebase_id} updated.`);
        return true;
    } catch (err) {
        console.error(`Error updating knowledgebase_id ${knowledgebase_id}:`, err);
        throw err;
    }
};


/**
 * Function to store knowledge base embeddings data in the database
 * @param data to be inserted/ updated
 * @returns true if inserted/ updated successfully
 */
const storeKnowledgeBaseEmbeddingsDataInDB = async (data) => {
    const { knowledgebase_id, embeddings } = data;

    try {
        // Ensures the table exists
        await createEmbeddingsTableIfNotExists();

        // Check if the article already exists
        const existingRow = await findEmbeddingsDataRowByknowledgebaseId(knowledgebase_id);

        if (existingRow) {
            const shouldUpdate = (existingRow.embeddings !== embeddings);
            if (shouldUpdate) {
                await updateEmbeddingsDataRow(data);
            } else {
                console.log(`knowledgebase_id ${knowledgebase_id} need not be updated.`);
            }
        } else {
            await insertRowIntoEmbeddingsData(data);
        }
        return true;
    } catch (err) {
        console.error("Error storing embeddings data:", err);
        return false;
    }
}

/**
 * Function to fetch all the rows of the knowledgebase table
 * @returns promise which resolves with rows
 */
const fetchCompleteKnowledgeBase = async () => {
    try {
        const result = await pool.query(`SELECT * FROM knowledgebase`);
        return result.rows;
    } catch (err) {
        console.error('Error fetching complete knowledge base:', err);
        throw err;
    }
};

/**
 * Function to fetch all the rows of the knowledgebaseEmbeddings table
 * @returns promise which resolves with rows
 */
const fetchCompleteKnowledgeBaseEmbeddings = async () => {
    try {
        const result = await pool.query(`SELECT * FROM knowledgebaseEmbeddings`);
        return result.rows;
    } catch (err) {
        console.error('Error fetching complete knowledge base embeddings:', err);
        throw err;
    }
};

/**
 * Function to return row of knowledgebase based on knowledgebaseId
 * @param knowledgebaseId used to find the row
 * @returns Promise which resolves with the row
 */
const getKnowledgeBaseDataById = async (knowledgebaseId) => {
    try {
        const result = await pool.query(`SELECT * FROM knowledgebase WHERE id = $1`, [knowledgebaseId]);
        return result.rows[0] || null;  // Return the first row or null if not found
    } catch (err) {
        console.error('Error fetching knowledge base data by ID:', err);
        throw err;
    }
};

module.exports = {
    storeKnowledgeBaseDataInDB,
    fetchCompleteKnowledgeBase,
    storeKnowledgeBaseEmbeddingsDataInDB,
    fetchCompleteKnowledgeBaseEmbeddings,
    getKnowledgeBaseDataById
};