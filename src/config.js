const trimTrailingSlash = (url) => (url || '').replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(process.env.REACT_APP_API_URL) || 'http://localhost:5000';

/** Hugging Face Space or local `uvicorn` (default http://localhost:8000). */
export const AI_API_BASE_URL = trimTrailingSlash(process.env.REACT_APP_AI_API_URL) || 'http://localhost:8000';
