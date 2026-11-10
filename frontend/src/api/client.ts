import axios from 'axios';

const client = axios.create({
  baseURL:        '/',
  timeout:        7000,
  validateStatus: () => true,
});

export default client;
