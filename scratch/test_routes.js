const axios = require('axios');
const BASE_URL = 'https://hospital-managemnt-system.vercel.app/api/v1';

async function testRoutes() {
  const routes = ['/hospitals', '/hospital', '/users', '/user', '/doctors', '/doctor'];
  for (const r of routes) {
    try {
      const res = await axios.get(BASE_URL + r);
      console.log(`GET ${r}: SUCCESS (${res.status})`);
    } catch (err) {
      console.log(`GET ${r}: FAILED (${err.response?.status || err.message})`);
    }
  }
}
testRoutes();
