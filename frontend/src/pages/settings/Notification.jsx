import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function DisplayNotif() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/inventory/notification');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const handleDelete = async (id) => {
    try {
      await API.delete(`/inventory/notification/${id}`);
      setNotifications(notifs => notifs.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`/inventory/notification/${id}`);
      /* look at all obj in list, check if id matched what clicked: if yes make copy this obj and change only is_read part, else leave obj unchanged */
      setNotifications(notifs => notifs.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadItems = notifications.filter(n => !n.is_read);
    try {
      await Promise.all(
        unreadItems.map(n => API.patch(`/inventory/notification/${n.id}`))
      );
      setNotifications(notifs => notifs.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Narrow down the list of what stored in 'notifications' into All/Unread
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  // '.reduce' takes that narrowed-down list and groups them by their category separately
  const groupedByCat = filteredNotifications.reduce((groups, notif) => { 
    if (!groups[notif.category]) {
      groups[notif.category] = [];
    }
    groups[notif.category].push(notif);
    return groups;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header section */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications & Alerts</h1>
          <p className="text-sm text-gray-500">Manage all of your messages.</p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unread ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      {/* Messages List */}
      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading notifications...</p>
      ) : Object.keys(groupedByCat).length === 0 ? ( /* Obj.keys returns array contains category name () */
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500 text-sm">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCat).map(([categoryName, items]) => ( /* Obj.entries returns array of array (which is key,value) */
            <div key={categoryName} className="space-y-3">
              
              {/* Category Separator Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100">
                  <span>{categoryName}</span>
                </div>
                <div className="flex-1 h-[1px] bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium">{items.length} items</span>
              </div>

              {/* Items Stack */}
              <div className="grid grid-cols-1 gap-3 pl-2 sm:pl-4 border-l-2 border-indigo-100">
                {items.map(n => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                      n.is_read
                        ? 'bg-white border-gray-300 text-gray-600'
                        : 'bg-indigo-50/40 border-indigo-300 text-gray-700 font-medium shadow-sm'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        <span className="font-semibold text-gray-900">
                          {n.product_obj?.name || 'General Notice'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          n.level === 'DANGER' ? 'bg-red-100 text-red-600' : 
                          n.level === 'WARNING' ? 'bg-yellow-100 text-yellow-600' : 
                          n.level === 'INFO' ? 'bg-green-100 text-green-600' : 'text-gray-800'
                        }`}>
                          {n.level}
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          {new Date(n.created_at).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{n.message}</p> {/* add vertical breathing space between lines. makes paragraph cleaner */}
                    </div>

                    <div className="flex items-center gap-2 self-center">
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-md font-medium transition-colors shadow-sm"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="text-xs text-gray-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete message"
                      >
                        <strong>✕</strong>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}
