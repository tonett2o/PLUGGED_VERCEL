const API_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://pluggedvercel-production.up.railway.app';

console.log('API_URL configured as:', API_URL);

export default API_URL;
