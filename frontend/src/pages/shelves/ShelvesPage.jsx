import { useState, useEffect } from 'react';
import API from '../../api/axios';
import ShelfForm from '../../components/shelves/ShelfForm';
import ShelfCard from '../../components/shelves/ShelfCard';

export default function ShelvesPage() {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true); // Tracks if data is still downloading. Starts as true

  const [showForm, setShowForm] = useState(false); // Controls form visibility for creating new shelves

  // Triggers 'fetchInitialData' when page loads
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const shelfRes = await API.get('/inventory/shelf');
      setShelves(shelfRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // State handler auto-run after creating a new shelf (no need to refresh page to see result)
  const handleFormSuccess = async () => {
    await fetchInitialData(); // Re-fetch from the API so backend calculated fields can automatically run 
    setShowForm(false); // Close form after successful creation
  };

  // Triggered when deleting a shelf
  const handleDelete = (deletedId) => {
    setShelves(shelves.filter((p) => p.id !== deletedId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Page Header & Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shelf Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your shelf layouts and capacity.</p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add New Shelf
          </button>
        )}
      </div>

      {/* Create Form Display Card */}
      {showForm && (
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-6 shadow-md space-y-4">
          <ShelfForm 
            shelves={shelves} 
            initialData={null} // Always null since this page only creates new shelves
            onSuccess={handleFormSuccess} 
          />
          <button 
            onClick={() => setShowForm(false)} 
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Shelf List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Shelf List ({shelves.length})
          </h2>
        </div>

        {/* Shelf Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {shelves.map((shelf) => (
            <ShelfCard 
              key={shelf.id} 
              shelf={shelf} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
