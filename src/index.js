const pm2 = require('pm2');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const { deleteAllServices, startServices } = require('./utilities/processManagerUtility');
const Constants = require('./config/const');

// map to store {service name: Paths to the service}
const serviceToServicePathMap = {
  [Constants.SCRAPING_SERVICE_NAME] : path.join(__dirname, 'services', Constants.SCRAPING_SERVICE_NAME, 'dataScrapingService.js'),
  [Constants.EMBEDDING_SERVICE_NAME] : path.join(__dirname, 'services', Constants.EMBEDDING_SERVICE_NAME, 'embeddingGenerationService.js'),
  [Constants.SLACK_BOT_SERVICE_NAME] : path.join(__dirname, 'services', Constants.SLACK_BOT_SERVICE_NAME, 'slackBotService.js'),
}

// listening to SIGINT to forcefully delete all the services
process.on(Constants.PROCESS_SIGINT, deleteAllServices);

// Start the services
startServices(serviceToServicePathMap);
