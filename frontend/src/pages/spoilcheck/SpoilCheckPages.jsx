import { useState, useEffect } from 'react';
import API from '../../api/axios';
import SpoilNotifCard from '../../components/spoilcheck/SpoilCheckCard';
import SpoilCheckForm from '../../components/spoilcheck/SpoilCheckForm';

export default function SpoilCheckPage() {
  const [spoilnotif, setSpoilNotif] = useState([]);
  const [loading, setLoading] = useState(true); // Tracks initial page load ONLY
  const [isChecking, setIsChecking] = useState(false); // Tracks button check action
  const [showForm, setShowForm] = useState(false); 

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
        {!showForm && (
        <button 
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          onClick={() => setShowForm(true)}
          disabled={isChecking}
        >
          {isChecking ? "Running Check..." : "Run Spoilage Check"}
        </button>
        )}
      </div>

      {/* Create Form Display Card */}
      {showForm && (
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-6 shadow-md space-y-4">
          <SpoilCheckForm 
            initialData={null} // Always null since this page only creates new sale records
            onSuccess={handleFormSuccess} // waits success signal from child to trigger it
          />
          <button 
            onClick={() => setShowForm(false)} 
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

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


    </div>
  );
}
