const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../.env')
});
const axios = require('axios');
const Constants = require("../config/const");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Utility fubction to get contextual answer to a question
 * @param question to be answered 
 * @param {*} context using which question must be answered
 * @returns the answer based on contect
 */
const getAnswerFromContext = async (question, context) => {
    const url = Constants.OPENAI_CHAT_COMPLETIONS_API;

    // Setup headers
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
    };

    // Setup the request body data for chat completion
    const data = {
        model: Constants.OPENAI_CHAT_COMPLETIONS_MODEL,
        messages: [
            {
                role: Constants.OPENAI_CHAT_COMPLETIONS_MODEL_ROLE,
                content: Constants.OPENAI_CHAT_COMPLETIONS_CONTEXT.replace('{question}', question)
            },
            {
                role: "user",
                content: `Context: ${context}`
            },
            {
                role: "user",
                content: `Question: ${question}`
            }
        ],
        max_tokens: Constants.CHAT_COMPLETIONS_MAX_TOKEN,
        temperature: Constants.CHAT_COMPLETIONS_TEMPERATURE
    };

    try {
        // Make a POST request to OpenAI API
        const response = await axios.post(url, data, { headers });

        // Extract the answer from the response
        const answer = response.data.choices[0].message.content.trim();
        return answer;

    } catch (error) {
        console.error("Error fetching answer from OpenAI API:", error.response ? error.response.data : error.message);
        return null;
    }
}

module.exports = { getAnswerFromContext }
