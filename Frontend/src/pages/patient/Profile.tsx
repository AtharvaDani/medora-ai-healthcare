import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService, saveBlob } from '../../services/patientService';
import { showMessage } from '../../services/messageService';
import '../../styles/patient-profile.scss';

const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { dateStyle: 'medium' });
const fmtTime = (s: string) => new Date(s).toLocaleTimeString('en-US', { timeStyle: 'short' });

export default function PatientProfile() {
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem('PatientUserId');
  const [patient, setPatient] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);

  useEffect(() => {
    patientService
      .findPatientById(loggedInUser)
      .then((p) => {
        setPatient(p);
        localStorage.setItem('PatientId', p.id);
      })
      .catch((e) => console.log(e))
      .finally(() => setLoaded(true));
  }, [loggedInUser]);

  const reportFileName = (): string => {
    if (!patient?.reportFilePath) return '';
    return (patient.reportFilePath as string).split(/[/\\]/).pop() || '';
  };
  const displayFileName = reportFileName().split('_').slice(1).join('_');

  const edit = () => navigate('/patient/profile/update');

  const cancelAppointment = async (appointmentId: number) => {
    try {
      await patientService.cancelAppointment(appointmentId);
      showMessage('Appointment canceled successfully!', 3000);
      setPatient({ ...patient, appointments: patient.appointments.filter((a: any) => a.appointmentId !== appointmentId) });
    } catch (error) {
      console.error('Cancel failed', error);
      showMessage('Failed to cancel appointment.', 3000);
    }
  };

  const downloadReport = async () => {
    if (!patient?.reportFilePath) {
      showMessage('No report available for download', 3000);
      return;
    }
    const fileName = reportFileName();
    try {
      saveBlob(await patientService.downloadReport(fileName), fileName);
    } catch (err) {
      console.error('Download failed', err);
      showMessage('Failed to download the report', 3000);
    }
  };

  if (!loaded) return null;

  const items: [string, string, string, any, boolean][] = [
    ['bi-person', 'Name', 'Name', patient?.name, false],
    ['bi-telephone', 'Mobile No', 'Mobile No', patient?.mobileno, false],
    ['bi-gender-ambiguous', 'Gender', 'Gender', patient?.gender, false],
    ['bi-calendar', 'Age', 'Age', patient?.age, false],
    ['bi-house', 'Address', 'Address', patient?.address, true],
  ];

  return (
    <div className="sc-patient-profile">
      <div className="container" style={{ marginTop: 25 }}>
        {patient ? (
          <>
            <section role="region" aria-label="Patient Profile" className="profile-card" tabIndex={0}>
              <header className="profile-header" id="profile-title"><h3>Your Profile</h3></header>
              {items.map(([icon, label, aria, value, wide]) => (
                <div className="profile-item" key={label} style={wide ? { gridColumn: '1 / -1' } : undefined}>
                  <i className={`bi ${icon}`}></i>
                  <span className="profile-label">{label}:</span>
                  <span className="profile-value">{value}</span>
                  <button className="edit-btn" aria-label={`Edit ${aria}`} onClick={edit}><i className="bi bi-pencil"></i></button>
                </div>
              ))}
              <div className="profile-item" style={{ gridColumn: '1 / -1' }}>
                <i className="bi bi-heart"></i>
                <span className="profile-label">Health Status:</span>
                <span className="profile-value">
                  {patient.history}
                  <button className="edit-btn" aria-label="Edit Health Status" onClick={edit}><i className="bi bi-pencil"></i></button>
                </span>
              </div>
              <div className="profile-item" style={{ gridColumn: '1 / -1' }}>
                <i className="bi bi-file-earmark-medical"></i>
                <span className="profile-label">Health Report: {displayFileName}</span>
                <div className="d-flex align-items-center mt-2">
                  {patient.reportFilePath ? (
                    <button onClick={downloadReport} className="btn btn-sm btn-outline-primary me-2">
                      <i className="bi bi-download"></i> Download Report
                    </button>
                  ) : (
                    <span className="text-muted small">No report available</span>
                  )}
                </div>
              </div>
            </section>

            <section role="region" aria-label="Health Overview" className="overview-card" tabIndex={0}>
              <h4 className="overview-header">Health Overview</h4>
              <div className="metric">
                <span className="metric-label" onClick={() => setShowAppointments(true)}>
                  <i className="bi bi-calendar-check"></i> Upcoming Appointments
                </span>
              </div>
              <div className="metric">
                <span className="metric-label"><i className="bi bi-capsule"></i> Active Medications</span>
                <span className="metric-value">{patient.medications?.length || 0}</span>
              </div>
              <div className="metric" onClick={() => setShowScore(true)}>
                <span className="metric-label"><i className="bi bi-capsule"></i> Health Score</span>
                <span className="metric-value">{patient.healthScore || 'N/A'}</span>
              </div>

              {showScore && (
                <div className="modal-overlay" onClick={() => setShowScore(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline', marginTop: 10, marginBottom: 5 }}>
                      <h3 style={{ display: 'inline' }}>Health Analysis</h3>
                      <span style={{ fontWeight: 'bold', color: 'gray' }}> (FROM AI)</span>
                    </div>
                    <p><strong>Health Score:</strong> {patient.healthScore}</p>
                    <p><strong>Health Summary:</strong><br />{patient.healthSummary || 'Not available'}</p>
                    <p>
                      <strong>Suggestions:</strong><br />
                      {(patient.healthSuggestions?.split('\n') ?? []).map((s: string, i: number) => (
                        <span key={i}>- {s}<br /></span>
                      ))}
                    </p>
                    <button onClick={() => setShowScore(false)} className="btn btn-danger">Close</button>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="new-user" role="region" aria-label="New User Welcome">
            <h1>Welcome to Medora AI Healthcare!</h1>
            <p>Add Your Details From Here</p>
            <button className="btn-add-details" onClick={() => navigate('/patient/profile/addInfo')}>Add Details</button>
          </section>
        )}
      </div>

      <p style={{ textAlign: 'center', color: 'gray', marginTop: 10 }}>
        Your Health details are shared with the doctor you choose to book an appointment with. <br />
        Please ensure that the information is accurate and up-to-date to facilitate better healthcare services. <br />
        For any assistance, please contact our support team.
      </p>

      {showAppointments && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} aria-modal="true" role="dialog" onClick={() => setShowAppointments(false)}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ position: 'relative', transform: 'none', top: 'auto', left: 'auto' }}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Your Upcoming Appointments</h5>
                  <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowAppointments(false)}></button>
                </div>

                {patient?.appointments?.length > 0 && (
                  <div className="modal-body">
                    {patient.appointments.map((a: any, i: number) => (
                      <div key={a.appointmentId} className="mb-4 p-3 border rounded shadow-sm bg-light">
                        <h6>Appointment {i + 1}</h6>
                        <p>
                          <strong>Date:</strong> {fmtDate(a.availabilityDatetime)}
                          <strong style={{ marginLeft: '20%' }}>Time:</strong> {fmtTime(a.availabilityDatetime)}
                        </p>
                        <p><strong>Doctor:</strong> {a.doctorName}</p>
                        <p><strong>Clinic Address:</strong> {a.clinicAddress}</p>
                        <p><strong>Location:</strong> {a.doctorCity}</p>
                        <button className="btn btn-success btn-sm me-2" onClick={() => navigate('/consult/' + a.appointmentId)}>
                          <i className="bi bi-camera-video me-1"></i>Join video call
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => cancelAppointment(a.appointmentId)}>Cancel</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAppointments(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}
