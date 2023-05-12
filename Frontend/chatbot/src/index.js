import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import AppRoute from './routes.js'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRoute />
  </React.StrictMode>
);

