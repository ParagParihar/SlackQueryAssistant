const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, './knowledgeBaseDb.db');
const db = new sqlite3.Database(dbPath);

/**
 * Function to crerate the knowledgebase table if not existing
 * @returns a promise which resolves if created
 */
const createKnowledgeBaseTableIfNotExists = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS knowledgebase (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE,
                title TEXT,
                content TEXT,
                last_updated TEXT,
                author TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                reject();
            } else {
                resolve();
            }
        });
    });
};

/**
 * Funtion to find a row having the passed url in the knowledgebase table
 * @param url which we need to find in knowledgebase table
 * @returns promise which resolves with the row
 */
const findKnowledgeBaseDataRowByUrl = (url) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM knowledgebase WHERE url = ?`, [url], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Funtion to insert a new row in knowledgebase table
 * @param data to be inserted
 * @returns promise which resolves wuth true if inserted
 */
const insertRowIntoKnowledgeBase = (data) => {
    const { url, title, content, lastUpdated, author } = data;
    return new Promise((resolve, reject) => {
        db.run(`
        INSERT INTO knowledgebase (url, title, content, last_updated, author)
        VALUES (?, ?, ?, ?, ?)
      `, [url, title, content, lastUpdated, author], (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Article ${url} inserted.`);
                resolve(true);
            }
        });
    });
};

/**
 * Funtion to updates a given row in knowledgebase table
 * @param data to be inserted
 * @returns promise which resolves wuth true if updated
 */
const updateKnowledgebaseDataRow = (data) => {
    const { url, title, content, lastUpdated, author } = data;
    return new Promise((resolve, reject) => {
        db.run(`
        UPDATE knowledgebase
        SET title = ?, content = ?, last_updated = ?, author = ?
        WHERE url = ?
      `, [title, content, lastUpdated, author, url], (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Article ${url} updated.`);
                resolve(true);
            }
        });
    });
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
const createEmbeddingsTableIfNotExists = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS knowledgebaseEmbeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                knowledgebase_id INTEGER,
                embeddings BLOB,
                FOREIGN KEY (knowledgebase_id) REFERENCES knowledgebase(id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err);
                reject();
            } else {
                resolve();
            }
        });
    });
};

/**
 * Funtion to find a row having the passed knowledgebase_id in the knowledgebaseEmbeddings table
 * @param knowledgebase_id which we need to find in knowledgebaseEmbeddings table
 * @returns promise which resolves with the row
 */
const findEmbeddingsDataRowByknowledgebaseId = (knowledgebase_id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM knowledgebaseEmbeddings WHERE knowledgebase_id = ?`, [knowledgebase_id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Funtion to insert a new row in knowledgebaseEmbeddings table
 * @param data to be inserted
 * @returns promise which resolves wuth true if inserted
 */
const insertRowIntoEmbeddingsData = (data) => {
    const { knowledgebase_id, embeddings } = data;
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO knowledgebaseEmbeddings (knowledgebase_id, embeddings)
            VALUES (?, ?)
        `, [knowledgebase_id, JSON.stringify(embeddings)], (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`knowledgebase_id ${knowledgebase_id} inserted.`);
                resolve(true);
            }
        });
    });
};

/**
 * Funtion to updates a given row in knowledgebaseEmbeddings table
 * @param data to be inserted
 * @returns promise which resolves wuth true if updated
 */
const updateEmbeddingsDataRow = (data) => {
    const { knowledgebase_id, embeddings } = data;
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE knowledgebaseEmbeddings
            SET embeddings = ?
            WHERE knowledgebase_id = ?
        `, [JSON.stringify(embeddings), knowledgebase_id], (err) => {
            if (err) {
                console.log(`knowledgebase_id ${knowledgebase_id} not updated.`);
                reject(err);
            } else {
                console.log(`knowledgebase_id ${knowledgebase_id} updated.`);
                resolve(true);
            }
        });
    });
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
const fetchCompleteKnowledgeBase = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM knowledgebase`, [], (err, rows) => {
            if (err) {
                reject("Error fetching data: " + err.message);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Function to fetch all the rows of the knowledgebaseEmbeddings table
 * @returns promise which resolves with rows
 */
const fetchCompleteKnowledgeBaseEmbeddings = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM knowledgebaseEmbeddings`, [], (err, rows) => {
            if (err) {
                reject("Error fetching data: " + err.message);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Function to return row of knowledgebase based on knowledgebaseId
 * @param knowledgebaseId used to find the row
 * @returns Promise which resolves with the row
 */
const getKnowledgeBaseDataById = (knowledgebaseId) => {
    return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM knowledgebase WHERE id = ?`;

        // Execute the query
        db.get(selectQuery, [knowledgebaseId], (err, row) => {
            if (err) {
                reject("Error fetching knowledgebase data: " + err.message);
            } else if (row) {
                resolve(row);
            } else {
                resolve(null);
            }
        });
    });
};

module.exports = {
    storeKnowledgeBaseDataInDB,
    fetchCompleteKnowledgeBase,
    storeKnowledgeBaseEmbeddingsDataInDB,
    fetchCompleteKnowledgeBaseEmbeddings,
    getKnowledgeBaseDataById
};