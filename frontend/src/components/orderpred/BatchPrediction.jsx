import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function BatchPrediction({ products }) {
  const [targetDays, setTargetDays] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    lookbackDays: '',
    targetDays: '',
  });

  const handlePredict = async (e) => {
    e.preventDefault();

    // Reset state when user submit the new request (wipe out old table, old error)
    setLoading(true);
    setErrorMessage('');
    setPredictions([]);

    try {
      const response = await API.post(`inventory/predict-batch`, {
        // Pass key name expected by Django
        lookback_days_sales: formData.lookbackDays,
        target_days_prediction: formData.targetDays,
      });
      setPredictions(response.data);
      
    } catch (err) {
      // Inline msg for validation error and Toast msg for server error(no resp)
      if (err.response?.status === 400){setErrorMessage(err.response?.data);} 
      else {toast.error(err.response?.data?.error_msg || "Could not contact Django backend engine");} // dynamically handle if 1 of them or both engine are off
      console.error("Error to run batch prediction:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <> {/* wraps 2 cards inside empty container */}

    {/* Input Form Card */}
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
      
      <h2 className="text-lg font-bold text-gray-900 mb-1">Batch Order Prediction</h2>
      <p className="text-xs text-gray-500 mb-4">
        Forecast order quantity for all products based on historical demand and weather patterns.
      </p>

      <form onSubmit={handlePredict} className="space-y-4">
        {errorMessage && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
            {errorMessage}
          </div>
        )}

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
          {loading ? 'Calculating Forecast...' : 'Run All Predictions'}
        </button>
      </form>
    </div>
    
    {/* Prediction Result part */}
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Prediction Result</h2>
        <p className="text-xs text-gray-500 mb-4">AI model recommendation based on real-time factors..</p>
      </div>

      {/* Results Table */}
      {predictions.length > 0 ? (
        <div className=" border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs uppercase">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Predicted Demand</th>
                <th className="p-3">Suggested Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {predictions.map((item, idx) => { /* 'item' refers to whatever array passed into setPredictions(...) */
                // Find the full product object from that products array
                const matchedProduct = products.find(
                  (p) => p.id === (item.product_id || item.product)
                );

                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900"> {matchedProduct?.name} </td>
                    <td className="p-3 text-gray-600"> {matchedProduct?.quantity ?? '-'} </td>
                    <td className="p-3 text-gray-600"> {item.predicted_demand ?? 0} </td> {/* object properties must match name FastAPI returned */}
                    <td className="p-3">
                      {(() => {
                        const suggestion = item.suggested_order ?? 0; /* object properties must match what FastAPI returned */
                        return (
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              suggestion > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {suggestion > 0 ? `Order ${suggestion} units` : 'Sufficient Stock'}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-30 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
          No batch predictions generated yet. Click "Run All Predictions" above.
        </div>
      )}
    </div>
  </>
  );
}

