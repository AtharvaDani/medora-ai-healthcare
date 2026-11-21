import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { adminNav, doctorNav, patientNav } from '../components/Layouts';
import { streamAiResponse } from '../services/aiService';
import { userService } from '../services/userService';
import '../styles/ai-chat.scss';

const SUGGESTIONS = [
  'What are common symptoms of dehydration?',
  'Give me simple tips for better sleep',
  'How can I lower my blood pressure naturally?',
  'What foods boost the immune system?',
];

// Tiny safe renderer: **bold**, bullet / numbered lists and headings (no HTML injection).
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((raw, i) => {
        const line = raw.trimEnd();
        if (!line.trim()) return <div key={i} className="gap" />;
        const heading = line.match(/^#{1,4}\s+(.*)/);
        if (heading) return <h4 key={i}>{renderInline(heading[1])}</h4>;
        const bullet = line.match(/^\s*[-*•]\s+(.*)/);
        if (bullet) return <div key={i} className="li"><span>•</span><span>{renderInline(bullet[1])}</span></div>;
        const num = line.match(/^\s*(\d+)[.)]\s+(.*)/);
        if (num) return <div key={i} className="li"><span>{num[1]}.</span><span>{renderInline(num[2])}</span></div>;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </>
  );
}

export default function AiChat() {
  const [userQuery, setUserQuery] = useState('');
  const [asked, setAsked] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const closeStream = useRef<(() => void) | null>(null);

  const role = userService.getUserInfoFromToken()?.role;
  const navItems = role === 'Doctor' ? doctorNav : role === 'Admin' ? adminNav : patientNav;

  // Restore the previous session (same localStorage keys as before).
  useEffect(() => {
    if (localStorage.getItem('sessionActive') === 'true') {
      const q = localStorage.getItem('userQuery') || '';
      setUserQuery(q);
      setAsked(q);
      setResponse(localStorage.getItem('aiResponse') || '');
      setLoading(localStorage.getItem('loadingState') === 'true');
    }
    return () => closeStream.current?.();
  }, []);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) {
      setMessage('Please type or speak a question.');
      return;
    }

    closeStream.current?.();
    setUserQuery(q);
    setAsked(q);
    setLoading(true);
    setResponse('');
    setMessage('');
    localStorage.setItem('sessionActive', 'true');
    localStorage.setItem('userQuery', q);
    localStorage.setItem('loadingState', 'true');

    let acc = '';

    closeStream.current = streamAiResponse(q, {
      onToken: (token) => {
        if (token === '__END__') {
          setLoading(false);
          localStorage.setItem('loadingState', 'false');
          closeStream.current?.();
          return;
        }
        acc += token; // each token is the next piece of text
        setResponse(acc);
        localStorage.setItem('aiResponse', acc);
      },
      onError: (err) => {
        setLoading(false);
        if (!acc) acc = 'Sorry, I could not get a response right now. Please make sure the AI service is running and try again. (' + err + ')';
        setResponse(acc);
        localStorage.setItem('aiResponse', acc);
        localStorage.setItem('loadingState', 'false');
      },
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(userQuery);
  };

  const startSpeechToText = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      setMessage('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let speechCaptured = false;

    recognition.onstart = () => setMessage('🎤 Listening...');
    recognition.onerror = (e: any) => {
      console.error('Speech error:', e);
      setMessage(`Speech error: ${e.error}`);
      recognition.stop();
    };
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setUserQuery(transcript);
      speechCaptured = true;
      setMessage(`You said: "${transcript}"`);
    };
    recognition.onend = () => {
      if (!speechCaptured) setMessage('🎤 No speech detected or cancelled.');
    };
    recognition.start();
  };

  return (
    <>
      <Header navItems={navItems} />
      <div className="sc-ai-chat">
        <div className="chat-container">
          <div className="chat-hero">
            <img src="/logo.svg" alt="Medora AI" width={64} height={64} />
            <h2>Medora AI Health Assistant</h2>
            <p>Hi, I&apos;m Medora AI. Ask me anything about your health and wellness.</p>
          </div>

          <form onSubmit={onSubmit} className="chat-form">
            <div className="input-group">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                name="userQuery"
                placeholder="Ask Medora AI a health question..."
              />
              <button type="button" className="mic-btn" onClick={startSpeechToText} title="Speak">🎤</button>
              <button type="submit" className="submit-btn" disabled={loading} title="Send">
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </form>

          {message && <p className="message">{message}</p>}

          {!asked && (
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => ask(s)}>{s}</button>
              ))}
            </div>
          )}

          {asked && (
            <div className="bubble user-bubble">
              <i className="bi bi-person-circle"></i>
              <div>{asked}</div>
            </div>
          )}

          {loading && !response && (
            <div className="spinner">
              <div className="loader"></div>
              <span>Medora AI is thinking...</span>
            </div>
          )}

          {response && (
            <div className="bubble ai-bubble response-box">
              <img src="/logo.svg" alt="" width={34} height={34} />
              <div className="ai-text">
                <RichText text={response} />
                {loading && <span className="cursor">▍</span>}
              </div>
            </div>
          )}

          <p className="disclaimer">
            <i className="bi bi-shield-check me-1"></i>
            Medora AI gives general health information, not a medical diagnosis. In an emergency, contact a doctor or local emergency services.
          </p>
        </div>
      </div>
    </>
  );
}
