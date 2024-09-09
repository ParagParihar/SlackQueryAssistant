const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../.env')
});
const axios = require('axios');
const { OPENAI_CHAT_COMPLETIONS_API,
    OPENAI_CHAT_COMPLETIONS_MODEL,
    OPENAI_CHAT_COMPLETIONS_MODEL_ROLE,
    OPENAI_CHAT_COMPLETIONS_CONTEXT } = require("../config/const");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const getAnswerFromContext = async (question, context) => {
    const url = OPENAI_CHAT_COMPLETIONS_API;

    // Setup headers
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
    };

    // Setup the request body data for chat completion
    const data = {
        model: OPENAI_CHAT_COMPLETIONS_MODEL,
        messages: [
            {
                //`You are a helpful assistant. Based on the context below, answer this specific query directly: ${question} .You should always aim to be concise, helpful, and friendly in your responses. Do not ask follow-up questions or request more details.`
                role: OPENAI_CHAT_COMPLETIONS_MODEL_ROLE,
                content: `You are a helpful assistant. Based on the context below, answer this specific query directly: ${question} .You should always aim to be concise, helpful, and friendly in your responses. Do not ask follow-up questions or request more details.`
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
        max_tokens: 200,
        temperature: 0.3
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
