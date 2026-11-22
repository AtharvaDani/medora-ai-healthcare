import { jwtDecode } from 'jwt-decode';
import http from './http';
import { API_BASE } from '../config';







export const userService = {
  addUser: (user) => http.post(`${API_BASE}/register`, user),
  login: (user) => http.post(`${API_BASE}/login`, user),

  storeToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),

  isLoggedIn() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !userService.isTokenExpired();
  },

  getUserInfoFromToken() {
    const token = userService.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return { id: decoded.id, role: decoded.role, username: decoded.sub };
    } catch {
      return null;
    }
  },

  isTokenExpired() {
    const token = localStorage.getItem('token');
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  },
};
