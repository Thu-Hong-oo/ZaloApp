const axios = require('axios');

class ServiceDiscovery {
  constructor() {
    this.eurekaUrl = `http://${process.env.EUREKA_HOST}:${process.env.EUREKA_PORT}/eureka`;
    this.authServiceName = 'auth-service';
  }

  async getAuthServiceUrl() {
    try {
      // Get auth service instances from Eureka
      const response = await axios.get(`${this.eurekaUrl}/apps/${this.authServiceName}`);
      const instances = response.data.application.instance;

      if (!instances || instances.length === 0) {
        throw new Error('No auth service instances found');
      }

      // Get the first available instance
      const instance = instances[0];
      const hostName = instance.hostName;
      const port = instance.port.$;

      return `http://${hostName}:${port}`;
    } catch (error) {
      console.error('Error getting auth service URL:', error);
      throw error;
    }
  }

  async register() {
    try {
      const response = await axios.post(`${this.eurekaUrl}/apps/${process.env.SERVICE_NAME}`, {
        instance: {
          instanceId: process.env.SERVICE_INSTANCE_ID,
          hostName: 'localhost',
          app: process.env.SERVICE_NAME,
          ipAddr: '127.0.0.1',
          vipAddress: process.env.SERVICE_NAME,
          dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn'
          },
          port: {
            $: process.env.PORT,
            '@enabled': true
          }
        }
      });
      console.log('Successfully registered with Eureka');
      return response.data;
    } catch (error) {
      console.error('Error registering with Eureka:', error);
      throw error;
    }
  }

  async deregister() {
    try {
      await axios.delete(`${this.eurekaUrl}/apps/${process.env.SERVICE_NAME}/${process.env.SERVICE_INSTANCE_ID}`);
      console.log('Successfully deregistered from Eureka');
    } catch (error) {
      console.error('Error deregistering from Eureka:', error);
      throw error;
    }
  }

  async heartbeat() {
    try {
      await axios.put(`${this.eurekaUrl}/apps/${process.env.SERVICE_NAME}/${process.env.SERVICE_INSTANCE_ID}`);
    } catch (error) {
      console.error('Error sending heartbeat to Eureka:', error);
      throw error;
    }
  }
}

module.exports = new ServiceDiscovery(); 