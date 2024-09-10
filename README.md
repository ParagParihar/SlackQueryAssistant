## Slack Query Assistant<br><br>
## Description<br>
This project is a Slack bot that interacts with users by answering their queries based on a knowledge base. The bot uses embeddings and cosine similarity to find the best match for user queries and provides contextual answers using OpenAI's Chat Completions API. Additionally, it logs Jira tickets for unresolved queries and provides the link to the user.

## Features<br>
* Web Scraping: The bot scrapes articles from a specified URL, extracts relevant data, and stores it in a database. The scraped data is used to generate embeddings and build the knowledge base for query matching.<br><br>
* Query Handling: The bot responds to user queries posted in a Slack channel.<br><br>
* Embedding Search: The bot uses cosine similarity on pre-generated embeddings to find the best match from the knowledge base for the user's query.<br><br>
* Contextual Responses: After matching, the bot uses OpenAI's Chat Completions API to generate a contextual response to the query.<br><br>
* Jira Ticket Logging: If the query cannot be resolved, the bot creates a Jira ticket and shares the ticket link with the user.<br><br>

## Workflow<br>
* Scraping and Data Storage:

  * The bot scrapes data from predefined URLs.
  * Extracted data is stored in a SQLite database (knowledgeBaseDb.db) for future use.
  * Embeddings are generated for each article using OpenAI's API and stored in the database.

* Query Matching:

  * When a user posts a query in the Slack channel, the bot compares the query's embeddings with the knowledge base using cosine similarity.
  * The closest match is retrieved, and a response is generated based on the content.

* Contextual Response:

  * The bot then utilizes OpenAI's Chat Completions API to craft a precise, user-friendly response based on the matched article and the user's query.

* Jira Ticket Logging:

  * If no relevant match is found in the knowledge base, the bot automatically creates a Jira bug ticket and shares the link with the user.


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
