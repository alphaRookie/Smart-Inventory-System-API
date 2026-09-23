import { useState } from 'react';
import API from '../../api/axios';

export default function SinglePrediction({ products }) { //product prop passed by parent
  const [selectedProduct, setSelectedProduct] = useState(''); // holds ID of that selected product
  const [targetDays, setTargetDays] = useState(7);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await API.post(`inventory/predict/${selectedProduct}`, {
        product_id: Number(selectedProduct),
      });
      setPrediction(response.data);
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Failed to generate single order prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // bcoz we access "returning the raw JSON list from FastAPI," so we only can access product object manually
  const matchedProduct = products.find((p) => p.id === Number(selectedProduct));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Input Form Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Single Product Prediction</h2>
        <p className="text-xs text-gray-500 mb-4">
          Forecast required order quantity for a specific product based on historical demand and weather patterns.
        </p>

        <form onSubmit={handlePredict} className="space-y-4">
          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- Choose a Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Calculating Forecast...' : 'Generate Prediction'}
          </button>
        </form>
      </div>

      {/* Prediction Output Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Prediction Result</h2>
          <p className="text-xs text-gray-500 mb-4">AI model recommendation based on real-time factors.</p>

          {prediction ? (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                <span className="text-xs uppercase tracking-wide font-semibold text-indigo-600">
                  Suggested Order Quantity
                </span>
                <div className="text-3xl font-extrabold text-indigo-950 mt-1">
                  {prediction.suggested_order || 0} units {/* object properties must match the name FastAPI returned */}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="block text-xs text-gray-500">Predicted Demand</span>
                  <span className="font-semibold text-gray-800">{prediction.predicted_demand || '-'}</span> {/* object properties must match what FastAPI returned */}
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="block text-xs text-gray-500">Current Stock</span>
                  <span className="font-semibold text-gray-800"> {matchedProduct?.quantity ?? '-'} </span> {/* Current Stock from Frontend State */}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
              Select a product and click generate to view prediction.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
