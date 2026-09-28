/* The JS entry point. It grabs the <div id="root"> element from index.html and mounts the main React application into it */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster, ToastIcon, resolveValue, toast } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="bottom-right" toastOptions={{ duration: 3000 }}>
      {(t) => (
        <div 
          className={`flex items-center gap-2 bg-white text-gray-600 px-4 py-3 rounded-lg shadow-lg border text-sm
            ${t.type === 'error' ? 'border-red-500' : 'border-green-500'}`
          }
          onClick={() => toast.dismiss(t.id)}
        >
          <ToastIcon toast={t} />
          <span className="font-medium">{resolveValue(t.message, t)}</span>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toast.remove(t.id);
            }}
            className="ml-2 text-gray-600 hover:text-gray-950 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </Toaster>
  </StrictMode>
);
