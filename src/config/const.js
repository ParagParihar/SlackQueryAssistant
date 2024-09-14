class Constants {
    static OPENAI_EMBEDDINGS_API = "https://api.openai.com/v1/embeddings";
    static OPENAI_CHAT_COMPLETIONS_API = "https://api.openai.com/v1/chat/completions";
    static OPENAI_EMBEDDINGS_MODEL = 'text-embedding-ada-002';
    static OPENAI_CHAT_COMPLETIONS_MODEL = "gpt-3.5-turbo";
    static OPENAI_CHAT_COMPLETIONS_MODEL_ROLE = "system";
    static OPENAI_CHAT_COMPLETIONS_CONTEXT = "You are a helpful assistant. Based on the context below; answer this specific query directly = {question} .You should always aim to be concise; helpful; and friendly in your responses. Do not ask follow-up questions or request more details.";
    static JIRA_URL = `https://paragprhr.atlassian.net/rest/api/2/issue`;
    static QUERY_SIMILARITY_ACCPETANCE_THRESHOLD = 0.8;
    static SLACK_PREAMBLE_TEMPLATE = `Hi {name};\nThank you for reaching out with your query. Here's what I found:\n\n`;
    static SLACK_POSTAMBLE_TEMPLATE = `\n\nFor further details; please visit the link = {url}.`;
    static JIRA_TICKET_TEMPLATE = `Hi {name};\n\n Thank you for bringing this to our attention. We've logged a Jira ticket to address your query. You can track the progress and updates on the following link = {ticketKey}.`;
    static SCRAPING_SECTION_URL_DIV_ID = '#categories-block-wrapper';
    static SCRAPING_ARTICLE_URL_DIV_ID = '#categories-block-wrapper';
    static SCRAPING_TITLE_DIV = 'h1';
    static SCRAPING_ARTICLES_DETAILS_DIV_ID = '#article-details';
    static SCRAPING_ARTICLE_CONTENT_DIV_ID = '#article-wrapper';
    static MAX_RETRIES = 3;
    static REQUEST_TIMEOUT = 5000;
    static CHAT_COMPLETIONS_MAX_TOKEN = 250;
    static CHAT_COMPLETIONS_TEMPERATURE = 0.3;
    static SCRAPING_SERVICE_NAME = 'data-scraping';
    static EMBEDDING_SERVICE_NAME = 'embedding';
    static SLACK_BOT_SERVICE_NAME = 'slack-bot';
    static PROCESS_SIGINT = 'SIGINT';
}

module.exports = Constants;