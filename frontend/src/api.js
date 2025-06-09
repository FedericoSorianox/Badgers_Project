// src/api.js
import axios from 'axios';

const apiClient = axios.create({
  // Esta es la dirección donde está corriendo tu backend de Django
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;