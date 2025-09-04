const fs = require('fs');
const path = require('path');
const axios = require('axios');

class DomainRotator {
    constructor() {
        this.domains = [
            'proxy-1.yourdomain.com',
            'proxy-2.yourdomain.com',
            'proxy-3.yourdomain.com'
        ];
    }
    
    getDailyDomain() {
        const dayOfYear = Math.floor((Date.now() - Date.parse(new Date().getFullYear(), 0, 0)) / 86400000);
        const index = dayOfYear % this.domains.length;
        return this.domains[index];
    }
    
    async updateDuckDns(domain, token) {
        try {
            const response = await axios.get(`https://www.duckdns.org/update?domains=${domain}&token=${token}&ip=`);
            console.log(`DuckDNS update response: ${response.data}`);
            return response.data === 'OK';
        } catch (error) {
            console.error('DuckDNS update failed:', error);
            return false;
        }
    }
}

// Usage
const rotator = new DomainRotator();
const dailyDomain = rotator.getDailyDomain();
console.log(`Today's domain: ${dailyDomain}`);

// Update DuckDNS (if using)
// const duckDnsToken = process.env.DUCKDNS_TOKEN;
// rotator.updateDuckDns(dailyDomain, duckDnsToken);
