const axios = require('axios');
const cheerio = require('cheerio');
const { SCRAPING_SECTION_URL_DIV_ID,
    SCRAPING_ARTICLE_URL_DIV_ID,
    SCRAPING_TITLE_DIV,
    SCRAPING_ARTICLES_DETAILS_DIV_ID,
    SCRAPING_ARTICLE_CONTENT_DIV_ID } = require('../config/const');

/**
 * Function to parse the element node and return the text content present inside node
 * Handling of all different type of div tags like a, bold, italic, lists, p, div
 * @param $ - cheerio data
 * @param node - node element to be parsed
 * @returns content of the entire node element
 */
const parseNode = ($, node) => {
    if (node.type === 'text') {
        return $(node).text();
    }
    else if (node.type === 'tag') {
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
                        const listItemChildText = parseNode($, child).trim();
                        return listItemChildText;
                    }).get().join('').trim();
                    return node.tagName === 'ul' ? `- ${liItemText}` : `${index}. ${liItemText}`;

                }).get().join('\n');
            }
            case 'div': {
                return $(node).contents().map((_, child) => {
                    return parseNode($, child);
                }).get().join('').trim();
            }
            case 'p': {
                return $(node).contents().map((_, child) => {
                    return parseNode($, child);
                }).get().join('').trim();
            }
            default:
                return '';
        }
    }
    return '';
};

/**
 * Function to fetch article details - author and last updated info
 * this also removes articleDetailsElement after processing
 * @param $ cheerio data
 * @param articleDetailsElement element to fetch details
 * @returns author and last updated info
 */
const processArticleDetails = ($, articleDetailsElement) => {
    const articleDetails = $(articleDetailsElement);
    if (!articleDetails) {
        return { author: '', lastUpdated: '' };
    }
    // Extract the div with id article-details
    let author = '';
    let lastUpdated = '';

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

    articleDetails.remove();

    return { author, lastUpdated };
}

/**
 * Function to return title of the article and then remove it
 * @param $ cheerio data 
 * @param titleElement element to get title
 * @returns title of the article
 */
const processArticleTitle = ($, titleElement) => {
    // Extract and remove the h1 tag (the title)
    let title = '';
    if ($(titleElement)) {
        title = $(titleElement).text().trim();
    }
    $(titleElement).remove();
    return title;
}

/**
 * Helper function to scrape article data from a given URL
 * @param url from which article data needs to be scraped
 * @returns returns { url, title, author, lastUpdated, content }
 */
const scrapeArticlePage = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const articleWrapper = $(SCRAPING_ARTICLE_CONTENT_DIV_ID);

        let title = processArticleTitle($, SCRAPING_TITLE_DIV);

        let { author, lastUpdated } = processArticleDetails($, SCRAPING_ARTICLES_DETAILS_DIV_ID);

        let content = [];
        articleWrapper.children().each((_, element) => {
            const text = parseNode($, element);
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

/**
 * Function to get article urls if a given section utl
 * @param url section from which article urls are to be fetched
 * @returns array of article urls
 */
const getArticleUrls = async (url) => {
    let articleUrls = [];

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Scrape article links from the current page
        $(`${SCRAPING_ARTICLE_URL_DIV_ID} a`).each((i, element) => {
            let articleUrl = $(element).attr('href');
            if (articleUrl) {
                // If URLs are relative, convert them to absolute
                if (!articleUrl.startsWith('http')) {
                    articleUrl = new URL(articleUrl, url).href;
                }
                articleUrls.push(articleUrl);
            }
        });

    } catch (error) {
        console.error('Error scraping article urls:', error);
    }

    return articleUrls;
};

/**
 * Function to get section urls from main page
 * @param mainPageUrl url from which section urls need to be fetched
 * @returns array of section urls
 */
const getSectionUrls = async (mainPageUrl) => {
    let sectionUrls = [];

    try {
        const { data } = await axios.get(mainPageUrl);
        const $ = cheerio.load(data);

        // Extract URLs from the div having section urls
        $(`${SCRAPING_SECTION_URL_DIV_ID} a`).each((i, element) => {
            let sectionUrl = $(element).attr('href');
            if (sectionUrl) {

                // If URLs are relative, convert them to absolute
                if (!sectionUrl.startsWith('http')) {
                    sectionUrl = new URL(sectionUrl, mainPageUrl).href;
                }
                sectionUrls.push(sectionUrl);
            }
        });
    } catch (error) {
        console.error('Error scraping section urls:', error);
    }

    return sectionUrls;
}

module.exports = {
    parseNode, processArticleDetails, processArticleTitle, getSectionUrls, getArticleUrls, scrapeArticlePage
}