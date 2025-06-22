import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// MSW and mock-DB disabled: using real API endpoints
createRoot(document.getElementById("root")!).render(<App />);