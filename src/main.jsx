import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log("AURA MANAGER: Content script is executing!");

// Inject React Root if it doesn't exist
let rootEl = document.getElementById('aura-root');
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = 'aura-root';
  document.body.appendChild(rootEl);
  document.body.style.overflow = 'hidden';
}

const root = createRoot(rootEl);
root.render(<App />);
