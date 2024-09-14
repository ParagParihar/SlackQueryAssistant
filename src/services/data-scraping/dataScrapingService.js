const express = require('express');
const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../../.env')
});
const bodyParser = require('body-parser');
const axios = require('axios');
const { storeKnowledgeBaseDataInDB } = require('../../database/services/dbServices.js');
const { getSectionUrls, getArticleUrls, scrapeArticlePage } = require('../../utilities/dataScrapingUtility.js');
const Bluebird = require('bluebird'); 

const app = express();

app.use(bodyParser.json());

/**
 * Function to to process and store scraped articles in DB
 * @param mainPageUrl to be processed and scraped
 * @returns true if data was scraped and stored in DB successfuly
 */
const procesAndStoreKnowledgeBaseInDB = async (mainPageUrl) => {
    console.log(`Scraping ${mainPageUrl} ...`);

    let urlsWithFailureVec = [];

    // Get section URLs
    let sectionUrls = await getSectionUrls(mainPageUrl);

    // Process each section URL asynchronously
    await Bluebird.map(sectionUrls, async (sectionUrl) => {
        const articleUrls = await getArticleUrls(sectionUrl);

        // Process each article URL asynchronously
        await Bluebird.map(articleUrls, async (articleUrl) => {
            const articleData = await scrapeArticlePage(articleUrl);
            let ret = await storeKnowledgeBaseDataInDB(articleData);

            if (!ret) {
                urlsWithFailureVec.push(articleUrl); // Handle failed URLs
            }
        }, { concurrency: 50 });
    }, { concurrency: 50 });

    return true;
};


// Route for scraping
app.post('/scrape-start', async (req, res) => {
    try {
        // URL of the main page
        const mainPageUrl = process.env.KNOWLEDGEBASE_URL;
        let isDataStoredSuccessfully = await procesAndStoreKnowledgeBaseInDB(mainPageUrl);

        if (isDataStoredSuccessfully) {
            // notifying main server
            await axios.post(`http://localhost:${process.env.MAIN_SERVER_PORT}/notify/scraping-complete`);
        }

        res.json(true);
    } catch (error) {
        // Handle any errors
        console.error('Error during scraping:', error);
        res.status(500).send('Error during scraping');
    }
});

app.listen(process.env.DATA_SCRAPING_SERVICE_PORT, () => {
    console.log(`Scraping service is running on http://localhost:${process.env.DATA_SCRAPING_SERVICE_PORT}`);
});
