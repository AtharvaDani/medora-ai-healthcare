import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import '../../styles/doctor-home.scss';

export default function DoctorHome() {
  const navigate = useNavigate();
  return (
    <div className="sc-doctor-home">
      <HomeSections
        onExplore={() => navigate('/doctor/schedule')}
        onContact={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
      />
      <Footer />
    </div>
  );
}

// Shared marketing sections (identical on the patient and doctor home pages).
export function HomeSections({ onExplore, onContact }: { onExplore: () => void; onContact: () => void }) {
  const navigate = useNavigate();
  return (
    <>
      <section id="hero" className="hero">
        <div className="container">
          <span className="hero-badge"><i className="bi bi-stars me-1"></i>AI-powered healthcare</span>
          <h1>Welcome to Medora AI Healthcare</h1>
          <p className="hero-sub">Smarter care, powered by AI. Your health, our priority.</p>
          <div className="hero-actions">
            <a onClick={onExplore} className="btn btn-light btn-lg">Explore Services</a>
            <a onClick={() => navigate('/AI')} className="btn btn-outline-light btn-lg">
              <i className="bi bi-chat-heart me-2"></i>Ask Medora AI
            </a>
            <a onClick={onContact} className="btn btn-outline-light btn-lg">Contact Us</a>
          </div>
        </div>
      </section>

      <section id="features" className="features text-center">
        <div className="container">
          <h2>Why choose Medora AI?</h2>
          <p className="section-sub">Modern care that feels personal, simple and always within reach.</p>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon"><i className="bi bi-heart-pulse-fill"></i></div>
                <h4>Personalized Care</h4>
                <p>Get tailored health insights and advice built around you.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon"><i className="bi bi-calendar-check-fill"></i></div>
                <h4>Easy Appointments</h4>
                <p>Book appointments in seconds and manage your time with ease.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon"><i className="bi bi-robot"></i></div>
                <h4>24/7 AI Assistant</h4>
                <p>Ask Medora AI any health question, anytime, anywhere.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services text-center">
        <div className="container">
          <h2>Our Services</h2>
          <p className="section-sub">Everything you need for a healthier tomorrow, in one place.</p>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="service-card">
                <h4>General Consultation</h4>
                <p>Consult experienced doctors for everyday health concerns.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card">
                <h4>Specialist Care</h4>
                <p>Get specialized treatment from trusted healthcare professionals.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="service-card">
                <h4>Health Checkups &amp; Reports</h4>
                <p>Upload your reports and get an AI summary, tips and health score.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact text-center">
        <div className="container">
          <h2>Contact Us</h2>
          <p className="section-sub">Have questions? The Medora AI team is happy to help.</p>
        </div>
      </section>
    </>
  );
}
