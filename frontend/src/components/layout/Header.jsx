import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { isNormalUser, isWorker } from '../../utils/Permissions';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openMessage, setOpenMessage] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.is_read).length; // Calculate unread items dynamically
  const location = useLocation();

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);


  const fetchInitialData = async () => {
    try {
      const notifRes = await API.get('/inventory/notification');
      setNotifications(notifRes.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };
  
  // Grab user from local storage instead of making new API call
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      // Parse JSON string, and handle whether the data is wrapped in `.data` or stored directly
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from local storage:", error);
      return null;
    }
  };
  // why define below it? Registers the func first, so when useState runs later, it can find and execute getStoredUser()
  const [user, setUser] = useState(getStoredUser()); 

  // Handler to refresh user state when profile changes
  const handleUserUpdate = () => {
    setUser(getStoredUser());
  };

  useEffect(() => {
    // 1. Fetch on initial mount
    fetchInitialData();

    // 2. LISTEN: Start listening for the custom event
    window.addEventListener('refreshHeader', fetchInitialData);
    window.addEventListener('userUpdated', handleUserUpdate); // Listen for the custom event

    // Cleanup listener when header unmounts
    return () => {
      window.removeEventListener('refreshHeader', fetchInitialData);
      window.removeEventListener('userUpdated', handleUserUpdate); // Cleanup listener when component unmounts
    };
  }, []);
  

  // Helper for normal links: returns active styling vs inactive styling
  const getLinkClass = ({ isActive }) =>
    `transition-colors py-1 font-medium ${
      isActive
        ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
        : 'text-gray-600 hover:text-indigo-600'
    }`;

  // Helper for dropdown items (both dropdown will act the same)
  const getDropdownLinkClass = ({ isActive }) =>
  `w-full px-3 py-2 text-sm text-left flex items-center gap-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'text-indigo-600 font-semibold bg-indigo-50/80'
      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50'
  }`;


  // Checks for active states to keep parent dropdown buttons highlighted
  const isOrderPredActive = location.pathname.startsWith('/orderpred');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setOpenMessage(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`/inventory/notification/${id}`);
      /* look at all obj in list, check if id matched what clicked: if yes make copy this obj and change only is_read part, else leave obj unchanged */
      setNotifications(notifs => notifs.map(n => (n.id === id ? { ...n, is_read: true } : n)));
      onRefresh();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/users/logout', { refresh: localStorage.getItem('refresh_token') });
      
      // Clear stored session data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      navigate('/')
      toast.success('Successfully logged out')
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          SmartSense
        </Link>
        
        {!isNormalUser() && ( // apart from normal user can access all header
          <div className="flex items-center gap-6 font-medium">
            <NavLink to="/products" className={getLinkClass}>
              Products
            </NavLink>
            <NavLink to="/shelves" className={getLinkClass}>
              Shelves
            </NavLink>
            <NavLink to="/sales" className={getLinkClass}>
              Sales
            </NavLink>

            {/* Dropdown Menu Container */}
            {!isWorker() && ( // and more spesificly apart from Worker role can access this
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setOpen(!open)}
                  className={`flex items-center gap-1.5 py-1 font-medium transition-colors ${
                    isOrderPredActive
                      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Order Predictions 
                  
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" 
                    className={`w-4 h-4 translate-y-[2px] transition-transform duration-200 ${
                      isOrderPredActive ? 'text-indigo-600' : 'text-gray-400'
                    } ${open ? 'rotate-90' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {open && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl py-1 flex flex-col px-1 gap-0.5 z-20 transition-all">
                    <NavLink 
                      to="/orderpred/forecast" 
                      onClick={() => setOpen(false)}
                      className={getDropdownLinkClass}
                    >
                      Forecast
                    </NavLink>
                    <NavLink 
                      to="/orderpred/history" 
                      onClick={() => setOpen(false)}
                      className={getDropdownLinkClass}
                    >
                      History
                    </NavLink>
                  </div>
                )}
              </div>
            )}

            {!isWorker() && ( // and more spesificly apart from Worker role can access this
              <NavLink to="/spoilage" className={getLinkClass}>
                Spoilage Check
              </NavLink>
            )}
          </div>
        )}
      </div>

      {/* Profile & Messages Container */}
      <div className="flex items-center gap-3">
        {/* Message Button */}
        {!isNormalUser() && ( // only hide to normal user
          <div className="relative" ref={notifRef}>
            <button 
              type="button" 
              aria-label="Messages"
              onClick={() => setOpenMessage(!openMessage)}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>

              {/* Notification Badge Counter */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {openMessage && (
              <div className="absolute right-0 mt-3 w-88 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl -2xl py-3 px-3.5 flex flex-col z-30">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 px-1">
                  <p className="font-semibold text-sm text-gray-700 m">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto flex flex-col gap-2 mb-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-6">No notifications found.</p>
                  ) : (
                    notifications.slice(0, 5).map((n) => ( /* max to 5 notifs when looping */
                      <div 
                        key={n.id} 
                        className={`text-xs p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2.5 ${
                          n.is_read ? 'bg-white text-gray-500 border-slate-100 hover:border-slate-200' : 'bg-indigo-50/30 text-gray-800 border-indigo-100/80 shadow-sm font-medium'
                        }`}
                      >
                        {/* Left Side: Everything stacked normally */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            <span className="bg-indigo-100/80 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide">
                              {n.category}
                            </span>
                            
                            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide ${
                              n.level === 'DANGER' ? 'bg-red-100 text-red-600' : 
                              n.level === 'WARNING' ? 'bg-yellow-100 text-yellow-600' : 
                              n.level === 'INFO' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-800'
                            }`}>
                              {n.level}
                            </span>

                            <span className="text-gray-400 text-[10px] ml-auto">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>

                          {/* When system batch run, no spesific product obj passed, so just display as 'system run' */}
                          {n.product_obj ? (
                            <span className="text-xs font-bold text-gray-900 truncate"> {n.product_obj.name} </span>
                          ) : (
                            <span className="text-xs font-bold text-gray-900"> System Batch Run </span>
                          )}

                          <p className="text-xs text-gray-600 leading-relaxed"> {n.message} </p>
                        </div>

                        {/* Right Side: Checkmark button */}
                        {!n.is_read && (
                          <button 
                            onClick={() => handleMarkAsRead(n.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all font-bold shrink-0 self-center shadow-xs"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <NavLink
                  to="/notification"
                  onClick={() => setOpenMessage(false)}
                  className="text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-2 border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100/70 rounded-xl transition-colors mt-1 shadow-xs"
                >
                  See all messages →
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-label="Profile menu"
            onClick={() => setProfileOpen(!profileOpen)}
            className="rounded-full focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-semibold text-s uppercase cursor-pointer transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 active:scale-95">
              {user?.username ? user.username.charAt(0) : 'U'}
            </div>
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-45 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl -2xl py-1 flex flex-col z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* User Info Header */}
              <div className="px-4 py-2 flex flex-col">
                <span className="font-semibold text-sm text-gray-900 truncate">
                  {user?.username || 'User'}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </span>
              </div>

              <hr className="my-1 border-gray-200" />

              <div className="flex flex-col px-1 gap-0.5">
                <NavLink
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className={getDropdownLinkClass}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  Profile
                </NavLink>

                {!isNormalUser() && !isWorker() && (
                  <NavLink
                    to="/scheduler"
                    onClick={() => setProfileOpen(false)}
                    className={getDropdownLinkClass}
                  >
                    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" strokeWidth={3} stroke="currentColor" fill="none" className="size-5 shrink-0">
                      <path d="M36.66,54.45H8.84A2.5,2.5,0,0,1,6.35,52V12.12A2.49,2.49,0,0,1,8.84,9.63H48.68a2.49,2.49,0,0,1,2.49,2.49v22.4"></path>
                      <line x1="6.35" y1="20.63" x2="51.17" y2="20.63"></line>
                      <line x1="16.46" y1="9.63" x2="16.46" y2="4.63"></line>
                      <line x1="40.42" y1="9.63" x2="40.42" y2="4.63"></line>
                      <circle cx="45.22" cy="45.44" r="12.43"></circle>
                      <polyline points="45.22 36.7 45.22 45.82 49.57 49.16"></polyline>
                    </svg>
                    Task Scheduler
                  </NavLink>
                )}
              </div>

              <hr className="my-1 border-gray-200" />

              <div className="px-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-sm text-left text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 !font-normal" /* force the font to be normal*/
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0">
                    <path d="M14 4L17.5 4C20.5577 4 20.5 8 20.5 12C20.5 16 20.5577 20 17.5 20H14M3 12L15 12M3 12L7 8M3 12L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
