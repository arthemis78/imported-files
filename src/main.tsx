import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.tsx';
import './index.css';

// Initialize USDT NOW FLASHER
console.log('🚀 Starting USDT NOW FLASHER...');

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ USDT NOW FLASHER React app mounted!');
} else {
  console.error('❌ Root element not found');
}
