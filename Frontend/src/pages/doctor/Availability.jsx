import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { patientService, saveBlob } from '../../services/patientService';
import '../../styles/availability.scss';



export default function Availability() {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem('DoctorUserId');
  const [list, setList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [msg, setMsg] = useState('');

  const loadAvailability = async () => {
    const response = await doctorService.findAllAvailability(doctorId);
    const slots = response.map((i) => ({ id: i.id, date: i.date, time: i.time, isBooked: i.isBooked }));
    slots.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    setList(slots);
  };

  const loadAppointments = () =>
    doctorService.getAppointmentsWithPatients(doctorId).then(setAppointments).catch((e) => console.error('Error fetching appointments:', e));

  useEffect(() => {
    loadAvailability().catch((e) => console.error(e));
    loadAppointments();
  }, []);

  const addAvailability = async (e) => {
    e.preventDefault();
    if (!dateTime) return;
    const [date, time] = dateTime.split('T');
    try {
      await doctorService.addAvailability(doctorId, { date, time, isBooked: false });
    } catch (error) {
      console.error('Error adding availability:', error);
    }
    setShowAdd(false);
    setDateTime('');
    loadAvailability();
  };

  const removeAvailability = async (index) => {
    try {
      await doctorService.deleteAvailabilityById(list[index].id);
    } catch (e) {
      console.error(e);
    }
    loadAvailability();
  };

  const openPatientDetails = (availabilityId) => {
    const a = appointments.find((x) => +x.availabilityId === +availabilityId);
    if (!a) {
      console.warn('No appointment found for availability ID:', availabilityId);
      return;
    }
    setSelectedPatient({
      appointmentId: a.appointmentId, id: a.patientId, name: a.patientName, age: a.patientAge, gender: a.patientGender, mobileno: a.patientMobile,
      history: a.patientHistory, reportFilePath: a.reportFilePath, reason: a.reason, status: a.status,
    });
  };

  const fileNameFromPath = (p) => p.split(/[/\\]/).pop() || '';

  const downloadFile = async (filename) => {
    try {
      saveBlob(await patientService.downloadReport(filename), filename);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const reportPatient = async (id) => {
    const reported = JSON.parse(localStorage.getItem('reportedPatients') || '[]');
    if (reported.includes(id)) {
      flash("You've already reported this patient.");
      return;
    }
    try {
      await doctorService.reportPatient(id);
      flash('Patient Reported');
      reported.push(id);
      localStorage.setItem('reportedPatients', JSON.stringify(reported));
    } catch (error) {
      console.error('Error reporting patient', error);
      flash('Failed to report patient.');
    }
  };

  return (
    <div className="sc-availability">
      <div className="availability-wrapper">
        <header className="availability-hero">
          <h1 className="availability-title">Set Your Availability</h1>
          <p className="availability-subtitle">
            Quickly add and manage your available time slots below to keep your schedule up to date.
          </p>
          <button className="btn-add-availability bi bi-clipboard-plus" onClick={() => setShowAdd(true)} aria-label="Add Availability" type="button"></button>
        </header>

        {list.length > 0 && (
          <section className="availability-list-section">
            <h2 className="availability-list-header">Your Added Availability</h2>
            {list.map((avail, i) => (
              <div key={avail.id} className="availability-list">
                <article className="availability-item" role="listitem">
                  <time>Date :- {avail.date} Time :- {avail.time}</time>

                  {avail.isBooked ? (
                    <span className="booked-label" style={{ color: 'greenyellow', cursor: 'pointer' }}>
                      Booked =&gt;{' '}
                      <span
                        style={hoveredId === avail.id ? { color: 'purple' } : {}}
                        onMouseOver={() => setHoveredId(avail.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => openPatientDetails(avail.id)}
                      >
                        View
                      </span>
                    </span>
                  ) : (
                    <span className="booked-label" style={{ color: 'crimson' }}>Not Booked</span>
                  )}

                  <button className="btn-remove bi bi-trash3" onClick={() => removeAvailability(i)} type="button"></button>
                </article>
              </div>
            ))}
          </section>
        )}
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={addAvailability}>
              <h4 className="modal-header">Add Availability</h4>
              <input type="datetime-local" className="datetime-input" aria-label="Select date and time" required
                value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary" disabled={!dateTime}>Add</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPatient && (
        <div className="modal-backdrop" onClick={() => setSelectedPatient(null)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4 className="modal-header">Patient Details</h4>
            <div>
              <p><strong>Name:</strong> {selectedPatient.name}</p>
              <p><strong>Age:</strong> {selectedPatient.age}</p>
              <p><strong>Gender:</strong> {selectedPatient.gender}</p>
              <p><strong>Mobile No:</strong> {selectedPatient.mobileno}</p>
              <p><strong>Health Status:</strong> {selectedPatient.history}</p>
              <p><strong>Reason for Visit:</strong> {selectedPatient.reason}</p>
              <button className="btn btn-success" style={{ margin: 5, height: 50, width: 180 }}
                onClick={() => navigate('/consult/' + selectedPatient.appointmentId)}>
                <i className="bi bi-camera-video me-1"></i>Start video call
              </button>

              {selectedPatient.reportFilePath && (
                <>
                  <p><strong>Health Reports: </strong>{selectedPatient.reportFilePath.split('_').slice(1).join('_')}</p>
                  <button onClick={() => downloadFile(fileNameFromPath(selectedPatient.reportFilePath))}
                    className="btn btn-primary" style={{ margin: 5, height: 60, width: 180 }}>
                    Download Report
                  </button>
                  <button className="btn btn-danger" style={{ margin: 5, height: 60, width: 180 }} onClick={() => reportPatient(selectedPatient.id)}>
                    Report Patient
                  </button>
                </>
              )}
              <p style={{ color: 'greenyellow', textAlign: 'center', fontWeight: 'bolder', fontSize: 18, marginTop: 10 }}>{msg}</p>
            </div>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => setSelectedPatient(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
