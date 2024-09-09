## Slack Query Assistant<br><br>
## Description<br>
This project is a Slack bot that interacts with users by answering their queries based on a knowledge base. The bot uses embeddings and cosine similarity to find the best match for user queries and provides contextual answers using OpenAI's Chat Completions API. Additionally, it logs Jira tickets for unresolved queries and provides the link to the user.

## Features<br>
* Slack bot for query handling.<br>
* Integration with OpenAI's Chat Completions API for contextual answers.<br>
* Knowledge base with embeddings for efficient query matching.<br>
* Jira ticket logging for unresolved queries.<br>

## Installation<br>
Clone the repository:<br>
```sh
git clone https://github.com/ParagParihar/SlackQueryAssistant.git
cd your-repo-name
```

Install dependencies:<br>
```sh
npm install
```

Set up environment variables:<br>

Create a .env file in the root directory and add the following environment variables:<br>
```sh
BOT_TOKEN=your-slack-bot-token
SLACK_APP_TOKEN=your-slack-app-token
OPENAI_API_KEY=your-openai-key
SLACK_TARGET_CHANNEL_ID=your-target-slack-channel-for-listening
JIRA_API_TOKEN=jira-api-token-for-bug-logging
JIRA_HOST=your-jira-host
JIRA_EMAIL=your-jira-email
JIRA_PROJECT_KEY=your-jira-project-key
KNOWLEDGEBASE_URL=your-scrape-url
MAIN_SERVER_PORT=your-port-1
SLACK_BOT_SERVICE_PORT=your-port-2
DATA_SCRAPING_SERVICE_PORT=your-port-3
EMBEDDING_GENERATION_SERVICE_PORT=your-port-4
```

## Usage<br>
Start all the services:<br>

To start all services, run:<br>
```sh
npm start
```

This will start:<br>
Scraping Service<br>
Embedding Generation Service<br>
Slack Bot Service<br>
<br>
To start the main server<br>
```sh
npm run begin
```
This will start:<br>
Main Server<br>
<br>
Running individual services:<br>
If you need to start individual services separately, use the following commands:<br>
```
npm run scraping-service
npm run embedding-service
npm run slack-bot
npm run main-server
```

## Contributing<br>
* Fork the repository on GitHub.<br>
* Create a new branch for your feature or fix.<br>
* Commit your changes and push to your forked repository.<br>
* Open a pull request to the main repository.<br>


## Acknowledgements<br>
* Slack API<br>
* OpenAI API<br>
* Jira API<br>
