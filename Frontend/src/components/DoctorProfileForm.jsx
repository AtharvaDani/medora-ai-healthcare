import { useEffect, useState } from 'react';
import ImageCropField from './ImageCropField';






export const emptyDoctorForm = {
  name: '', about: '', mobileNo: '', gender: '', age: '', city: '',
  speciality: '', experience: '', clinicName: '', clinicAddress: '', consultationFees: '',
};










// Shared by the "add details" and "update profile" doctor pages (they were near-identical in Angular).
export default function DoctorProfileForm({ scope, heading, submitLabel, initial, msg, onSubmit }) {
  const [v, setV] = useState(initial ?? emptyDoctorForm);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (initial) setV(initial);
  }, [initial]);

  const set = (k) => (e) =>
    setV({ ...v, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit(v, image);
  };

  return (
    <div className={scope}>
      <h3 className="heading">{heading}</h3>
      <form onSubmit={submit} className="container" id="profileForm" noValidate>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="Name" className="form-label">Name</label>
            <input type="text" id="Name" className="form-control" placeholder="Enter your name" required value={v.name} onChange={set('name')} />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="AboutYou" className="form-label">About You</label>
            <textarea id="AboutYou" rows={12} className="form-control" placeholder="Tell us about yourself" required value={v.about} onChange={set('about')}></textarea>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="Mobileno" className="form-label">Mobile Number</label>
            <input type="text" id="Mobileno" className="form-control" placeholder="Enter your mobile number" required value={v.mobileNo} onChange={set('mobileNo')} />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="Gender" className="form-label">Gender</label>
            <select id="Gender" className="form-select" required value={v.gender} onChange={set('gender')}>
              <option value="" disabled>Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="Age" className="form-label">Age</label>
            <input type="number" id="Age" className="form-control" placeholder="Enter your age" min={0} max={120} required value={v.age} onChange={set('age')} />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="City" className="form-label">City</label>
            <input type="text" id="City" className="form-control" placeholder="Enter your city" required value={v.city} onChange={set('city')} />
          </div>

          <ImageCropField onChange={setImage} />

          <div className="col-md-6 mb-3">
            <label htmlFor="Speciality" className="form-label">Speciality</label>
            <input type="text" id="Speciality" className="form-control" placeholder="Enter your speciality" required value={v.speciality} onChange={set('speciality')} />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="Experience" className="form-label">Experience (In years)</label>
            <input type="number" id="Experience" className="form-control" placeholder="Enter years of experience" min={0} max={80} required value={v.experience} onChange={set('experience')} />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="ClinicName" className="form-label">Clinic Name</label>
            <input type="text" id="ClinicName" className="form-control" placeholder="Enter clinic name" required value={v.clinicName} onChange={set('clinicName')} />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="ClinicAddress" className="form-label">Clinic Address</label>
            <input type="text" id="ClinicAddress" className="form-control" placeholder="Enter clinic address" required value={v.clinicAddress} onChange={set('clinicAddress')} />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="ConsultationFee" className="form-label">Consultation Fee</label>
            <input type="number" id="ConsultationFee" className="form-control" placeholder="Enter consultation fee" min={0} required value={v.consultationFees} onChange={set('consultationFees')} />
          </div>
        </div>

        <button type="submit" className="btn btn-danger btn-block mt-3">{submitLabel}</button>
        <h3 className="mt-3 text-warning text-center" id="msg">{msg}</h3>
      </form>
    </div>
  );
}
