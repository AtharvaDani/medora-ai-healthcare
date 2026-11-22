import http from './http';
import { API_BASE } from '../config';

const baseUrl = `${API_BASE}/Patient`;

export const patientService = {
  addPatientProfile(patientData, file) {
    const formData = new FormData();
    formData.append('patient', JSON.stringify(patientData));
    if (file) formData.append('report', file, file.name);
    return http.post(`${baseUrl}/addProfile`, formData, { responseType: 'text' }).then((r) => r.data );
  },

  downloadReport: (filename) =>
    http.get(`${baseUrl}/download-report/${filename}`, { responseType: 'blob' }).then((r) => r.data ),

  findPatientById: (id) => http.get(`${baseUrl}/FindById/${id}`).then((r) => r.data),

  updateProfile: (id, patientProfile) =>
    http.put(`${baseUrl}/updateprofile/${id}`, patientProfile).then((r) => r.data),

  bookAppointment: (appointment) =>
    http.post(`${baseUrl}/BookAppointment`, appointment, { responseType: 'text' }).then((r) => r.data),

  saveFeedback: (feedback) => http.post(`${baseUrl}/add-feedback`, feedback).then((r) => r.data),

  getDoctorReviews: (doctorId) => http.get(`${baseUrl}/getAllFeedbacks/${doctorId}`).then((r) => r.data),

  cancelAppointment: (appointmentId) =>
    http.delete(`${baseUrl}/deleteAppointment/${appointmentId}`, { responseType: 'text' }).then((r) => r.data),
};

// Save a downloaded blob to disk.
export function saveBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
