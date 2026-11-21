import { useNavigate } from 'react-router-dom';

export default function PreSearch() {
  const navigate = useNavigate();
  return (
    <div className="sc-pre-search">
      <main className="bg-white" style={{ minHeight: '100vh' }}>
        <div className="container pt-5 pb-5" style={{ maxWidth: 1200 }}>
          <section className="text-center py-5 mb-5 border-bottom border-light-subtle">
            <h1 className="display-1 fw-bold lh-sm mb-3" style={{ maxWidth: 650, marginLeft: 'auto', marginRight: 'auto', color: '#212529' }}>
              Find the perfect doctor for your health needs
            </h1>
            <p className="lead text-secondary fs-5" style={{ maxWidth: 550, marginLeft: 'auto', marginRight: 'auto' }}>
              Book appointments quickly and easily with verified medical experts near you.
            </p>
            <button className="btn btn-dark btn-lg px-5 mt-4 shadow-sm" onClick={() => navigate('/patient/search')}>Search</button>
          </section>

          <section className="mb-5">
            <h2 className="fw-bold mb-4 text-center" style={{ color: '#212529' }}>How It Works</h2>
            <div className="row g-4 justify-content-center">
              {[
                ['bi-search', 'Search Doctors', 'Explore doctors by speciality, location, and ratings.'],
                ['bi-calendar-check', 'Choose a Slot', 'Select a convenient appointment time that fits your schedule.'],
                ['bi-check2-circle', 'Confirm Booking', 'Confirm your appointment and get instant confirmation and reminders.'],
              ].map(([icon, title, text]) => (
                <div className="col-12 col-md-4" key={title}>
                  <div className="card text-center p-4 shadow-sm rounded-3 h-100">
                    <i className={`bi ${icon} mb-3`} style={{ fontSize: 48, color: '#0d6efd' }}></i>
                    <h5 className="fw-semibold mb-2">{title}</h5>
                    <p className="text-secondary fs-6 mb-0">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
