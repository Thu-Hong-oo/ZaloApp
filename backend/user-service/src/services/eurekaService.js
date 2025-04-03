const axios = require('axios');

class EurekaService {
  constructor() {
    this.eurekaUrl = `http://${process.env.EUREKA_HOST}:${process.env.EUREKA_PORT}/eureka`;
    this.serviceName = process.env.SERVICE_NAME;
    this.instanceId = process.env.SERVICE_INSTANCE_ID;
    this.port = process.env.PORT;
  }

  async register() {
    try {
      const response = await axios.post(`${this.eurekaUrl}/apps/${this.serviceName}`, {
        instance: {
          instanceId: this.instanceId,
          hostName: 'localhost',
          app: this.serviceName,
          ipAddr: '127.0.0.1',
          vipAddress: this.serviceName,
          dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn'
          },
          port: {
            $: this.port,
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
      await axios.delete(`${this.eurekaUrl}/apps/${this.serviceName}/${this.instanceId}`);
      console.log('Successfully deregistered from Eureka');
    } catch (error) {
      console.error('Error deregistering from Eureka:', error);
      throw error;
    }
  }

  async heartbeat() {
    try {
      await axios.put(`${this.eurekaUrl}/apps/${this.serviceName}/${this.instanceId}`);
    } catch (error) {
      console.error('Error sending heartbeat to Eureka:', error);
      throw error;
    }
  }
}

module.exports = new EurekaService(); 