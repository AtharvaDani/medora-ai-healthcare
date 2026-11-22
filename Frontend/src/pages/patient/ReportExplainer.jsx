import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiFeaturesService, errorText } from '../../services/featureServices';
import '../../styles/features.scss';



export default function ReportExplainer() {
  const navigate = useNavigate();
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [over, setOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const pick = (f) => {
    setError('');
    setResult(null);
    if (!f) return;
    if (!/\.(pdf|docx|txt)$/i.test(f.name)) {
      setError('Please choose a PDF, DOCX or TXT file.');
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const explain = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await aiFeaturesService.explainReport(file));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  const findings = result?.findings ?? [];
  const list = (v) => (Array.isArray(v) ? v.map(String) : []);

  return (
    <div className="sc-feature">
      <div className="feature-hero">
        <h2><i className="bi bi-file-earmark-medical me-2"></i>Report Explainer</h2>
        <p>Upload a lab or medical report and get a plain-language explanation. Your file is read once and not stored.</p>
      </div>

      <div className="panel">
        <div
          className={`drop${over ? ' over' : ''}`}
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
        >
          <i className="bi bi-cloud-arrow-up"></i>
          <div className="fw-semibold mt-1">{file ? file.name : 'Click or drag a report here'}</div>
          <div className="hint">PDF, DOCX or TXT, up to 10 MB. Scanned images are not supported.</div>
          <input ref={input} type="file" accept=".pdf,.docx,.txt" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
        <div className="text-center mt-3">
          <button className="btn-medora btn" disabled={!file || loading} onClick={explain}>
            {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Analysing…</>) : (<><i className="bi bi-stars me-2"></i>Explain my report</>)}
          </button>
        </div>
      </div>

      {error && <div className="alert-soft error">{error}</div>}

      {result && (
        <>
          <div className="panel">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <h5 className="mb-0">Summary</h5>
              {result.overallStatus && <span className={`pill ${result.overallStatus}`}>{String(result.overallStatus)}</span>}
            </div>
            <p className="mt-3 mb-0">{result.summary}</p>
            {result.truncated && <div className="disclaimer">Long report: only the first part was analysed.</div>}
          </div>

          {findings.length > 0 && (
            <div className="panel">
              <h5>Test results</h5>
              {findings.map((f, i) => (
                <div key={i} className={`finding${f.status && f.status !== 'NORMAL' ? ' bad' : ''}`}>
                  <div>
                    <div className="name">{f.test}</div>
                    {f.referenceRange && <div className="range">Reference: {f.referenceRange}</div>}
                  </div>
                  <div className="val">{f.value}</div>
                  <div><span className={`pill ${f.status}`}>{f.status}</span></div>
                  <div className="why">{f.explanation}</div>
                </div>
              ))}
            </div>
          )}

          <div className="chart-grid">
            {list(result.keyTakeaways).length > 0 && (
              <div className="panel"><h5>Key takeaways</h5><ul className="clean">{list(result.keyTakeaways).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
            )}
            {list(result.lifestyleTips).length > 0 && (
              <div className="panel"><h5>Lifestyle tips</h5><ul className="clean">{list(result.lifestyleTips).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
            )}
            {list(result.questionsForDoctor).length > 0 && (
              <div className="panel"><h5>Questions to ask your doctor</h5><ul className="clean">{list(result.questionsForDoctor).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
            )}
          </div>

          {result.suggestedSpecialty && (
            <div className="panel text-center">
              <div className="mb-2">Suggested specialist: <strong>{result.suggestedSpecialty}</strong></div>
              <button className="btn-medora btn" onClick={() => navigate('/patient/search?speciality=' + encodeURIComponent(result.suggestedSpecialty))}>
                <i className="bi bi-search me-2"></i>Find {result.suggestedSpecialty} doctors
              </button>
            </div>
          )}
          <div className="disclaimer text-center">{result.disclaimer}</div>
        </>
      )}
    </div>
  );
}
