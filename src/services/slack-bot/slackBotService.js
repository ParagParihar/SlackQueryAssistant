const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../../.env')
});
const express = require('express');
const bodyParser = require('body-parser');
const { getEmbeddings } = require('../../utilities/embeddingCallUtility.js')
const { getAnswerFromContext } = require('../../utilities/contextualAnsweringUtility.js');
const { logJiraIssue } = require('../../utilities/jiraTicketLoggerUtility.js');
const { isSearchQueryPresentInKnowledgeBase } = require('../../utilities/querySearchUtility.js');
const { App } = require('@slack/bolt');
const { SLACK_PREAMBLE_TEMPLATE, SLACK_POSTAMBLE_TEMPLATE, JIRA_TICKET_TEMPLATE } = require('../../config/const.js');

const app = express();

app.use(bodyParser.json());

const slackToken = process.env.BOT_TOKEN;
const slackAppToken = process.env.SLACK_APP_TOKEN;
const targetChannelId = process.env.SLACK_TARGET_CHANNEL_ID;
const jiraEmail = process.env.JIRA_EMAIL;
const jiraProjectKey = process.env.JIRA_PROJECT_KEY;

let messageQueue = [];
let canProcessQueries;

const slackApp = new App({
    token: slackToken,
    appToken: slackAppToken,
    socketMode: true,
});

const getUserInfo = async (message) => {
    return new Promise(async (resolve) => {
        try {
            const userId = message.user;
            const result = await slackApp.client.users.info({ user: userId });
            resolve(result.user.real_name || result.user.name);
        } catch (error) {
            console.error("Error fetching user info:", error);
            resolve("there"); // Fallback
        }
    });
};

// Function to process the message queue asynchronously
const processMessageQueue = async () => {
    while (messageQueue.length > 0) {
        let messagesToProcess = [...messageQueue];
        messageQueue = []; // Clear the queue

        const processingPromises = messagesToProcess.map(async ({ message, channel, ts }) => {
            try {
                console.log("Processing message ", message.text);
                const queryEmbedding = await getEmbeddings(message.text);
                const retVal = await isSearchQueryPresentInKnowledgeBase(queryEmbedding);
                let userName = await getUserInfo(message);

                if (retVal.isPresent && retVal.data) {
                    let ret = await getAnswerFromContext(retVal.data.content);

                    let reply = SLACK_PREAMBLE_TEMPLATE.replace('{name}', userName) + ret;

                    /**
                     * We dont want to create a to-n-fro conversational chat with user. 
                     * The bot should act as first line of help for the user, so that user gets a high level idea of the solution
                     * and further can go to the link and check further.
                     */
                    reply += SLACK_POSTAMBLE_TEMPLATE.replace('{url}', retVal.data.url);

                    await slackApp.client.chat.postMessage({
                        channel: channel,
                        text: reply,
                        thread_ts: ts
                    });
                } else {
                    let issueData = {
                        issueSummary: message.text,
                        issueDescription: message.text, issueType: 'Bug',
                        loggerEmail: jiraEmail,
                        jiraProjectKey: jiraProjectKey
                    }
                    const jiraIssue = await logJiraIssue(issueData);
                    await slackApp.client.chat.postMessage({
                        channel: channel,
                        text: JIRA_TICKET_TEMPLATE.replace('{name}', userName).replace('{ticketKey}', jiraIssue.issueLink),
                        thread_ts: ts
                    });
                }
            } catch (error) {
                console.error(`Failed to process message: ${message.text} with ${error.message}`);
            }
        });

        await Promise.all(processingPromises);
    }
}

// Slack messages event listener
slackApp.message(async ({ message }) => {
    if (message.channel === targetChannelId && !message.bot_id && message.text && message.text !== "") {
        console.log("message PUSHED ", message.text);
        messageQueue.push({
            message: message,
            channel: message.channel,
            ts: message.ts
        });

        if (canProcessQueries) {
            processMessageQueue();
        }
    }
});

// Endpoint to notify Slack bot when embedding is complete
app.post('/notify', (req, res) => {
    canProcessQueries = true;  // Allow query processing
    processMessageQueue();  // Start processing the queued queries
    res.status(200).send('Slack bot query processing started');
});

const startSlackApp = async () => {
    canProcessQueries = false;
    await slackApp.start();
    console.log('Slack bot is running!');
};

app.listen(process.env.SLACK_BOT_SERVICE_PORT, () => {
    console.log(`Slack bot service is running on http://localhost:${process.env.SLACK_BOT_SERVICE_PORT}`);
    startSlackApp().then(() => {
        console.log('Slack app started successfully');
    }).catch((error) => {
        console.error('Error starting Slack app:', error);
    });
});