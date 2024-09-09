const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../.env')
});
const axios = require('axios');
const { OPENAI_EMBEDDINGS_API, OPENAI_EMBEDDINGS_MODEL } = require("../config/const");

const getEmbeddings = async (data) => {
    try {
        const response = await axios.post(OPENAI_EMBEDDINGS_API, {
            input: data,
            model: OPENAI_EMBEDDINGS_MODEL
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        return response?.data?.data[0]?.embedding;
    } catch (error) {
        console.error("Error fetching answer from OpenAI Embeddings API:", error);
        return null;
    }
}

module.exports = {
    getEmbeddings
}