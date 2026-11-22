import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import { patientNav } from '../../components/Layouts';
import { doctorService } from '../../services/doctorService';
import '../../styles/search-doctor.scss';

const clean = (s) => {
  const t = s.trim();
  return t !== '' && t.toLowerCase() !== 'null' ? t : undefined;
};

export default function SearchDoctor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Coming from Symptom Checker / Report Explainer: speciality is pre-filled.
  const [form, setForm] = useState({ city: '', speciality: searchParams.get('speciality') ?? '', name: '' });
  const [doctors, setDoctors] = useState([]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const search = async (e) => {
    e.preventDefault();
    if (!form.city.trim() || !form.speciality.trim()) return;
    const params = {};
    const name = clean(form.name), city = clean(form.city), speciality = clean(form.speciality);
    if (name) params.name = name;
    if (city) params.city = city;
    if (speciality) params.speciality = speciality;
    try {
      setDoctors(await doctorService.findAllByAddressAndName(params));
    } catch (error) {
      console.log(error);
    }
  };

  const openInfo = (id) => {
    localStorage.setItem('DocId', id);
    navigate('/doc-info/' + id);
  };

  return (
    <>
      <Header navItems={patientNav} />
      <div className="sc-search-doctor">
        <main className="bg-light" style={{ minHeight: '100vh' }}>
          <div className="container pt-16 pb-20" style={{ maxWidth: 1200 }}>
            <section className="text-center mb-5">
              <h1 className="display-1 fw-extrabold lh-sm mb-3 headline-gradient" style={{ fontWeight: 800 }}>Find Your Specialist Doctor</h1>
              <p className="lead text-secondary fs-5 mx-auto" style={{ maxWidth: 600, color: '#6b7280' }}>
                Quickly search and book appointments with trusted doctors in your city and specialty.
              </p>
            </section>

            <section className="mb-5">
              <form onSubmit={search} className="search-panel bg-white rounded-3 shadow-sm p-4">
                <div className="row g-4 align-items-center">
                  <div className="col-12 col-md-4 position-relative">
                    <input type="text" placeholder="Enter City Name" required className="form-control form-control-lg ps-5 border-2 rounded-3" value={form.city} onChange={set('city')} />
                    <span className="input-icon position-absolute top-50 start-0 translate-middle-y ps-3 accent-color" aria-hidden="true">📍</span>
                  </div>
                  <div className="col-12 col-md-4 position-relative">
                    <input type="text" placeholder="Enter Speciality of Doctor" required className="form-control form-control-lg ps-5 border-2 rounded-3" value={form.speciality} onChange={set('speciality')} />
                    <span className="input-icon position-absolute top-50 start-0 translate-middle-y ps-3 accent-color" aria-hidden="true">🔎</span>
                  </div>
                  <div className="col-12 col-md-4 position-relative">
                    <input type="text" placeholder="Enter Doctor Name" className="form-control form-control-lg ps-5 border-2 rounded-3" value={form.name} onChange={set('name')} />
                    <span className="input-icon position-absolute top-50 start-0 translate-middle-y ps-3 accent-color" aria-hidden="true">👨‍⚕️</span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-gradient btn-lg px-5 rounded-3 shadow-sm transition-hover">Find</button>
                </div>
              </form>
            </section>

            <section>
              <div className="row g-5">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="col-12 col-md-6 col-lg-4">
                    <article className="doctor-card card shadow-sm rounded-3 h-100 border-0 cursor-pointer transition-hover"
                      onClick={() => openInfo(doctor.id)} tabIndex={0} role="button" aria-pressed="false">
                      <div className="image-wrapper rounded-top overflow-hidden" style={{ height: 220 }}>
                        <img src={'data:image/jpeg;base64,' + doctor.image} alt="Doctor Image" className="card-img-top object-fit-cover h-100 w-100" />
                      </div>
                      <div className="card-body px-4 pt-3 pb-4">
                        <h3 className="doctor-name card-title fs-4 fw-semibold accent-color-dark mb-2">{doctor.name}</h3>
                        <p className="text-muted mb-1 body-text"><strong>Experience:</strong> {doctor.experience} years</p>
                        <p className="text-muted mb-1 body-text"><strong>Clinic:</strong> {doctor.clinicName}</p>
                        <p className="text-muted mb-1 text-truncate body-text" title={doctor.clinicAddress}><strong>Address:</strong> {doctor.clinicAddress}</p>
                        <p className="text-muted mb-1 body-text"><strong>Mobile:</strong> {doctor.mobileNo}</p>
                        <p className="text-muted mb-0 body-text"><strong>Consultation Fees:</strong> ${doctor.consultationFees}</p>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
