import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/acme'; // fonte empacotada: funciona offline no .exe
import '@fontsource/lacquer'; // fonte empacotada: funciona offline no .exe
import './styles.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
