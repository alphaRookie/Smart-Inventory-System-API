import { useState } from 'react';
import API from '../../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../../components/layout/AuthLayout';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage([]);
    try {
      // API call to custom Django login endpoint 
      const response = await API.post('/users/login', formData);

      // Store session
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
      console.log('Logging in with:', formData);
      toast.success(`Welcome back ${response.data.user.username}`); //manually extract username passed from backend response
    } catch (err) {
      // Inline msg for validation error and Toast msg for server error
      if (err.response?.status === 400){setErrorMessage(typeof err.response.data === 'string' ? err.response.data : Object.values(err.response.data).flat())} 
      else {toast.error("Could not contact Django backend engine");}  
      console.error("Failed to login:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await API.post('/users/google', {
        id_token: credentialResponse.credential, // the one that actually gets checked
        access_token: credentialResponse.credential, // just to make the backend stop complaining
      });

      // localStorage is a storage box inside the browser that keeps data even after you refresh the page. These two lines put the tokens in that box
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
      console.log('Google Credential:', credentialResponse.credential);
      toast.success(`Welcome back ${response.data.user.username}`);
    } catch (err) {
      toast.error("Google login failed");
      console.error(err.response?.data);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back! Please enter your credentials."
      onGoogleSuccess={handleGoogleSuccess}
      onGoogleError={() => console.log('Google Login Failed')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage.length > 0 && (
          <ul className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg list-disc list-inside">
            {errorMessage.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type='password'
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-xs font-medium text-slate-600">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
