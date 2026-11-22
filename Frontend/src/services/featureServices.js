import http from './http';
import { API_BASE } from '../config';

/** Pulls a readable message out of an axios error. */
export function errorText(e, fallback = 'Something went wrong. Please try again.') {
  const d = e?.response?.data;
  if (typeof d === 'string' && d) return d;
  if (d?.error) return d.error;
  if (e?.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?';
  return fallback;
}

export const aiFeaturesService = {
  explainReport(file) {
    const fd = new FormData();
    fd.append('report', file, file.name);
    return http.post(`${API_BASE}/Patient/ai/explain-report`, fd, { timeout: 180000 }).then((r) => r.data);
  },
  triage(payload) {
    return http.post(`${API_BASE}/Patient/ai/triage`, payload, { timeout: 180000 }).then((r) => r.data);
  },
};

export const videoService = {
  getRoom: (appointmentId) =>
    http.get(`${API_BASE}/Appointment/${appointmentId}/video-room`).then((r) => r.data),
};

export const analyticsService = {
  admin: () => http.get(`${API_BASE}/analytics/admin`).then((r) => r.data),
  doctor: (doctorId) => http.get(`${API_BASE}/analytics/doctor/${doctorId}`).then((r) => r.data),
};
