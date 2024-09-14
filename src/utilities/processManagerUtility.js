const pm2 = require('pm2');

/**
 * Utility funtion to stop a service
 * @param {*} serviceName name of tyhe service to be stopped
 */
const stopService = async (serviceName) => {
    pm2.connect((err) => {
        if (err) {
            console.error('Failed to connect to pm2:', err);
            return;
        }

        pm2.stop(serviceName, (err) => {
            if (err) {
                console.error(`Failed to stop ${serviceName} service:`, err);
            } else {
                console.log(`${serviceName} service stopped`);
            }
            pm2.disconnect();
        });
    });
};

/**
 * Utility funtion to delete all services
 */
const deleteAllServices = async () => {
    try {
        await new Promise((resolve, reject) => {
            pm2.delete('all', (err) => {
                if (err) {
                    if (err.message.includes('not found')) {
                        console.warn('Some services were already stopped or not found.');
                        resolve();
                    } else {
                        reject(err);
                    }
                } else {
                    resolve();
                }
            });
        });

        console.log('All services stopped or already stopped. Exiting process.');
        process.exit(0);
    } catch (err) {
        console.error('Error occurred while stopping services:', err);
        process.exit(1);
    }
};
/**
 * Function to start a service
 * @param {*} scriptPath path to the service to be started
 * @param {*} serviceName name of the saervice to be started
 * @returns returns a promise, which resolves if started successfully
 */
function startService(scriptPath, serviceName) {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                console.error('Failed to connect to pm2:', err);
                return reject(err);
            }

            pm2.list((err, processList) => {
                if (err) {
                    console.error('Failed to list pm2 processes:', err);
                    pm2.disconnect();
                    return reject(err);
                }

                // Check if the service is already running
                const isServiceRunning = processList.some(proc => proc.name === serviceName && proc.pm2_env.status === 'online');
                if (isServiceRunning) {
                    console.log(`${serviceName} is already running`);
                    return resolve();
                }

                // Start the service if not running
                pm2.start({
                    script: scriptPath,
                    name: serviceName,
                    exec_mode: 'fork',
                    instances: 1,
                    output: `./src/logs/output/${serviceName}-output.log`,
                    error: `./src/logs/error/${serviceName}-output.log`,
                    combineLogs: true
                }, (err, apps) => {
                    if (err) {
                        console.error(`Failed to start ${serviceName}:`, err);
                        return reject(err);
                    }

                    console.log(`${serviceName} started successfully`);
                    resolve();
                });
            });
        });
    });
}

/**
 * Utility function to start all the servies
 * @param {*} serviceToServicePathMap map that stores {service name: Paths to the service}
 */
const startServices = async (serviceToServicePathMap) => {
    pm2.connect((err) => {
        if (err) {
            console.error('Error connecting to pm2', err);
            process.exit(2);
        }

        const servicePromises = Object.entries(serviceToServicePathMap).map(([serviceName, scriptPath]) => {
            return startService(scriptPath, serviceName);
        });

        Promise.all(servicePromises)
            .then(() => {
                console.log('All services started successfully');
                pm2.disconnect();
            })
            .catch((error) => {
                console.error('Error starting services:', error);
                pm2.disconnect(); 
            });
    });
}

module.exports = { stopService, deleteAllServices, startService, startServices };