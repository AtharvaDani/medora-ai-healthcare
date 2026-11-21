import http from './http';
import { API_BASE } from '../config';

export interface User {
  id: number;
  username: string;
  emailid: string;
  password: string;
  role: string;
  feedbackAnalysis: string | null;
  lastCancelReset: string | null;
  misconductScore: number;
  appointmentsCanceled: number;
  misconductReason: string | null;
  permitted: boolean;
}

export const adminService = {
  getAllUsers: () => http.get<User[]>(`${API_BASE}/getAllUsers`).then((r) => r.data),
  analyzeAllFeedbacks: () => http.post(`${API_BASE}/Doctor/analyze/all-feedbacks`, {}).then((r) => r.data),
  analyzeDoctorFeedback: (doctorId: number) =>
    http.post(`${API_BASE}/Doctor/analyze/feedback/${doctorId}`, {}).then((r) => r.data),
  triggerSmartAnalysis: () =>
    http.post(`${API_BASE}/Doctor/analyze/smart`, {}, { responseType: 'text' }).then((r) => r.data as string),
  permit: (id: number) =>
    http.post(`${API_BASE}/permit/${id}`, {}, { responseType: 'text' }).then((r) => r.data as string),
  block: (id: number) =>
    http.post(`${API_BASE}/block/${id}`, {}, { responseType: 'text' }).then((r) => r.data as string),
};
