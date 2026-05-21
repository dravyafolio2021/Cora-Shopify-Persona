const axios = require('axios');
axios.post('http://localhost:4000/api/settings/store', {}).catch(error => {
  const errorBody = error.response?.data;
  const detail = errorBody?.error_description || errorBody?.error || error.message;
  console.log("Detail stringified:", typeof detail === 'object' ? JSON.stringify(detail) : String(detail));
});
