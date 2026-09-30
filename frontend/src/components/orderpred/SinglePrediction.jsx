import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function SinglePrediction({ products }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    selectedProduct: '',
    lookbackDays: '',
    targetDays: '',
  });

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!formData.selectedProduct) return;

    // Reset state when user submit the new request (wipe out old table, old error)
    setLoading(true);
    setErrorMessage('');
    setPrediction(null);
 
    try {
      const response = await API.post(`inventory/predict/${formData.selectedProduct}`, {
        // Pass key name expected by Django
        lookback_days_sales: formData.lookbackDays,
        target_days_prediction: formData.targetDays,
      });
      toast.success('Single Prediction Successfully created')
      setPrediction(response.data);

    } catch (err) {
      // Inline msg for validation error and Toast msg for server error(no resp)
      if (err.response?.status === 400){setErrorMessage(err.response?.data);} 
      else {toast.error(err.response?.data?.error_msg || "Could not contact Django backend engine");} // dynamically handle if 1 of them or both engine are off
      console.error("Error to run batch prediction:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // bcoz we access "returning the raw JSON list from FastAPI," so we only can access product object manually
  const matchedProduct = products.find((p) => p.id === Number(formData.selectedProduct));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Input Form Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Single Order Prediction</h2>
        <p className="text-xs text-gray-500 mb-4">
          Forecast order quantity for a specific product based on historical demand and weather patterns.
        </p>

        <form onSubmit={handlePredict} className="space-y-4">
          {errorMessage && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Select product dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Product</label>
            <select
              value={formData.selectedProduct}
              onChange={(e) => setFormData({ ...formData, selectedProduct: e.target.value })} /* without this, the choosen product is not appear */
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- Choose a Product --</option>
              {products
              .filter((p) => !p.is_expired && !p.is_deleted)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Lookback days Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Historical Lookback (Days)</label>
            <input 
              type="number" 
              name="lookback_days"
              placeholder="Days of past sales data to analyze (e.g. 3)" 
              min="1"
              value={formData.lookbackDays} 
              onChange={(e) => setFormData({ ...formData, lookbackDays: e.target.value })}
              required 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Target days Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Prediction Period (Days)</label>
            <input 
              type="number" 
              name="target_days"
              placeholder="Number of upcoming days to prepare stock for (e.g. 1-5)" 
              min="1"
              max="5"
              value={formData.targetDays} 
              onChange={(e) => setFormData({ ...formData, targetDays: e.target.value })}
              required 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {/* Helper text */}
            <p className="mt-1 text-[11px] text-gray-500">
              *Max 5 days due to OpenWeather free-tier limits.
            </p>
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
                  {prediction.suggested_order ?? 0} units {/* object properties must match the name FastAPI returned */}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="block text-xs text-gray-500">Predicted Demand</span>
                  <span className="font-semibold text-gray-800">{prediction.predicted_demand ?? '-'}</span> {/* object properties must match what FastAPI returned */}
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="block text-xs text-gray-500">Current Stock</span>
                  <span className="font-semibold text-gray-800"> {matchedProduct?.quantity ?? '-'} </span> {/* Current Stock from Frontend State */}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
              Select a product and click generate to view prediction.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
