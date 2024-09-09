const express = require('express');
const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../../.env')
});
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const { storeKnowledgeBaseDataInDB } = require('../../database/knowledgeBaseDb.js');

const app = express();

app.use(bodyParser.json());

// Helper function to scrape article text from a given URL
const scrapeArticlePage = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Select the div with id article-wrapper
        const articleWrapper = $('#article-wrapper');

        // Initialize variables for author and last updated
        let author = '';
        let lastUpdated = '';

        // Extract and remove the h1 tag (the title)
        let title = $('h1').text().trim();
        $('h1').remove();

        // Extract the div with id article-details
        const articleDetails = articleWrapper.find('#article-details');

        // Process the second <div> inside #article-details to extract author and last updated
        const detailsDiv = articleDetails.find('div').eq(1);

        const authorParagraph = detailsDiv.find('p').eq(0);
        if (authorParagraph.length) {
            author = authorParagraph.text().trim();
        }

        const lastUpdatedParagraph = detailsDiv.find('p').eq(1);
        if (lastUpdatedParagraph.length) {
            lastUpdated = lastUpdatedParagraph.text().trim();
        }

        // Remove the div with id article-details
        articleDetails.remove();

        // Initialize an array to hold the text content
        let content = [];

        const parseNode = (node) => {
            if (node.type === 'text') {
                return $(node).text();
            } else if (node.type === 'tag') {
                const tagName = node.tagName.toLowerCase();
                switch (tagName) {
                    case 'a': {
                        const linkText = $(node).text();
                        const linkHref = $(node).attr('href');
                        return `[${linkText}](${linkHref})`;
                    }
                    case 'b':
                    case 'strong': {
                        return `*${$(node).text()}*`;
                    }
                    case 'i': {
                        return `_${$(node).text()}_`;
                    }
                    case 'ul':
                    case 'ol': {
                        return $(node).children('li').map((index, li) => {
                            let liItemText = $(li).contents().map((_, child) => {
                                const listItemChildText = parseNode(child).trim();
                                return listItemChildText;
                            }).get().join('').trim();
                            return node.tagName === 'ul' ? `- ${liItemText}` : `${index}. ${liItemText}`;

                        }).get().join('\n');
                    }
                    case 'div': {
                        return $(node).contents().map((index, child) => {
                            return parseNode(child);
                        }).get().join('').trim();
                    }
                    case 'p': {
                        return $(node).contents().map((index, child) => {
                            return parseNode(child);
                        }).get().join('').trim();
                    }
                    default:
                        return '';
                }
            }
            return '';
        };

        articleWrapper.children().each((index, element) => {
            const text = parseNode(element);
            if (text) {
                content.push(text);
            }
        });

        return {
            url: url,
            title: title,
            author: author,
            lastUpdated: lastUpdated,
            content: content.join('\n\n') // Join the content with line breaks for readability
        };
    } catch (error) {
        console.error(`Error scraping article page: ${error.message}`);
        return null;
    }
};

const scrapeArticlesSection = async (url) => {
    const mainPageUrl = url;
    let articleUrls = [];

    const fetchPage = async (pageUrl) => {
        try {
            const { data } = await axios.get(pageUrl);
            const $ = cheerio.load(data);

            // Scrape article links from the current page
            $('#categories-block-wrapper a').each((i, element) => {
                let articleUrl = $(element).attr('href');
                if (articleUrl) {
                    // If URLs are relative, convert them to absolute
                    if (!articleUrl.startsWith('http')) {
                        articleUrl = new URL(articleUrl, mainPageUrl).href;
                    }
                    articleUrls.push(articleUrl);
                }
            });

        } catch (error) {
            console.error('Error scraping section:', error);
        }
    };

    // Start by fetching the first page
    await fetchPage(mainPageUrl);

    return articleUrls;
};

const getSectionUrls = async (mainPageUrl) => {
    const { data } = await axios.get(mainPageUrl);
    const $ = cheerio.load(data);

    // Array to store article URLs
    let sectionUrls = [];

    // Extract URLs from the div with id 'categories-block-wrapper'
    $('#categories-block-wrapper a').each((i, element) => {
        let sectionUrl = $(element).attr('href');
        if (sectionUrl) {

            // If URLs are relative, convert them to absolute
            if (!sectionUrl.startsWith('http')) {
                sectionUrl = new URL(sectionUrl, mainPageUrl).href;
            }
            sectionUrls.push(sectionUrl);
        }
    });

    return sectionUrls;
}

const procesAndStoreKnowledgeBase = async (mainPageUrl) => {
    let urlsWithFailureVec = [];    // not doing anything with this rn
    let sectionUrls = await getSectionUrls(mainPageUrl);

    // Scrape each article page and push in the database
    for (const url of sectionUrls) {
        const articleUrls = await scrapeArticlesSection(url);
        for (const aurl of articleUrls) {
            const articleData = await scrapeArticlePage(aurl);

            // keep on pushing data into database and push into urlsWithFailureVec if storage fails for a url
            let ret = await storeKnowledgeBaseDataInDB(articleData)
            if(!ret);
                urlsWithFailureVec.push(aurl);
        }
    }
    return true;
}

// Route for scraping
app.post('/scrape-start', async (req, res) => {
    try {
        // URL of the main page
        const mainPageUrl = process.env.KNOWLEDGEBASE_URL;
        // let isDataStoredSuccessfully = await procesAndStoreKnowledgeBase(mainPageUrl);

        if (true) {
            // notifying main server
            await axios.post(`http://localhost:${process.env.MAIN_SERVER_PORT}/notify/scraping-complete`);
        }

        // Send the scraped data as the response
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
