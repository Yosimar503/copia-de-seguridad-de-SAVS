require('dotenv').config({ path: '../backend/.env' });
require('dotenv').config();

console.log('GROQ_API_KEY in process.env:', process.env.GROQ_API_KEY ? 'DEFINED (starts with ' + process.env.GROQ_API_KEY.slice(0, 7) + '...)' : 'UNDEFINED');
console.log('PORT in process.env:', process.env.PORT);
