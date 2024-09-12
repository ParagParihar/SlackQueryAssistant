const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, '../../.env')
});
const axios = require('axios');
const { JIRA_URL} = require('../config/const');

/**
 * Utility function to a log a Jira issue
 * @param issueData required info {issueSummary, issueDescription, issueType, loggerEmail, jiraProjectKey}
 * @returns id of the the logged issue
 */
const logJiraIssue = async (issueData) => {
    let { issueSummary, issueDescription, issueType, loggerEmail, jiraProjectKey } = issueData;
    // Create the payload for the issue
    const issue = {
        fields: {
            project: {
                key: jiraProjectKey,  // Project key
            },
            summary: issueSummary,  // Summary of the bug
            description: issueDescription,  // Detailed description of the bug
            issuetype: {
                name: issueType,
            },
        },
    };

    try {
        // Make HTTP request to Jira API
        const response = await axios.post(JIRA_URL, issue, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${loggerEmail}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
        });
        let issueId = response.data.key;
        console.log(`Bug logged successfully: ${response.data.key}`);

        // consttructing a link for user for easy access
        let issueLink = `https://${process.env.JIRA_HOST}/browse/${response.data.key}`;

        return { issueId: issueId, issueLink: issueLink };  

    } catch (error) {
        console.error('Error logging Jira issue:', error.response ? error.response.data : error.message);
        return 'Error logging Jira issue:', error.response ? error.response.data : error.message;
    }
}

module.exports = {
    logJiraIssue
}
