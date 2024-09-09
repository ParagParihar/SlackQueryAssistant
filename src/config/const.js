module.exports = {
    OPENAI_EMBEDDINGS_API: "https://api.openai.com/v1/embeddings",
    OPENAI_CHAT_COMPLETIONS_API: "https://api.openai.com/v1/chat/completions",
    OPENAI_EMBEDDINGS_MODEL: 'text-embedding-ada-002',
    OPENAI_CHAT_COMPLETIONS_MODEL: "gpt-3.5-turbo",
    OPENAI_CHAT_COMPLETIONS_MODEL_ROLE: "system",
    OPENAI_CHAT_COMPLETIONS_CONTEXT: "You are a helpful assistant. You should always aim to be concise, helpful, and friendly in your responses. Do not ask follow-up questions or request more details.",
    JIRA_URL: `https://paragprhr.atlassian.net/rest/api/2/issue`,
    QUERY_SIMILARITY_ACCPETANCE_THRESHOLD: 0.8,
    SLACK_PREAMBLE_TEMPLATE: `Hi {name},\nThank you for reaching out with your query. Here's what I found:\n\n`,
    SLACK_POSTAMBLE_TEMPLATE: `\n\nFor further details, please visit the link: {url}.`,
    JIRA_TICKET_TEMPLATE: `Hi {name},\n\n Thank you for bringing this to our attention. We've logged a Jira ticket to address your query. You can track the progress and updates on the following link: {ticketKey}.`,
}
