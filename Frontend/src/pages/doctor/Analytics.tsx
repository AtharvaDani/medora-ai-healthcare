import { useEffect, useState } from 'react';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { analyticsService, errorText } from '../../services/featureServices';
import '../../styles/features.scss';

export default function DoctorAnalytics() {
  const doctorId = localStorage.getItem('DoctorUserId');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!doctorId) { setError('Doctor profile not found.'); return; }
    analyticsService.doctor(doctorId).then(setData).catch((e) => setError(errorText(e)));
  }, [doctorId]);
  return (
    <div className="sc-feature" style={{ maxWidth: 1200 }}>
      <div className="feature-hero"><h2><i className="bi bi-graph-up-arrow me-2"></i>My Analytics</h2><p>Your appointments, busiest hours and patient ratings.</p></div>
      {error && <div className="alert-soft error">{error}</div>}
      {!data && !error && <div className="alert-soft info">Loading…</div>}
      {data && <AnalyticsDashboard data={data} admin={false} />}
    </div>
  );
}
