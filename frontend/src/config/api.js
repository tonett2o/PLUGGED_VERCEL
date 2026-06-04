const API_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://pluggedvercel-production.up.railway.app';

export default API_URL;
