const axios = require('axios');

async function checkDoctors() {
  try {
    const res = await axios.get('https://hospital-managemnt-system.vercel.app/api/v1/doctors');
    console.log('Total doctors:', res.data.data.length);
    if (res.data.data.length > 0) {
      console.log('First doctor ID:', res.data.data[0].doctor_id);
      console.log('First doctor ID type:', typeof res.data.data[0].doctor_id);
      console.log('Full first doctor:', JSON.stringify(res.data.data[0], null, 2));
    }
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

checkDoctors();
