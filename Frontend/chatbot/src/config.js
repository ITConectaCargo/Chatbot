import axios from 'axios';
const API_URL = 'https://chatbot.wesleymoraescon.repl.co/';
//const API_URL = 'http://192.168.1.183:9000/'

const api = axios.create({
  baseURL: API_URL, // URL base da sua API
});

export {API_URL}
export default api