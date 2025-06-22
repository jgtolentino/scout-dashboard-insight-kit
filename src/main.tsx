// Suppress all process warnings including Contextify VM warnings from Blitz
if (typeof process !== 'undefined') {
  process.emitWarning = () => {};
}

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// MSW and mock-DB disabled: using real API endpoints
createRoot(document.getElementById("root")!).render(<App />);