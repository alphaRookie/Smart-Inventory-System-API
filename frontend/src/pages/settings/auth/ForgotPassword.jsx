import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../../api/axios';
import AuthLayout from '../../../components/layout/AuthLayout';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // start from step 1
  
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    new_password: '', 
    confirm_new_password: '',
  });
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfNewPass, setShowConfNewPass] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // STEP 1: Request Code
  const handleRequestEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      await API.post('/users/forgot-password', { email: formData.email });
      toast.success("Verification code sent to your email!");
      setStep(2); 
    } catch (err) {
      if (err.response?.status === 400) {
      const data = err.response.data;
      setErrorMessage(typeof data === 'string' ? [data] : Object.values(data).flat());
      } 
      else { toast.error("Could not connect to server"); }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      await API.post('/users/verify-reset-code', { email: formData.email, code: formData.code.trim() });
      toast.success("Code verified!");
      setStep(3);
    } catch (err) {
      // Clear the previous wrong input so the user can re-type
      setFormData((prev) => ({ ...prev, code: '' }));

      if (err.response?.status === 400) {
      const data = err.response.data;
      setErrorMessage(typeof data === 'string' ? [data] : Object.values(data).flat());
      } 
      else { toast.error("Could not connect to server"); }
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Change Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage([]); // catch few error msg with bullet

    setLoading(true);
    try {
      await API.post('/users/reset-password-confirm', {
        email: formData.email,
        code: formData.code.trim(),
        new_password: formData.new_password,
        confirm_new_password: formData.confirm_new_password
      });
      toast.success("Password changed successfully! Please log in.");
      navigate('/login');
    } catch (err) {
      // Inline msg for validation error and Toast msg for server error
      if (err.response?.status === 400){setErrorMessage(typeof err.response.data === 'string' ? err.response.data : Object.values(err.response.data).flat())} 
      else {toast.error("Could not contact Django backend engine");}  
      console.error("Failed to reset Password:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout
    title="Reset Password"
    subtitle={
      step === 1 ? 'Enter your email to receive a verification code.' :
      step === 2 ? 'Enter the 6-digit code sent to your email.' :
      'Create your new password.'
    }
    showSocial={false}
    >
      {errorMessage.length > 0 && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {errorMessage.length === 1 ? (
            <p>{errorMessage[0]}</p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {errorMessage.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* STEP 1: Find Email */}
      {step === 1 && (
        <form onSubmit={handleRequestEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-all">
            {loading ? 'Sending Code...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {/* STEP 2: Verify The code sent to email */}
      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
              6-Digit Code
            </label>
            <input
              type="text"
              name="code"
              maxLength={6}
              required
              value={formData.code}
              onChange={handleChange}
              placeholder="123456"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center tracking-widest font-mono text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-all">
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button type="button" onClick={() => setStep(1)} className="block w-full text-center text-xs text-indigo-600 mt-2 hover:underline">
            Change Email
          </button>
        </form>
      )}

      {/* STEP 3: New Password Form */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                name="new_password"
                required
                minLength={6}
                value={formData.new_password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showNewPass ? 'Hide password' : 'Show password'}
              >
                {showNewPass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfNewPass ? "text" : "password"}
                name="confirm_new_password"
                required
                minLength={6}
                value={formData.confirm_new_password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowConfNewPass(!showConfNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showConfNewPass ? 'Hide password' : 'Show password'}
              >
                {showConfNewPass ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-all">
            {loading ? 'Updating...' : 'Confirm'}
          </button>
        </form>
      )}

      {step === 1 && (
        <p className="text-center text-xs text-slate-500 mt-4">
          Remembered your password? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Back to Login</Link>
        </p>
      )}
    </AuthLayout>
  );
}
