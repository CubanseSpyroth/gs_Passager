import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';

// Detectar si estamos en WebView
const isWebView = /wv|WebView/.test(navigator.userAgent) || 
                 window.location.protocol === 'file:';

console.log(isWebView)

if (isWebView) {
  console.log('Running in WebView environment');
  // Configuraciones específicas para WebView
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);