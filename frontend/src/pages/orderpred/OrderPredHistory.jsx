import { useState, useEffect } from 'react';
import API from '../../api/axios';
import OrderPredCard from '../../components/orderpred/OrderPredCard';

export default function OrderPredHistory() {
  const [orderpred, setOrderPred] = useState([]);
  const [loading, setLoading] = useState(true); // Tracks if data is still downloading. Starts as true

  // Triggers 'fetchInitialData' when page loads
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const orderPredRes = await API.get('/inventory/predictions');
      setOrderPred(orderPredRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Triggered when deleting a shelf
  const handleDelete = (deletedId) => {
    setOrderPred(orderpred.filter((p) => p.id !== deletedId));
  };

  // Group order predictions by target_timing
  const groupedByDate = orderpred.reduce((groups, op) => {
    // override US date style to DD/MM/YYYY
    const dateStr = new Date(op.target_timing).toLocaleDateString('en-GB');

    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(op);
    return groups;
  }, {});

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Page Header & Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Prediction History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all records of order predictions check. <br/> 
            <span className="text-indigo-600 font-medium">Note:</span> Grouped by target prediction date (unlike sales, which refer to when they occurred).
          </p>
        </div>
      </div>

      {/* Shelf List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Order Prediction List ({orderpred.length})
          </h2>
        </div>

        {/* Shelf Cards Grid */}
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
                {items.map((orderpred) => ( /* loop only through the `items` for this specific date group */
                  <OrderPredCard 
                    key={orderpred.id} 
                    orderpred={orderpred} 
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
