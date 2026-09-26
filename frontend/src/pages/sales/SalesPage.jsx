import { useState, useEffect } from 'react';
import API from '../../api/axios';
import SalesForm from '../../components/sales/SaleForm';
import SalesCard from '../../components/sales/SaleCard';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true); // Tracks if data is still downloading. Starts as true

  const [showForm, setShowForm] = useState(false); // Controls form visibility for creating new sales records

  // Triggers 'fetchInitialData' when page loads
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const salesRes = await API.get('/inventory/sales');
      setSales(salesRes.data);
    } catch (err) {
      console.error("Error fetching sales data:", err);
    } finally {
      setLoading(false);
    }
  };

  // State handler auto-run after creating a sale record (no need to refresh page to see result)
  const handleFormSuccess = async () => {
    await fetchInitialData(); // Re-fetch from the API so backend calculated fields can automatically run 
  };

  // Triggered when deleting a sale record
  const handleDelete = (deletedId) => {
    setSales(sales.filter((s) => s.id !== deletedId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Page Header & Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track sales transactions detail and total revenues.</p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Record New Sale
          </button>
        )}
      </div>

      {/* Create Form Display Card */}
      {showForm && (
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-6 shadow-md space-y-4">
          <SalesForm 
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

      {/* Sales List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Sales Records ({sales.length})
          </h2>
        </div>

        {/* Sales Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {sales.map((sale) => (
            <SalesCard 
              key={sale.id} 
              sale={sale} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
