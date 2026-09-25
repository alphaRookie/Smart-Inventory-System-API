import { useState, useEffect } from 'react';
import API from '../../api/axios';
import SpoilNotifCard from '../../components/spoilcheck/SpoilCheckCard';

export default function SpoilCheckPage() {
  const [spoilnotif, setSpoilNotif] = useState([]);
  const [spoilcheck, setSpoilCheck] = useState([]);
  const [loading, setLoading] = useState(true); // Tracks initial page load ONLY
  const [isChecking, setIsChecking] = useState(false); // Tracks button check action
  const [resultMsg, setResultMsg] = useState({ text: '', isError: false });

  // Triggers 'fetchInitialData' when page loads
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const spoilnotifRes = await API.get('/inventory/spoilage-notif');
      setSpoilNotif(spoilnotifRes.data);
    } catch (err) {
      console.error("Error fetching spoilage notification history data:", err);
    } finally {
      setLoading(false); // turns off initial page loading
    }
  };

  const handleRunSpoilCheck = async () => {
    setIsChecking(true);
    setResultMsg({ text: '', isError: false });
    
    try {
      const response = await API.post('/inventory/spoilage-check');
      setSpoilCheck(response.data); // access what returned from service.py
      
      // Access "notif_count" string returned from service.py
      const backendMsg = response.data.notif_count;
      setResultMsg({ text: backendMsg, isError: false }); // immediately show the message
       
      // Re-fetch data without toggling global full-page loading screen
      await fetchInitialData();

    } catch (err) {
      console.error("Failed to run Spoilage check:", err);
      setResultMsg({ text: "Failed to run Spoilage check. Please try again.", isError: true });
    } finally {
      setIsChecking(false); // Reset button state, NOT page loading state
      setTimeout(() => setResultMsg({ text: '', isError: false }), 3000); // auto-hide the msg after 3 sec
    }
  };

  // State handler auto-run after creating a sale record (no need to refresh page to see result)
  const handleFormSuccess = async () => {
    await fetchInitialData(); // Re-fetch from the API so backend calculated fields can automatically run 
    setShowForm(false); // Close form after successful creation
  };

  // Triggered when deleting a sale record
  const handleDelete = (deletedId) => {
    setSpoilNotif(spoilnotif.filter((s) => s.id !== deletedId));
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Page Header & Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spoilage Management</h1>
          <p className="text-sm text-gray-500 mt-1">Check the Possibility of spoilage products and Tracks the history </p>
        </div>

        {/* Add Button */}
        <button 
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          onClick={handleRunSpoilCheck}
          disabled={isChecking}
        >
          {isChecking ? "Running Check..." : "Run Spoilage Check"}
        </button>
      </div>

      {/* SpoilCheck List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Spoilage Check Records ({spoilnotif.length})
          </h2>
        </div>

        {/* SpoilCheck Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {spoilnotif.map((spoilntf) => (
            <SpoilNotifCard 
              key={spoilntf.id} 
              spoilnotif={spoilntf} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {resultMsg.text && (
      <div 
          className={`fixed bottom-5 right-5 z-50 text-white px-4 py-3 rounded-lg shadow-xl transition-all max-w-md 
          ${resultMsg.isError ? 'bg-rose-600' : 'bg-emerald-600'}`}
      >
          {resultMsg.text}
      </div>
      )}

    </div>
  );
}
