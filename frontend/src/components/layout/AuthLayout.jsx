import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthLayout({ title, subtitle, children, showSocial = true, onGoogleSuccess, onGoogleError }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-800">
      {/* Decorative background circles matching your design */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-indigo-100/50 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-2xl pointer-events-none" />

      {/* Main Auth Card Container */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 z-10 border border-slate-100">


        {/* Title and Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* Dynamic Page Form Content */}
        {children}

        {/* Social Authentication Section */}
        {showSocial && (
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
                Or continue with
              </span>
            </div>

            {/* Google OAuth Button Integration */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                shape="rectangular"
                theme="outline"
                size="large"
                width="350"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
