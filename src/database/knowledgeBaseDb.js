const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, './knowledgeBaseDb.db');
const db = new sqlite3.Database(dbPath);

// Function to create table if it does not exist
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

// Function to insert a new row into the database
const insertRowIntoKnowledgeBase = (url, title, content, lastUpdated, author) => {
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

const updateKnowledgebaseDataRow = (url, title, content, lastUpdated, author) => {
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

// Function to store knowledge base data in the database
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
                await updateKnowledgebaseDataRow(url, title, content, lastUpdated, author);
            } else {
                console.log(`Article ${url} does not need to be updated.`);
            }
        } else {
            await insertRowIntoKnowledgeBase(url, title, content, lastUpdated, author);
        }

        return true;
    } catch (err) {
        console.error("Error storing knowledge base data:", err);
        return false;
    }
};

// Function to create table if it does not exist
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

// Function to insert a new embeddings data into the database
const insertRowIntoEmbeddingsData = (knowledgebase_id, embeddings) => {
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

const updateEmbeddingsDataRow = (knowledgebase_id, embeddings) => {
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

const storeKnowledgeBaseEmbeddingsDataInDB = async (data) => {
    let retVal = false;
    const { knowledgebase_id, embeddings } = data;

    try {
        // Ensures the table exists
        await createEmbeddingsTableIfNotExists();

        // Check if the article already exists
        const existingRow = await findEmbeddingsDataRowByknowledgebaseId(knowledgebase_id);

        if (existingRow) {
            const shouldUpdate = (existingRow.embeddings !== embeddings);
            if (shouldUpdate) {
                await updateEmbeddingsDataRow(knowledgebase_id, embeddings);
            } else {
                console.log(`knowledgebase_id ${knowledgebase_id} need not be updated.`);
            }
        } else {
            await insertRowIntoEmbeddingsData(knowledgebase_id, embeddings);
        }
        return true;
    } catch (err) {
        console.error("Error storing embeddings data:", err);
        return false;
    }
}

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