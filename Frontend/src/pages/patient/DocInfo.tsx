import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import { patientNav } from '../../components/Layouts';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { showMessage } from '../../services/messageService';
import '../../styles/doc-info.scss';

interface Slot { id: any; date: string; time: string; isBooked: boolean }

const titleCase = (s: string = '') => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

export default function DocInfo() {
  const params = useParams();
  const doctorId = params.id ?? localStorage.getItem('DocId');
  const loggedInPatient = localStorage.getItem('PatientUserId');

  const [doctor, setDoctor] = useState<any>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [booking, setBooking] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [addFeedback, setAddFeedback] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const loadReviews = () => patientService.getDoctorReviews(doctorId).then(setReviews);

  useEffect(() => {
    doctorService.findById(doctorId).then(setDoctor);

    doctorService
      .findAllAvailability(doctorId)
      .then((response: any[]) => {
        const s: Slot[] = response.map((i) => ({ id: i.id, date: i.date, time: i.time, isBooked: i.isBooked }));
        s.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        setSlots(s);
      })
      .catch((e) => console.error('Error fetching availability slots:', e));

    loadReviews();
  }, [doctorId]);

  const onBook = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      showMessage('Please fill in all fields and select a slot.', 3000);
      return;
    }
    const appointment = {
      reason,
      doctor: { id: doctor.id },
      patient: { id: Number(loggedInPatient) },
      availability: { id: selectedSlot },
      status: 'PENDING',
    };
    try {
      await patientService.bookAppointment(appointment);
      setBooking(false);
      setReason('');
      showMessage('Appointment Booked!! \n check profile to see details or cancel', 6000);
    } catch (error) {
      console.error(error);
      showMessage('Booking failed.', 3000);
    }
  };

  const submitFeedback = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await patientService.saveFeedback({
        rating,
        FeedbackComment: comment,
        doctor: { id: doctor.id },
        patient: { id: Number(loggedInPatient) },
      });
    } catch (error) {
      console.error(error);
    }
    setAddFeedback(false);
    setComment('');
    setRating(0);
    loadReviews();
  };

  const popupStyle = { width: '95vw', maxWidth: 480, zIndex: 1050, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' };

  return (
    <>
      <Header navItems={patientNav} />
      <div className="sc-doc-info">
        <div className="container my-5" style={{ maxWidth: '80%' }}>
          {doctor && (
            <div className="card shadow-lg rounded-4 p-4">
              <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                <img src={'data:image/jpeg;base64,' + doctor.image} alt="Profile Image" className="rounded-circle border border-3 border-primary"
                  width={180} height={180} style={{ objectFit: 'cover', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }} />
                <div className="flex-grow-1">
                  <h1 className="fw-bold mb-3 display-5 text-primary">{doctor.name}</h1>
                  <h4 className="fw-semibold text-secondary mb-2">About Me</h4>
                  <p className="text-muted fs-5 mb-4" style={{ lineHeight: 1.6 }}>{doctor.about}</p>
                  <div className="row g-3 text-muted fs-6">
                    <div className="col-6 col-md-4"><strong>Clinic Contact:</strong> {doctor.mobileNo}</div>
                    <div className="col-6 col-md-4"><strong>Age:</strong> {doctor.age}</div>
                    <div className="col-6 col-md-4"><strong>City:</strong> {doctor.city}</div>
                    <div className="col-6 col-md-4"><strong>Speciality:</strong> {doctor.speciality}</div>
                    <div className="col-6 col-md-4"><strong>Experience:</strong> {doctor.experience} years</div>
                    <div className="col-6 col-md-4"><strong>Clinic Name:</strong> {doctor.clinicName}</div>
                    <div className="col-12 col-md-8"><strong>Clinic Address:</strong> {doctor.clinicAddress}</div>
                    <div className="col-6 col-md-4">
                      <strong>Consultation Fees:</strong>{' '}
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(doctor.consultationFees)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center my-5">
            <button onClick={() => setBooking(true)} className="btn btn-dark btn-lg px-5 shadow-lg">Book Appointment</button>
          </div>

          {booking && (
            <div className="booking-popup card rounded-4 shadow-lg p-4 position-fixed top-50 start-50 translate-middle bg-white" style={popupStyle}>
              <h3 className="fw-bold mb-4 text-center text-primary">Available Slots</h3>
              <div className="row g-3 mb-4">
                {slots.filter((s) => !s.isBooked).map((slot) => (
                  <div key={slot.id} className="col-12 col-md-6">
                    <div className="d-flex justify-content-center">
                      <div className="card slot-card rounded-3 shadow-sm p-3 h-100 d-flex flex-column justify-content-between">
                        <p className="mb-3 fs-6 fw-semibold text-dark">{slot.date} - {slot.time}</p>
                        <button onClick={() => setSelectedSlot(slot.id)} className="btn btn-outline-primary w-100">Book This Slot</button>
                        {selectedSlot === slot.id && (
                          <p className="mb-3 fs-6 fw-semibold text-success text-center" style={{ marginTop: 5 }}>Slot selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="fw-bold mb-3 text-center text-dark">Book Appointment</h3>
              <form onSubmit={onBook}>
                <label htmlFor="bookingReason" className="form-label fw-semibold">Reason for Appointment:</label>
                <input id="bookingReason" type="text" className="form-control mb-4" placeholder="Enter your reason for appointment"
                  value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-success px-4 shadow">Confirm</button>
                  <button type="button" onClick={() => setBooking(false)} className="btn btn-secondary px-4 shadow">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {addFeedback && (
            <div className="booking-popup card rounded-4 shadow-lg p-4 position-fixed top-50 start-50 translate-middle bg-white" style={popupStyle}>
              <h3 className="fw-bold mb-3 text-center text-primary">Add Feedback</h3>
              <form onSubmit={submitFeedback}>
                <div>
                  <label className="fw-semibold">Rating:</label>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} onClick={() => setRating(n)} onMouseOver={() => setHover(n)} onMouseLeave={() => setHover(0)}
                      className={`star${(hover || rating) >= n ? ' filled' : ''}`} style={{ cursor: 'pointer', fontSize: '1.5rem' }}>
                      ★
                    </span>
                  ))}
                </div>
                <label htmlFor="FeedbackComment" className="form-label fw-semibold">Enter Comment</label>
                <textarea id="FeedbackComment" className="form-control mb-4" placeholder="Comment Here" rows={4} cols={50}
                  value={comment} onChange={(e) => setComment(e.target.value)} />
                <div className="d-flex justify-content-between">
                  <button type="submit" className="btn btn-success px-4 shadow confirmbtn">Confirm</button>
                  <button type="button" onClick={() => setAddFeedback(false)} className="btn btn-danger px-4 shadow">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid">
            <div className="grid-1"><h1 style={{ display: 'inline' }} className="text-dark">Reviews</h1></div>
            <div className="grid-2">
              <button onClick={() => setAddFeedback(true)} className="btn btn-outline-success add-reviewbtn">Add Review</button>
            </div>
          </div>

          {reviews && reviews.length ? (
            reviews.map((review, idx) => (
              <div key={review.id ?? idx} className="review border-bottom pb-3 mb-3 reviews">
                <div className="grid">
                  <div className="grid-1">
                    <strong style={{ color: 'rgb(226, 43, 43)', fontSize: 30 }}>{titleCase(review.patient?.name)}</strong><br />
                  </div>
                  <div className="grid-2">
                    <strong>Date:</strong> {new Date(review.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}<br />
                  </div>
                </div>
                <strong style={{ fontSize: 20 }}>Rating:</strong>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i}>
                    <span className={i < review.rating ? 'text-warning' : 'text-secondary'} style={{ fontSize: 20 }}>★</span>
                  </span>
                ))}
                <br />
                <strong>Comment:</strong> {review.feedbackComment}<br />
              </div>
            ))
          ) : (
            <p className="text-muted">No reviews yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
