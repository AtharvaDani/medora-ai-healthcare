import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { doctorNav, patientNav } from '../components/Layouts';
import { userService } from '../services/userService';
import { errorText, videoService } from '../services/featureServices';
import '../styles/features.scss';

export default function VideoConsult() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const role = userService.getUserInfoFromToken()?.role;

  useEffect(() => {
    if (!appointmentId) return;
    videoService.getRoom(appointmentId).then(setRoom).catch((e) => setError(errorText(e)));
  }, [appointmentId]);

  // Jitsi accepts the display name and a few UI options in the URL hash.
  const frameSrc = room
    ? `${room.url}#userInfo.displayName=${encodeURIComponent(JSON.stringify(room.displayName))}` +
      '&config.prejoinPageEnabled=false&config.disableDeepLinking=true'
    : '';

  return (
    <>
      <Header navItems={role === 'Doctor' ? doctorNav : patientNav} />
      <div className="sc-feature">
        <div className="feature-hero">
          <h2><i className="bi bi-camera-video me-2"></i>Video Consultation</h2>
          {room && (
            <p>
              Dr. {String(room.doctorName).replace(/^Dr\.?\s*/i, '')} &amp; {room.patientName}
              {room.scheduledAt && <> &middot; {new Date(room.scheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</>}
            </p>
          )}
        </div>

        {error && <div className="alert-soft error">{error}</div>}
        {!room && !error && <div className="alert-soft info">Preparing your private room…</div>}

        {room && (
          <div className="panel">
            <iframe className="video-frame" title="Video consultation" src={frameSrc}
              allow="camera; microphone; fullscreen; display-capture; autoplay" />
            <div className="d-flex flex-wrap gap-2 justify-content-between mt-3">
              <a className="btn btn-outline-secondary rounded-pill" href={room.url} target="_blank" rel="noreferrer">
                <i className="bi bi-box-arrow-up-right me-2"></i>Open in a new tab
              </a>
              <button className="btn btn-outline-danger rounded-pill" onClick={() => navigate(-1)}>
                <i className="bi bi-telephone-x me-2"></i>Leave
              </button>
            </div>
            <div className="disclaimer">
              If the call does not load here, use "Open in a new tab". Allow camera and microphone when your browser asks.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
