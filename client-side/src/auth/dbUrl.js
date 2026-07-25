// `??` (not `||`) so an explicitly-empty REACT_APP_API_BASE_URL is honored:
// an empty base means "call the API on the same origin" (relative URLs), which
// is how the Docker single-image build serves the SPA and API together.
// When the var is unset (e.g. `npm start` in dev), fall back to the local API.
const BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:5053";

export default BASE_URL;
