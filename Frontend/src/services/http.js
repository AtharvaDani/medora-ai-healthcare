import axios from 'axios';

const http = axios.create();

// Equivalent of the Angular AuthInterceptor: attach the JWT to every request
// except login / register / reports.
http.interceptors.request.use((config) => {
  const url = config.url ?? '';
  if (url.includes('/login') || url.includes('/register') || url.includes('/reports/')) {
    return config;
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export default http;
