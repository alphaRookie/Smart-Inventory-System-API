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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Page Header & Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Prediction History</h1>
          <p className="text-sm text-gray-500 mt-1">Track all predictions happened</p>
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
        <div className="grid grid-cols-1 gap-4">
          {orderpred.map((orderpred) => (
            <OrderPredCard 
              key={orderpred.id} 
              orderpred={orderpred} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
