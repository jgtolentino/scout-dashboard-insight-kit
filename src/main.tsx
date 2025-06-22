import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enable MSW in development for API mocking
async function enableMocking() {
  if (import.meta.env.MODE === 'development') {
    const { worker } = await import('./mocks/browser');
    return worker.start();
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});