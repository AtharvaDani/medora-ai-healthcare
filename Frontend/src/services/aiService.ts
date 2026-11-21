import { AI_STREAM_URL } from '../config';

// Streams the AI answer over Server-Sent Events (one JSON-encoded text piece per event).
// Returns a function that closes the stream.
export function streamAiResponse(
  userQuery: string,
  handlers: { onToken: (token: string) => void; onError: (err: string) => void }
): () => void {
  const url = `${AI_STREAM_URL}?query=${encodeURIComponent(userQuery)}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    let token = event.data;
    try {
      token = JSON.parse(event.data);
    } catch {
      /* plain text fallback */
    }
    handlers.onToken(String(token));
  };
  eventSource.onerror = (error) => {
    console.error('Error receiving AI response', error);
    handlers.onError('EventSource error');
    eventSource.close();
  };

  return () => eventSource.close();
}
