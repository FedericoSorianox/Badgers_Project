// src/api.js
import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';

const apiClient = axios.create({
  // Usa la URL de producción o desarrollo según el entorno
  baseURL: isDevelopment 
    ? 'http://127.0.0.1:8000/api/'
    : 'https://thebadgersadmin.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;