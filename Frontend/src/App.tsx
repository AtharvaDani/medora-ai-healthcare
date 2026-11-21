import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth';
import { AdminLayout, DoctorLayout, PatientLayout } from './components/Layouts';

import Login from './pages/main/Login';
import Register from './pages/main/Register';
import NotFound from './pages/main/NotFound';
import AiChat from './pages/AiChat';
import VideoConsult from './pages/VideoConsult';

import DoctorHome from './pages/doctor/Home';
import DoctorProfile from './pages/doctor/Profile';
import AddDoctorProfile from './pages/doctor/AddProfile';
import UpdateDoctorProfile from './pages/doctor/UpdateProfile';
import Availability from './pages/doctor/Availability';
import DoctorAnalytics from './pages/doctor/Analytics';

import PatientHome from './pages/patient/Home';
import PatientProfile from './pages/patient/Profile';
import AddInfo from './pages/patient/AddInfo';
import UpdatePatientProfile from './pages/patient/UpdateProfile';
import PreSearch from './pages/patient/PreSearch';
import SearchDoctor from './pages/patient/SearchDoctor';
import DocInfo from './pages/patient/DocInfo';
import SymptomChecker from './pages/patient/SymptomChecker';
import ReportExplainer from './pages/patient/ReportExplainer';

import Doctors from './pages/admin/Doctors';
import Patients from './pages/admin/Patients';
import Blocked from './pages/admin/Blocked';
import AdminAnalytics from './pages/admin/Analytics';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Register" element={<Register />} />

      {/* Doctor (secured) */}
      <Route path="/doctor/profile/addInfo" element={<RequireAuth role="Doctor"><AddDoctorProfile /></RequireAuth>} />
      <Route path="/doctor/profile/update" element={<RequireAuth role="Doctor"><UpdateDoctorProfile /></RequireAuth>} />
      <Route path="/doctor" element={<RequireAuth role="Doctor"><DoctorLayout /></RequireAuth>}>
        <Route index element={<DoctorHome />} />
        <Route path="home" element={<DoctorHome />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="schedule" element={<Availability />} />
        <Route path="analytics" element={<DoctorAnalytics />} />
      </Route>

      {/* Patient (secured) */}
      <Route path="/patient/search" element={<RequireAuth role="User"><SearchDoctor /></RequireAuth>} />
      <Route path="/patient/profile/addInfo" element={<RequireAuth role="User"><AddInfo /></RequireAuth>} />
      <Route path="/patient/profile/update" element={<RequireAuth role="User"><UpdatePatientProfile /></RequireAuth>} />
      <Route path="/patient" element={<RequireAuth role="User"><PatientLayout /></RequireAuth>}>
        <Route index element={<PatientHome />} />
        <Route path="home" element={<PatientHome />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="pre-search" element={<PreSearch />} />
        <Route path="symptom-checker" element={<SymptomChecker />} />
        <Route path="report-explainer" element={<ReportExplainer />} />
      </Route>

      {/* Public */}
      <Route path="/doc-info/:id" element={<DocInfo />} />
      <Route path="/consult/:appointmentId" element={<RequireAuth><VideoConsult /></RequireAuth>} />
      <Route path="/AI" element={<RequireAuth><AiChat /></RequireAuth>} />

      {/* Admin */}
      <Route path="/admin" element={<RequireAuth role="Admin"><AdminLayout /></RequireAuth>}>
        <Route index element={<Navigate to="DoctorsInfo" replace />} />
        <Route path="DoctorsInfo" element={<Doctors />} />
        <Route path="UsersInfo" element={<Patients />} />
        <Route path="BlockedInfo" element={<Blocked />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
