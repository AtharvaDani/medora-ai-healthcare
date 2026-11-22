import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { doctorNav } from '../../components/Layouts';
import DoctorProfileForm, { } from '../../components/DoctorProfileForm';
import { doctorService } from '../../services/doctorService';
import { showMessage } from '../../services/messageService';
import '../../styles/doctor-update.scss';

export default function UpdateDoctorProfile() {
  const navigate = useNavigate();
  const id = localStorage.getItem('DoctorUserId') ?? '';
  const [initial, setInitial] = useState();

  useEffect(() => {
    doctorService.findById(id).then((d) =>
      setInitial({
        name: d.name ?? '', about: d.about ?? '', mobileNo: String(d.mobileNo ?? ''), gender: d.gender ?? '',
        age: String(d.age ?? ''), city: d.city ?? '', speciality: d.speciality ?? '',
        experience: String(d.experience ?? ''), clinicName: d.clinicName ?? '', clinicAddress: d.clinicAddress ?? '',
        consultationFees: String(d.consultationFees ?? ''),
      })
    );
  }, [id]);

  const onSubmit = async (v, image) => {
    const formData = new FormData();
    (Object.keys(v) ).forEach((k) => formData.append(k, v[k]));
    if (image) formData.append('image', image); // only when a new one is chosen

    try {
      await doctorService.updateDoctor(id, formData);
      showMessage('Details updated successfully', 3000);
      navigate('/doctor/profile');
    } catch (error) {
      console.error(error);
      showMessage('Error updating doctor details', 3000);
    }
  };

  return (
    <>
      <Header navItems={doctorNav} />
      <DoctorProfileForm scope="sc-doctor-update" heading="Update Profile" submitLabel="Save Changes" initial={initial} onSubmit={onSubmit} />
    </>
  );
}
