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

  // Group sales by their date (YYYY-MM-DD)
  const groupedByDate = sales.reduce((groups, sale) => {
    // override US date style to DD/MM/YYYY
    const dateStr = new Date(sale.created_at).toLocaleDateString('en-GB');

    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(sale);
    return groups;
  }, {});

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
        {Object.keys(groupedByDate).length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No records found.</p>
        ) : (
          Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date} className="space-y-3">
              
              {/* Clear Date Header Separator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100 shadow-2xs">
                  {/* Calendar Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span>{date}</span>
                </div>
                <div className="flex-1 h-[1px] bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium">{items.length} items</span>
              </div>

              {/* Cards Stack for that specific day */}
              <div className="grid grid-cols-1 gap-3 pl-2 sm:pl-4 border-l-2 border-indigo-100">
                {items.map((sale) => ( /* loop only through the `items` for this specific date group */
                  <SalesCard 
                    key={sale.id} 
                    sale={sale} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
