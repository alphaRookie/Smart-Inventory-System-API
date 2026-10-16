import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import DisplayNotif from '../../pages/settings/Notification';
import API from '../../api/axios';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openMessage, setOpenMessage] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const notifRes = await API.get('/inventory/notification');
        setNotifications(notifRes.data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    fetchInitialData();
  }, []);
 
  const unreadCount = notifications.filter(n => !n.is_read).length; // Calculate unread items dynamically
  
  // Helper for normal links: returns active styling vs inactive styling
  const getLinkClass = ({ isActive }) =>
    `transition-colors py-1 font-medium ${
      isActive
        ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
        : 'text-gray-600 hover:text-indigo-600'
    }`;

  // Helper for dropdown items (both dropdown will act the same)
  const getDropdownLinkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 font-semibold bg-indigo-50/80'
        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50'
    }`;

  // Checks for active states to keep parent dropdown buttons highlighted
  const isOrderPredActive = location.pathname.startsWith('/orderpred');
  const isProfileMenuSectionActive = location.pathname.startsWith('/settings') || location.pathname.startsWith('/scheduler');

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


  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          SmartSense
        </Link>
        
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
              <div className="absolute top-full left-0 mt-2 w-36 bg-white/90 backdrop-blur-md border border-gray-100 rounded-lg shadow-xl py-1 flex flex-col z-20 transition-all">
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

          <NavLink to="/spoilage" className={getLinkClass}>
            Spoilage Check
          </NavLink>
        </div>
      </div>

      {/* Profile & Messages Container */}
      <div className="flex items-center gap-3" ref={notifRef}>
        {/* Message Button */}
        <div className="relative">
          <button 
            type="button" 
            aria-label="Messages"
            onClick={() => setOpenMessage(!openMessage)}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors relative"
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
            <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-gray-100 rounded-lg shadow-xl py-2 px-3 flex flex-col z-30">
              <div className="flex items-center justify-between border-b pb-1 mb-2 px-1">
                <p className="font-semibold text-sm text-gray-700 m">Notifications</p>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 mb-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3">No notifications found.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => ( /* max to 5 notifs when looping */
                    <div 
                      key={n.id} 
                      className={`text-xs p-2 rounded border flex items-center justify-between gap-2 transition-colors ${
                        n.is_read ? 'bg-white text-gray-500 border-gray-100' : 'bg-gray-50 text-gray-800 border-indigo-100 font-medium'
                      }`}
                    >
                      {/* Left Side: Everything stacked normally */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded text-[9px]">
                            {n.category}
                          </span>
                          
                          <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                            n.level === 'DANGER' ? 'bg-red-100 text-red-600' : 
                            n.level === 'WARNING' ? 'bg-yellow-100 text-yellow-600' : 
                            n.level === 'INFO' ? 'bg-green-100 text-green-600' : 'text-gray-800'
                          }`}>
                            {n.level}
                          </span>

                          <span className="text-gray-400 text-[10px]">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>

                        {/* When system batch run, no spesific product obj passed, so just display as 'system run' */}
                        {n.product_obj ? (
                          <span className="text-xs font-bold text-gray-900 truncate"> {n.product_obj.name} </span>
                        ) : (
                          <span className="text-xs font-bold text-gray-900"> System Batch Run </span>
                        )}

                        <p className="text-xs text-gray-600 leading-snug"> {n.message} </p>
                      </div>

                      {/* Right Side: Checkmark button */}
                      {!n.is_read && (
                        <button 
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-gray-400 hover:text-green-600 p-1 font-bold shrink-0 self-center"
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
                className="text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-1.5 bg-indigo-50/50 hover:bg-indigo-50 rounded transition-colors mt-1"
              >
                See all messages →
              </NavLink>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-label="Profile menu"
            onClick={() => setProfileOpen(!profileOpen)}
            className={`p-2 rounded-lg transition-colors focus:outline-none ${
              isProfileMenuSectionActive
                ? 'text-indigo-600 bg-indigo-50/50'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white/90 backdrop-blur-md border border-gray-100 rounded-lg shadow-xl py-1 flex flex-col z-30">
              <NavLink
                to="/settings/profile"
                onClick={() => setProfileOpen(false)}
                className={getDropdownLinkClass}
              >
                Profile
              </NavLink>
              <NavLink
                to="/scheduler"
                onClick={() => setProfileOpen(false)}
                className={getDropdownLinkClass}
              >
                Task Scheduler
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
