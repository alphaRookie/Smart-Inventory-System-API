import React from 'react';
import { Toaster, ToastIcon, resolveValue, toast } from 'react-hot-toast';

export default function CustomToastMsg() {
  return (
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
  );
}
