import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

async function enableMsw() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.log('%c[MSW] mock server active', 'color:green');
  }
}

(async () => {
  await enableMsw();
  createRoot(document.getElementById("root")!).render(<App />);
})();
