/* The JS entry point. It grabs the <div id="root"> element from index.html and mounts the main React application into it */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import CustomToastMsg from './components/layout/ToastMessage.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
      <CustomToastMsg />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
