import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import '../../styles/doctor-profile.scss';

export default function DoctorProfile() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const loggedInUserId = localStorage.getItem('DoctorUserId');

  useEffect(() => {
    doctorService
      .findById(loggedInUserId)
      .then((d) => {
        setDoctor(d);
        localStorage.setItem('LoggedIndocId', d.id);
      })
      .catch((e) => console.log(e))
      .finally(() => setLoaded(true));
  }, [loggedInUserId]);

  if (!loaded) return null;

  return (
    <div className="sc-doctor-profile">
      {doctor ? (
        <div className="container mt-5">
          <div className="container my-5">
            <div className="card shadow-lg border-0 rounded-4 p-4 bg-light">
              <div className="text-center mb-4">
                <img src={'data:image/jpeg;base64,' + doctor.image} alt="Doctor Image" className="rounded-circle shadow" width={150} height={150} />
                <h2 className="mt-3 fw-bold text-primary">{doctor.name}</h2>
                <p className="text-muted fst-italic">{doctor.speciality}</p>
                <button className="btn btn-outline-primary btn-sm mt-2" onClick={() => navigate('/doctor/profile/update')}>
                  <i className="bi bi-pencil-square"></i> Edit Profile
                </button>
              </div>

              <div className="row gy-4">
                <div className="col-md-6">
                  <div className="bg-white rounded p-3 shadow-sm h-100">
                    <h5 className="text-secondary"><i className="bi bi-person-fill text-primary me-2"></i>About</h5>
                    <p className="mb-2"><strong>About Me:</strong> <span className="text-dark">{doctor.about}</span></p>
                    <p><strong>Gender:</strong> <span className="text-dark">{doctor.gender}</span></p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-white rounded p-3 shadow-sm h-100">
                    <h5 className="text-secondary"><i className="bi bi-info-circle-fill text-primary me-2"></i>Basic Info</h5>
                    <p className="mb-2"><strong>Age:</strong> {doctor.age}</p>
                    <p className="mb-2"><strong>Mobile No:</strong> {doctor.mobileNo}</p>
                    <p className="mb-2"><strong>City:</strong> {doctor.city}</p>
                    <p><strong>Experience:</strong> {doctor.experience} years</p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="bg-white rounded p-4 shadow-sm">
                  <h5 className="text-secondary mb-4"><i className="bi bi-hospital-fill text-primary me-2"></i>Clinic Information</h5>
                  <div className="row gy-3">
                    <div className="col-md-6">
                      <p><strong>Clinic Name:</strong> {doctor.clinicName}</p>
                      <p><strong>Clinic Address:</strong> {doctor.clinicAddress}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Consultation Fees:</strong> ₹{doctor.consultationFees}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section className="new-user" role="region" aria-label="New User Welcome">
          <h1>Welcome to Medora AI Healthcare!</h1>
          <p>Add Your Details From Here</p>
          <button className="btn-add-details" onClick={() => navigate('/doctor/profile/addInfo')}>Add Details</button>
        </section>
      )}
    </div>
  );
}
