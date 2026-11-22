import { Outlet } from 'react-router-dom';
import Header, { } from './Header';
import Footer from './Footer';

export const adminNav = [
  { name: 'Doctors', route: 'admin/DoctorsInfo' },
  { name: 'Users', route: 'admin/UsersInfo' },
  { name: 'Blocked', route: 'admin/BlockedInfo' },
  { name: 'Analytics', route: 'admin/analytics' },
  { name: 'Ask AI', route: '/AI' },
];

export const doctorNav = [
  { name: 'Home', route: 'doctor/home' },
  { name: 'My Profile', route: 'doctor/profile' },
  { name: 'Ask AI', route: 'AI' },
  { name: 'Schedule', route: 'doctor/schedule' },
  { name: 'Analytics', route: 'doctor/analytics' },
];

export const patientNav = [
  { name: 'Home', route: 'patient/home' },
  { name: 'My Profile', route: 'patient/profile' },
  { name: 'Find A Doctor', route: 'patient/pre-search' },
  { name: 'Symptom Check', route: 'patient/symptom-checker' },
  { name: 'Report Explainer', route: 'patient/report-explainer' },
  { name: 'Ask AI', route: 'AI' },
];

// Angular "navbar" shell components: header + <router-outlet>
export function AdminLayout() {
  return (
    <>
      <Header navItems={adminNav} />
      <Outlet />
      <Footer />
    </>
  );
}
export function DoctorLayout() {
  return (
    <>
      <Header navItems={doctorNav} />
      <Outlet />
    </>
  );
}

export function PatientLayout() {
  return (
    <>
      <Header navItems={patientNav} />
      <Outlet />
    </>
  );
}
