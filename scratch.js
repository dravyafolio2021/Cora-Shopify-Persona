const axios = require('axios');
axios.post('https://ekg7ga-00.myshopify.com/admin/oauth/access_token', {
  client_id: 'e90a39fadd681ad4ba47fc71f122cb6a',
  client_secret: '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',
  code: 'bad_code'
}).catch(e => {
  console.log(e.response?.data || e.message);
});
