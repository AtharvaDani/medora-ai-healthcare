import { jwtDecode } from 'jwt-decode';
import http from './http';
import { API_BASE } from '../config';

export interface TokenUser {
  id: any;
  role: string;
  username: string;
}

export const userService = {
  addUser: (user: any) => http.post(`${API_BASE}/register`, user),
  login: (user: any) => http.post(`${API_BASE}/login`, user),

  storeToken: (token: string) => localStorage.setItem('token', token),
  getToken: (): string | null => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !userService.isTokenExpired();
  },

  getUserInfoFromToken(): TokenUser | null {
    const token = userService.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return { id: decoded.id, role: decoded.role, username: decoded.sub };
    } catch {
      return null;
    }
  },

  isTokenExpired(): boolean {
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
