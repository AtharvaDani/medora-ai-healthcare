import { useEffect, useState } from 'react';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { analyticsService, errorText } from '../../services/featureServices';
import '../../styles/features.scss';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { analyticsService.admin().then(setData).catch((e) => setError(errorText(e))); }, []);
  return (
    <div className="sc-feature" style={{ maxWidth: 1200 }}>
      <div className="feature-hero"><h2><i className="bi bi-graph-up-arrow me-2"></i>Platform Analytics</h2><p>Appointments, ratings and activity across Medora AI.</p></div>
      {error && <div className="alert-soft error">{error}</div>}
      {!data && !error && <div className="alert-soft info">Loading…</div>}
      {data && <AnalyticsDashboard data={data} admin />}
    </div>
  );
}
