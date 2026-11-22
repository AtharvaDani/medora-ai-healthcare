import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import { HomeSections } from '../doctor/Home';
import '../../styles/patient-home.scss';

export default function PatientHome() {
  const navigate = useNavigate();
  return (
    <div className="sc-patient-home">
      <HomeSections
        onExplore={() => navigate('/patient/pre-search')}
        onContact={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
      />
      <Footer />
    </div>
  );
}
