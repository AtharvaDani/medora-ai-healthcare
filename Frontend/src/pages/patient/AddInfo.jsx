import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { patientNav } from '../../components/Layouts';
import { patientService } from '../../services/patientService';
import { showMessage } from '../../services/messageService';
import '../../styles/patient-add-info.scss';

const ALLOWED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv'];

export default function AddInfo() {
  const navigate = useNavigate();
  const id = localStorage.getItem('PatientUserId');
  const [v, setV] = useState({ Name: '', Age: '', Gender: '', Mobileno: '', Address: '', History: '' });
  const [touched, setTouched] = useState({});
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const age = Number(v.Age);
  const errors = {
    Name: v.Name.trim() === '' ? 'Name is required' : v.Name.length < 3 ? 'Name should be at least 3 characters' : '',
    Mobileno: v.Mobileno === '' ? 'Mobile number is required' : !/^[0-9]{10}$/.test(v.Mobileno) ? 'Please enter a valid 10-digit mobile number' : '',
    Gender: v.Gender === '' ? 'Please select a gender' : '',
    Age: v.Age === '' ? 'Age is required' : age < 1 ? 'Age must be at least 1' : age > 120 ? 'Age must be less than 120' : '',
    Address: v.Address.trim() === '' ? 'Address is required' : '',
    History: v.History.trim() === '' ? 'Health status is required' : '',
  };
  const invalid = Object.values(errors).some(Boolean);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const blur = (k) => () => setTouched({ ...touched, [k]: true });
  const err = (k) => touched[k] && errors[k] && <div className="text-danger"><small>{errors[k]}</small></div>;

  const onFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 5 * 1024 * 1024) {
      setFileError('File size should not exceed 5MB'); setFile(null);
    } else if (f && !ALLOWED.includes(f.type)) {
      setFileError('Invalid file type. Only PDF, DOCX, CSV are allowed.'); setFile(null);
    } else {
      setFile(f); setFileError('');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (invalid || fileError) {
      setTouched({ Name: true, Age: true, Gender: true, Mobileno: true, Address: true, History: true });
      showMessage('Please correct the form errors', 3000);
      return;
    }
    setSubmitting(true);
    try {
      const response = await patientService.addPatientProfile({ id, ...v, Age: age }, file);
      if (response === 'Profile already exists') {
        showMessage('Profile already exists', 3000);
      } else {
        showMessage('Profile Added Successfully', 3000);
        navigate('/patient/profile');
      }
    } catch (error) {
      console.error('Error adding profile:', error);
      showMessage('Something went wrong', 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header navItems={patientNav} />
      <div className="sc-patient-add-info">
        <h3 className="heading">Add Details</h3>
        <form onSubmit={submit} className="container" noValidate>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="Name" className="form-label">Name</label>
              <input type="text" id="Name" className="form-control" value={v.Name} onChange={set('Name')} onBlur={blur('Name')} />
              {err('Name')}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="Mobileno" className="form-label">Mobile number</label>
              <input type="text" id="Mobileno" className="form-control" value={v.Mobileno} onChange={set('Mobileno')} onBlur={blur('Mobileno')} />
              {err('Mobileno')}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="Gender" className="form-label">Gender</label>
              <select id="Gender" className="form-select" value={v.Gender} onChange={set('Gender')} onBlur={blur('Gender')}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {err('Gender')}
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="Age" className="form-label">Age</label>
              <input type="number" id="Age" className="form-control" min={1} max={120} value={v.Age} onChange={set('Age')} onBlur={blur('Age')} />
              {err('Age')}
            </div>
            <div className="col-12 mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input type="text" id="address" className="form-control" value={v.Address} onChange={set('Address')} onBlur={blur('Address')} />
              {err('Address')}
            </div>
            <div className="col-12 mb-3">
              <label htmlFor="history" className="form-label">Health Status</label>
              <textarea rows={4} id="history" className="form-control" value={v.History} onChange={set('History')} onBlur={blur('History')}></textarea>
              {err('History')}
            </div>
            <div className="col-12 mb-4">
              <label htmlFor="healthReport" className="form-label">Health Report (PDF, DOCX, or CSV)</label>
              <input type="file" id="healthReport" className="form-control" onChange={onFile} accept=".pdf,.docx,.csv" />
              <div className="form-text">Upload your health report (Max size: 5MB)</div>
              {fileError && <div className="text-danger"><small>{fileError}</small></div>}
            </div>
          </div>

          <button type="submit" className="btn btn-danger btn-block mt-3" disabled={invalid || submitting}>
            {!submitting ? <span>Add Details</span> : (<><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span> Saving...</span></>)}
          </button>
        </form>
      </div>
    </>
  );
}
