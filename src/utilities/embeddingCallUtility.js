const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../.env')
});
const axios = require('axios');
const { OPENAI_EMBEDDINGS_API, OPENAI_EMBEDDINGS_MODEL, MAX_RETRIES, REQUEST_TIMEOUT } = require("../config/const");

/**
 * Utility function to fetch embeddings of the data passed
 * @param data to be set for embeddings
 * @param {*} retries no of retries if call fails
 * @returns the embeddings of data passed
 */
const getEmbeddings = async (data, retries = MAX_RETRIES) => {
    try {
        const response = await axios.post(OPENAI_EMBEDDINGS_API,
            {
                input: data,
                model: OPENAI_EMBEDDINGS_MODEL
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                timeout: REQUEST_TIMEOUT
            });

        return response?.data?.data[0]?.embedding;
    } catch (error) {
        // for aborted connections or DNS-related error retry the call
        if ((error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') && retries > 0) {
            console.warn("Timeout occurred, retrying... Remaining retries:", retries);
            return await getEmbeddings(data, retries - 1);  // Retry the request
        } else {
            console.error("Error fetching answer from OpenAI Embeddings API:", error);
            return null;
        }
    }
}

module.exports = {
    getEmbeddings
}