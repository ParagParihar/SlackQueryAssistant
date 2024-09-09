const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const path = require('path');
const { spawn } = require('child_process');

// Paths to your service scripts
const scrapingServicePath = path.join(__dirname, 'services', 'data-scraping', 'dataScrapingService.js');
const embeddingGenerationServicePath = path.join(__dirname, 'services', 'embedding', 'embeddingGenerationService.js');
const slackBotServicePath = path.join(__dirname, 'services', 'slack-bot', 'slackBotService.js');
const mainServerPath = path.join(__dirname, 'services', 'mainserver.js');

// Function to start services and wait until they log that they're ready
function startService(servicePath, serviceName, readyMessage) {
  return new Promise((resolve, reject) => {
    const service = spawn('node', [servicePath]);

    service.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`${serviceName}: ${output}`);

      if (output.includes(readyMessage)) {
        console.log(`${serviceName} is ready!\n`);
        resolve();
      }
    });

    service.stderr.on('data', (data) => {
      console.error(`${serviceName} error: ${data.toString()}`);
    });

    service.on('error', (error) => {
      console.error(`${serviceName} encountered an error:`, error);
      reject(error);
    });

    service.on('exit', (code) => {
      if (code !== 0) {
        console.error(`${serviceName} exited with code ${code}`);
        reject(new Error(`${serviceName} failed to start`));
      }
    });

    // Start the service
    console.log(`Starting ${serviceName}...`);
  });
}

// Start services one by one
async function startServices() {
  try {
    // Wait for each service to log that it's ready
    await startService(scrapingServicePath, 'Scraping Service', 'Scraping service is running');
    await startService(embeddingGenerationServicePath, 'Embedding Generation Service', 'Embedding service is running');
    await startService(slackBotServicePath, 'Slack Bot Service', 'Slack Bot is running');
    await startService(mainServerPath, 'Main Server', 'Main server is running');
    
    console.log('All services started successfully!');
  } catch (error) {
    console.error('Error starting services:', error);
  }
}

// Start services
startServices();
