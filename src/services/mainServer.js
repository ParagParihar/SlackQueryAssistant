const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../.env')
});
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { stopService } = require('../utilities/processManagerUtility');
const Constants = require('../config/const');

const app = express();
app.use(bodyParser.json());

let scrapingComplete = false;
let embeddingComplete = false;

// Start services when main server starts
async function startServices() {
    console.log('Starting all services...');

    // Start the scraping service
    axios.post(`http://localhost:${process.env.DATA_SCRAPING_SERVICE_PORT}/scrape-start`);
    console.log('Scraping service started.');
}

// Endpoint for scraping service to notify completion
app.post('/notify/scraping-complete', async (req, res) => {
    scrapingComplete = true;
    console.log('Scraping completed.');

    // Now start the embedding service
    if (scrapingComplete) {
        axios.post(`http://localhost:${process.env.EMBEDDING_GENERATION_SERVICE_PORT}/embeddings-start`);
        console.log('Embedding service started.');
    }

    // stop the service as not needed anymore
    await stopService(Constants.SCRAPING_SERVICE_NAME);

    res.status(200).send('Scraping acknowledged by main server.');
});

// Endpoint for embedding service to notify completion
app.post('/notify/embedding-generation-complete', async (req, res) => {
    embeddingComplete = true;
    console.log('Embedding completed.');

    // Notify the Slack bot service to start processing queued messages
    if (embeddingComplete) {
        axios.post(`http://localhost:${process.env.SLACK_BOT_SERVICE_PORT}/notify`);
        console.log('Slack bot service notified.');
    }

    // stop the service as not needed anymore
    await stopService(Constants.EMBEDDING_SERVICE_NAME);

    res.status(200).send('Embedding acknowledged by main server.');
});

app.listen(process.env.MAIN_SERVER_PORT, () => {
    console.log(`Main server running on port ${process.env.MAIN_SERVER_PORT}.`);
    startServices();
});
