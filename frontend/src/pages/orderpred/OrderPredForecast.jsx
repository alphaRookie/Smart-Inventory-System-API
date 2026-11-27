import { useState, useEffect } from 'react';
import API from '../../api/axios';
import SinglePrediction from '../../components/orderpred/SinglePrediction';
import BatchPrediction from '../../components/orderpred/BatchPrediction';

export default function OrderPredPage() {
  const [activeTab, setActiveTab] = useState('single'); // tracks which tab am i right now
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    if (products.length === 0) { // makes sure if products already fetched (no need to send API request everytime load)
      fetchProducts(); // if not yet, fetch it once
    }
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/inventory/product');
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching batch products:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Demand Forecasting</h1>
        <p className="text-sm text-gray-500 mt-1">Predict inventory replenishment demands using SmartSense predictive models.</p>
      </div>

      {/* Separate Tab Controls */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setActiveTab('single')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'single'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Single Item Prediction
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'batch'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Batch Inventory Prediction
        </button>
      </div>

      {/* Content Rendering & In-line Loading (The title and tab buttons stay fixed during "Loading products...") */}
      {loading && (
        <div className="text-sm text-gray-500 py-4">Loading products...</div>
      )}

      {!loading && activeTab === 'single' && (
        <SinglePrediction products={products} />
      )}

      {!loading && activeTab === 'batch' && (
        <BatchPrediction products={products} />
      )}
      
    </div>
  );
}
