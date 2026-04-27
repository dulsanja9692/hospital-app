fetch("https://hospital-managemnt-system.vercel.app/api/v1/doctors")
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
