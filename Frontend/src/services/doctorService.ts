import http from './http';
import { API_BASE } from '../config';

const baseUrl = `${API_BASE}/Doctor`;

export const doctorService = {
  addDoctorProfile: (doctor: FormData) =>
    http.post(`${baseUrl}/addprofile`, doctor, { responseType: 'text' }).then((r) => r.data as string),

  findById: (id: any) => http.get(`${baseUrl}/profile/${id}`).then((r) => r.data),

  updateDoctor: (id: string, data: FormData) =>
    http.put(`${baseUrl}/update/${id}`, data, { responseType: 'text' }).then((r) => r.data),

  findAllByAddressAndName: (params: any) => http.get(`${baseUrl}/search`, { params }).then((r) => r.data),

  addAvailability: (id: any, availability: any) =>
    http.post(`${baseUrl}/schedule/${id}`, availability, { responseType: 'text' }).then((r) => r.data),

  findAllAvailability: (id: any) => http.get(`${baseUrl}/schedule/find/${id}`).then((r) => r.data),

  deleteAvailabilityById: (availabilityId: any) =>
    http.delete(`${baseUrl}/schedule/delete/${availabilityId}`, { responseType: 'text' }).then((r) => r.data),

  getAppointmentsWithPatients: (doctorId: any) =>
    http.get(`${baseUrl}/appointments-with-patients/${doctorId}`).then((r) => r.data),

  getAllFeedbacks: () => http.get(`${baseUrl}/getAllFeedbacks`).then((r) => r.data),

  reportPatient: (id: number) =>
    http.get(`${baseUrl}/reportPatient/${id}`, { responseType: 'text' }).then((r) => r.data),
};
