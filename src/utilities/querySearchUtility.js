const { QUERY_SIMILARITY_ACCPETANCE_THRESHOLD } = require('../config/const.js');
const { fetchCompleteKnowledgeBaseEmbeddings, getKnowledgeBaseDataById } = require('../database/knowledgeBaseDb.js');

/**
 * Utility function to perform cosine similarity
 * @param vecA vector A of datapoints
 * @param {*} vecB vector B of datapoints
 * @returns cosine similarity value
 */
const performCosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Utility fucntion to search the query in the knowledgebase
 * @param queryEmbedding to be searched in db for match
 * @returns return { isPresent, data } if the data is matched
 */
const isSearchQueryPresentInKnowledgeBase = async (queryEmbedding) => {
    let retVal = { isPresent: false, data: null };
    if(!queryEmbedding) {
        return retVal;
    }
    
    const embeddingsData = await fetchCompleteKnowledgeBaseEmbeddings();

    let currentMaxSimilarity = -1;

    const matchPromises = embeddingsData.map(async (data) => {
        const { knowledgebase_id, embeddings } = data;
        let parsedEmbeddings;

        try {
            parsedEmbeddings = JSON.parse(embeddings);
        } catch (error) {
            console.error('Error parsing embeddings:', error);
            return null;
        }

        const similarity = performCosineSimilarity(queryEmbedding, parsedEmbeddings);

        if (similarity > currentMaxSimilarity) {
            currentMaxSimilarity = similarity;

            // Fetch the knowledge base data
            const knowledgeBaseData = await getKnowledgeBaseDataById(knowledgebase_id);

            return { data:knowledgeBaseData, similarity:similarity };
        }

        return null;
    });

    // Wait for all promises to resolve
    const results = await Promise.all(matchPromises);

    // Filter out null results and find the best match
    let closestDataToSearchQuery = null;
    const validResults = results.filter(result => result !== null);
    if (validResults.length > 0) {
        closestDataToSearchQuery = validResults.reduce((best, current) => current.similarity > best.similarity ? current : best);
    }
    
    // check if the similarity is more than defined threshold, if yes, return the data, else not
    if (closestDataToSearchQuery &&
        closestDataToSearchQuery.similarity >= QUERY_SIMILARITY_ACCPETANCE_THRESHOLD &&
        closestDataToSearchQuery.data
    ) {
        retVal = { isPresent: true, data: closestDataToSearchQuery.data }
    }

    return retVal;
};

module.exports = {
    performCosineSimilarity,
    isSearchQueryPresentInKnowledgeBase
}
