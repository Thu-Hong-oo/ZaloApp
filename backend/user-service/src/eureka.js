const { Eureka } = require('eureka-js-client');

const eurekaClient = new Eureka({
    instance: {
        app: 'USER-SERVICE',
        instanceId: 'user-service-1',
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
        statusPageUrl: `http://localhost:${process.env.PORT || 3000}/health`,
        healthCheckUrl: `http://localhost:${process.env.PORT || 3000}/health`,
        port: {
            '$': process.env.PORT || 3000,
            '@enabled': true,
        },
        vipAddress: 'user-service',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
        registerWithEureka: true,
        fetchRegistry: true,
        leaseRenewalIntervalInSeconds: 30,
        leaseExpirationDurationInSeconds: 90,
    },
    eureka: {
        host: process.env.EUREKA_HOST || 'localhost',
        port: process.env.EUREKA_PORT || 8761,
        servicePath: '/eureka/apps/',
        preferIpAddress: true,
        shouldUseDns: false,
        registryFetchIntervalSeconds: 30,
        maxRetries: 10,
        requestRetryDelay: 2000,
    },
});

function start() {
    return new Promise((resolve, reject) => {
        eurekaClient.start((error) => {
            if (error) {
                console.error('Error registering with Eureka:', error);
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
                console.error('Error de-registering with Eureka:', error);
                reject(error);
            } else {
                console.log('Successfully de-registered with Eureka');
                resolve();
            }
        });
    });
}

module.exports = {
    start,
    stop
}; 