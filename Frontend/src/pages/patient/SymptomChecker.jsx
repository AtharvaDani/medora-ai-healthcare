import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiFeaturesService, errorText } from '../../services/featureServices';
import '../../styles/features.scss';

const EXAMPLES = [
  'Fever and sore throat for 2 days with body aches',
  'Itchy red rash on my arms that is spreading',
  'Frequent headaches in the morning with blurred vision',
  'Knee pain when climbing stairs for the past week',
];

const URGENCY_TEXT = {
  EMERGENCY: 'Emergency - seek care now',
  URGENT: 'Urgent - see a doctor within 24 hours',
  ROUTINE: 'Routine - book an appointment',
  SELF_CARE: 'Likely manageable at home',
};

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (symptoms.trim().length < 3) {
      setError('Please describe your symptoms.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await aiFeaturesService.triage({ symptoms: symptoms.trim(), age, gender }));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  const list = (v) => (Array.isArray(v) ? v.map(String) : []);
  const find = () => navigate('/patient/search?speciality=' + encodeURIComponent(result.specialty));

  return (
    <div className="sc-feature">
      <div className="feature-hero">
        <h2><i className="bi bi-activity me-2"></i>Symptom Checker</h2>
        <p>Describe how you feel. Medora AI tells you how urgent it is and which doctor to see.</p>
      </div>

      <form className="panel" onSubmit={submit}>
        <textarea className="form-control" rows={4} maxLength={2000} value={symptoms}
          placeholder="e.g. I have had a fever and a sore throat for two days…"
          onChange={(e) => setSymptoms(e.target.value)} />
        <div className="d-flex flex-wrap gap-2 mt-2">
          {EXAMPLES.map((ex) => (
            <button type="button" key={ex} className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => setSymptoms(ex)}>{ex}</button>
          ))}
        </div>
        <div className="row g-2 mt-2">
          <div className="col-6 col-md-3"><input className="form-control" type="number" min={0} max={120} placeholder="Age (optional)" value={age} onChange={(e) => setAge(e.target.value)} /></div>
          <div className="col-6 col-md-3">
            <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Gender (optional)</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>
        <div className="text-center mt-3">
          <button className="btn-medora btn" disabled={loading}>
            {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Checking…</>) : (<><i className="bi bi-heart-pulse me-2"></i>Check symptoms</>)}
          </button>
        </div>
      </form>

      {error && <div className="alert-soft error">{error}</div>}

      {result?.emergency && (
        <div className="emergency-banner" role="alert">
          <h4><i className="bi bi-exclamation-octagon-fill me-2"></i>This may be a medical emergency</h4>
          {list(result.redFlags).length > 0 && <ul className="clean mb-2">{list(result.redFlags).map((f, i) => <li key={i}>{f}</li>)}</ul>}
          <div className="call">Call 112 (India) or your local emergency number now.</div>
          <div className="mt-1">Go to the nearest emergency room. Do not wait for an appointment.</div>
        </div>
      )}

      {result && !result.emergency && (
        <>
          <div className="panel">
            <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
              <span className={`pill ${result.urgency}`}>{result.urgency}</span>
              <strong>{URGENCY_TEXT[result.urgency] ?? ''}</strong>
            </div>
            <p className="mb-2">{result.reasoning}</p>
            <div>Recommended doctor: <strong>{result.specialty}</strong></div>
            <div className="mt-3">
              <button className="btn-medora btn" onClick={find}><i className="bi bi-search me-2"></i>Find {result.specialty} doctors</button>
            </div>
          </div>

          <div className="chart-grid">
            {list(result.possibleConditions).length > 0 && <div className="panel"><h5>Could be related to</h5><ul className="clean">{list(result.possibleConditions).map((t, i) => <li key={i}>{t}</li>)}</ul></div>}
            {list(result.selfCareTips).length > 0 && <div className="panel"><h5>Meanwhile</h5><ul className="clean">{list(result.selfCareTips).map((t, i) => <li key={i}>{t}</li>)}</ul></div>}
            {list(result.warningSigns).length > 0 && <div className="panel"><h5>Get emergency help if</h5><ul className="clean">{list(result.warningSigns).map((t, i) => <li key={i}>{t}</li>)}</ul></div>}
          </div>
        </>
      )}

      {result && <div className="disclaimer text-center">{result.disclaimer}</div>}
      {!result && <div className="disclaimer text-center">Not a diagnosis. In an emergency call your local emergency number.</div>}
    </div>
  );
}
