const path = require('path');
require("dotenv").config({
	path: path.resolve(__dirname, '../../../.env')
});
const express = require('express');
const bodyParser = require('body-parser');
const { fetchCompleteKnowledgeBase, storeKnowledgeBaseEmbeddingsDataInDB } = require('../../database/knowledgeBaseWrapper.js');
const { getEmbeddings } = require('../../utilities/embeddingCallUtility.js');
const axios = require('axios');
const getPLimit = async () => (await import('p-limit')).default;

const app = express();

app.use(bodyParser.json());
const port = process.env.EMBEDDING_GENERATION_SERVICE_PORT;

// Route to start embedding
app.post('/embeddings-start', async (req, res) => {
	try {
		const pLimit = await getPLimit();
		const limit = pLimit(50);  // only sending 50 concurrent calls to openAi

		let knowledgeBase = await fetchCompleteKnowledgeBase();

		const getEmbeddingPromises = knowledgeBase.map(async (data) => {
			const { id, content } = data;

			return limit(async () => {
				let embeddings = await getEmbeddings(content);
				if (embeddings) {
					await storeKnowledgeBaseEmbeddingsDataInDB({ knowledgebase_id: id, embeddings: embeddings });
				}
			});
		});

		// Wait for all promises to resolve
		await Promise.all(getEmbeddingPromises);

		axios.post(`http://localhost:${process.env.MAIN_SERVER_PORT}/notify/embedding-generation-complete`);

		res.json(true);
	} catch (error) {
		console.error('Error during Embedding generation:', error);
		res.status(500).send('Error during Embedding generation');
	}
});

app.listen(port, () => {
	console.log(`Embedding service is running on http://localhost:${port}`);
});
