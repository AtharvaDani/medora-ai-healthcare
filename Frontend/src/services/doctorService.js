import http from './http';
import { API_BASE } from '../config';

const baseUrl = `${API_BASE}/Doctor`;

export const doctorService = {
  addDoctorProfile: (doctor) =>
    http.post(`${baseUrl}/addprofile`, doctor, { responseType: 'text' }).then((r) => r.data ),

  findById: (id) => http.get(`${baseUrl}/profile/${id}`).then((r) => r.data),

  updateDoctor: (id, data) =>
    http.put(`${baseUrl}/update/${id}`, data, { responseType: 'text' }).then((r) => r.data),

  findAllByAddressAndName: (params) => http.get(`${baseUrl}/search`, { params }).then((r) => r.data),

  addAvailability: (id, availability) =>
    http.post(`${baseUrl}/schedule/${id}`, availability, { responseType: 'text' }).then((r) => r.data),

  findAllAvailability: (id) => http.get(`${baseUrl}/schedule/find/${id}`).then((r) => r.data),

  deleteAvailabilityById: (availabilityId) =>
    http.delete(`${baseUrl}/schedule/delete/${availabilityId}`, { responseType: 'text' }).then((r) => r.data),

  getAppointmentsWithPatients: (doctorId) =>
    http.get(`${baseUrl}/appointments-with-patients/${doctorId}`).then((r) => r.data),

  getAllFeedbacks: () => http.get(`${baseUrl}/getAllFeedbacks`).then((r) => r.data),

  reportPatient: (id) =>
    http.get(`${baseUrl}/reportPatient/${id}`, { responseType: 'text' }).then((r) => r.data),
};
