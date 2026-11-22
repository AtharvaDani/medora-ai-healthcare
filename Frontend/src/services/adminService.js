import http from './http';
import { API_BASE } from '../config';















export const adminService = {
  getAllUsers: () => http.get(`${API_BASE}/getAllUsers`).then((r) => r.data),
  analyzeAllFeedbacks: () => http.post(`${API_BASE}/Doctor/analyze/all-feedbacks`, {}).then((r) => r.data),
  analyzeDoctorFeedback: (doctorId) =>
    http.post(`${API_BASE}/Doctor/analyze/feedback/${doctorId}`, {}).then((r) => r.data),
  triggerSmartAnalysis: () =>
    http.post(`${API_BASE}/Doctor/analyze/smart`, {}, { responseType: 'text' }).then((r) => r.data ),
  permit: (id) =>
    http.post(`${API_BASE}/permit/${id}`, {}, { responseType: 'text' }).then((r) => r.data ),
  block: (id) =>
    http.post(`${API_BASE}/block/${id}`, {}, { responseType: 'text' }).then((r) => r.data ),
};
