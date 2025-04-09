const { Eureka } = require('eureka-js-client');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const PORT = process.env.PORT;
const INSTANCE_ID = `user-service:${uuidv4()}`;

const eurekaClient = new Eureka({
    instance: {
        instanceId: INSTANCE_ID,
        app: 'user-service',
        hostName: process.env.EUREKA_INSTANCE_HOSTNAME || 'localhost',
        ipAddr: process.env.EUREKA_INSTANCE_IP_ADDRESS || '127.0.0.1',
        statusPageUrl: `http://${process.env.EUREKA_INSTANCE_HOSTNAME || 'localhost'}:${PORT}/health`,
        healthCheckUrl: `http://${process.env.EUREKA_INSTANCE_HOSTNAME || 'localhost'}:${PORT}/health`,
        port: {
            '$': PORT,
            '@enabled': true,
        },
        vipAddress: 'user-service',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
        preferIpAddress: true,
        metadata: {
            instanceId: INSTANCE_ID
        }
    },
    eureka: {
        host: process.env.EUREKA_SERVER ? new URL(process.env.EUREKA_SERVER).hostname : 'localhost',
        port: process.env.EUREKA_SERVER ? new URL(process.env.EUREKA_SERVER).port : 8761,
        servicePath: '/eureka/apps/',
        fetchRegistry: true,
        registerWithEureka: true,
    },
});

function start() {
    return new Promise((resolve, reject) => {
        eurekaClient.start((error) => {
            if (error) {
                console.error(' Error registering with Eureka:', error);
                reject(error);
            } else {
                console.log('Successfully registered with Eureka');
                resolve();
            }
        });
    });
}

function stop() {
    return new Promise((resolve, reject) => {
        eurekaClient.stop((error) => {
            if (error) {
                console.error(' Error de-registering from Eureka:', error);
                reject(error);
            } else {
                console.log(' Successfully de-registered from Eureka');
                resolve();
            }
        });
    });
}

module.exports = {
    start,
    stop
};
