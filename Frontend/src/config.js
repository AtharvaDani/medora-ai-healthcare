// Backend URLs. On Netlify set VITE_API_BASE and VITE_AI_STREAM_URL; locally the defaults are used.
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:9090';
export const AI_STREAM_URL = import.meta.env.VITE_AI_STREAM_URL ?? 'http://localhost:8081/ai/message_stream';
