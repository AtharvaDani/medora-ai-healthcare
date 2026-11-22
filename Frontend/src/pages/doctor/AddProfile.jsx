import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { doctorNav } from '../../components/Layouts';
import DoctorProfileForm, { } from '../../components/DoctorProfileForm';
import { doctorService } from '../../services/doctorService';
import { showMessage } from '../../services/messageService';
import '../../styles/doctor-add-profile.scss';

export default function AddDoctorProfile() {
  const navigate = useNavigate();
  const uid = localStorage.getItem('DoctorUserId') ?? '';

  const onSubmit = async (v, image) => {
    const mobileOk = /^[0-9+\- ]{7,15}$/.test(v.mobileNo);
    if (Object.values(v).some((x) => String(x).trim() === '') || !mobileOk || !image) {
      showMessage(
        !image && Object.values(v).every((x) => String(x).trim() !== '')
          ? 'Please choose and crop a profile image.'
          : 'Please fill out all required fields.',
        3000
      );
      return;
    }

    const formData = new FormData();
    formData.append('id', uid);
    (Object.keys(v) ).forEach((k) => formData.append(k, v[k]));
    formData.append('image', image);

    try {
      const response = await doctorService.addDoctorProfile(formData);
      if (response === 'profile already exists') {
        showMessage('profile already exists', 3000);
      } else {
        showMessage('Profile Added Successfully', 3000);
      }
      navigate('/doctor/profile');
    } catch (error) {
      console.error('Error adding profile:', error);
      showMessage('Error adding profile', 3000);
    }
  };

  return (
    <>
      <Header navItems={doctorNav} />
      <DoctorProfileForm scope="sc-doctor-add-profile" heading="Add Details" submitLabel="Add Details" onSubmit={onSubmit} />
    </>
  );
}
