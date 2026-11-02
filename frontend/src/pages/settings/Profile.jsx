import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Profile Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await API.get('/users/profile'); 
      setUser(response.data);
      setFormData({
        username: response.data.username || '',
        email: response.data.email || '',
        phone_number: response.data.phone_number || '',
      });
    } catch (err) {
      console.error("Error fetching profile:", err);

      // when fails, falls back to whatever was saved in localStorage from a previous session as a backup copy
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(localUser); 
      setFormData({
        username: localUser.username || '',
        email: localUser.email || '',
        phone_number: localUser.phone_number || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChangeInput = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    setProfileErrors([]);
    e.preventDefault();
    try {
      const response = await API.patch('/users/profile', formData);

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      // Inline msg for validation error and Toast msg for server error
      if (err.response?.status === 400){setProfileErrors(typeof err.response.data === 'string' ? err.response.data : Object.values(err.response.data).flat())} 
      else {toast.error("Could not contact Django backend engine");}  
      console.error("Failed to Update Profile:", err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors([]);

    try {
      await API.post('/users/change-password', passwordData);

      toast.success("Password successfully changed!");
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
      await fetchUserData();
    } catch (err) {
      // Inline msg for validation error and Toast msg for server error
      if (err.response?.status === 400){setPasswordErrors(typeof err.response.data === 'string' ? err.response.data : Object.values(err.response.data).flat())} 
      else {toast.error("Could not contact Django backend engine");}  
      console.error("Failed to Change Password:", err);
    }
  };

  if (loading) {
    return <div className="text-gray-500 font-medium p-6">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your account details and security.</p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Top Banner / User Meta Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xl uppercase">
              {user?.username ? user.username.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user?.username}</h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Role / Status Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            {user?.is_superuser && (
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                Superuser
              </span>
            )}

            {user?.groups?.includes('Manager') && (
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                Manager
              </span>
            )}

            {user?.groups?.includes('Worker') && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                Worker
              </span>
            )}

            {/* Catch-all for any other custom groups if you add them later */}
            {user?.groups?.filter(g => g !== 'Manager' && g !== 'Worker').map((group, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                {group}
              </span>
            ))}

            {/* Unassigned badge if they have no elevated permissions or groups */}
            {!user?.is_superuser && (!user?.groups || user.groups.length === 0) && (
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                Unassigned
              </span>
            )}
          </div>
        </div>

        {/* Form or Info View */}
        {isEditing ? (
          
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">

            {/* error message */}
            {profileErrors.length > 0 && (
              <ul className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg list-disc list-inside w-fit">
                {profileErrors.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Account ID</p>
              <p className="text-gray-900 font-semibold mt-1">#{user?.id}</p>
            </div>

            <div>
              <p className="text-gray-500 font-medium">Username</p>
              <p className="text-gray-900 font-semibold mt-1">{user?.username || '-'}</p>
            </div>

            <div>
              <p className="text-gray-500 font-medium">Email Address</p>
              <p className="text-gray-900 font-semibold mt-1">{user?.email || '-'}</p>
            </div>

            <div>
              <p className="text-gray-500 font-medium">Phone Number</p>
              <p className="text-gray-900 font-semibold mt-1">{user?.phone_number || 'Not provided yet'}</p>
            </div>

            <div>
              <p className="text-gray-500 font-medium">Date Joined</p>
              <p className="text-gray-900 font-semibold mt-1">
                {user?.date_joined ? new Date(user.date_joined).toLocaleString() : '-'}
              </p>
            </div>

            <div>
              <p className="text-gray-500 font-medium">Last Login</p>
              <p className="text-gray-900 font-semibold mt-1">
                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'First time login'}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Security / Change Password Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            <p className="text-sm text-gray-500">Manage your password and account security settings.</p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>
        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 border-t border-gray-200">

            {/* error message */}
            {passwordErrors.length > 0 && (
              <ul className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg list-disc list-inside w-fit">
                {passwordErrors.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChangeInput}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                >
                  {showOldPassword ? (
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

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChangeInput}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
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

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChangeInput}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
