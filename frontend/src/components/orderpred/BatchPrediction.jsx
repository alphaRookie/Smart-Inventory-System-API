import { useState } from 'react';
import API from '../../api/axios';

export default function BatchPrediction({ products }) {
  const [targetDays, setTargetDays] = useState(7);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBatchPredict = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await API.post('/inventory/predict-batch');
      setPredictions(response.data || []);
    } catch (err) {
      console.error("Batch prediction error:", err);
      setError("Failed to generate batch predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
      
      {/* Header and Trigger Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Batch Order Prediction</h2>
          <p className="text-xs text-gray-500">Calculate reorder requirements across all catalog items at once.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBatchPredict}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Run All Predictions'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results Table */}
      {predictions.length > 0 ? (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
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
              {predictions.map((item, idx) => {
                // Find the full product object from that products array
                const matchedProduct = products.find(
                  (p) => p.id === (item.product_id || item.product)
                );

                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900"> {matchedProduct?.name || `Product #${item.product_id}`} </td>
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
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
          No batch predictions generated yet. Click "Run All Predictions" above.
        </div>
      )}

    </div>
  );
}
/* item refers to whatever array elements passed into setPredictions(...) */
