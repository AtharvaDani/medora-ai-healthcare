import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { patientNav } from '../../components/Layouts';
import { patientService } from '../../services/patientService';
import '../../styles/patient-update.scss';

const ALLOWED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

export default function UpdatePatientProfile() {
  const navigate = useNavigate();
  const id = localStorage.getItem('PatientUserId');
  const [v, setV] = useState({ name: '', mobileno: '', gender: '', age: '', address: '', history: '' });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    patientService.findPatientById(id).then((p) =>
      setV({
        name: p.name ?? '', mobileno: p.mobileno ?? '', gender: p.gender ?? '', age: String(p.age ?? ''),
        address: p.address ?? '', history: p.history ?? '',
      })
    );
  }, [id]);

  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setMsg('❌ Invalid file type. Please upload only PDF, DOCX, or TXT.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setMsg('');
    setFile(f);
  };

  const update = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('patient', JSON.stringify(v));
    if (file) formData.append('report', file);
    try {
      await patientService.updateProfile(id, formData);
      navigate('/patient/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <>
      <Header navItems={patientNav} />
      <div className="sc-patient-update">
        <h3 className="heading">Update Profile</h3>
        <form onSubmit={update} className="container" id="profileForm" noValidate>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" id="name" className="form-control" placeholder="Enter your name" required value={v.name} onChange={set('name')} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="mobileNo" className="form-label">Mobile Number</label>
              <input type="text" id="mobileNo" className="form-control" placeholder="Enter your mobile number" required value={v.mobileno} onChange={set('mobileno')} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select id="gender" className="form-select" required value={v.gender} onChange={set('gender')}>
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="age" className="form-label">Age</label>
              <input type="number" id="age" className="form-control" placeholder="Enter your age" min={0} max={120} required value={v.age} onChange={set('age')} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input type="text" id="address" className="form-control" placeholder="Enter your address" required value={v.address} onChange={set('address')} />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="reportFile" className="form-label">Upload Report (PDF, DOCX, TXT only) - optional</label>
              <input type="file" id="reportFile" onChange={onFile} accept=".pdf,.docx,.txt" className="form-control" />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="history" className="form-label">Health Status</label>
              <textarea id="history" className="form-control" placeholder="Enter current health status or history" rows={4} value={v.history} onChange={set('history')}></textarea>
            </div>

            <button type="submit" className="btn btn-danger btn-block mt-3">Save Changes</button>
            <h3 className="mt-3 text-warning text-center" id="msg">{msg}</h3>
          </div>
        </form>
      </div>
    </>
  );
}
