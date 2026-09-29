import { useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function SpoilCheckForm({ onSuccess }) {
  const [isChecking, setIsChecking] = useState(false);

  const [formData, setFormData] = useState({
    daysToExpire: '',
    lookbackDays: '',
    targetDays: '',
  });

  const handleRunSpoilCheck = async (e) => {
    e.preventDefault(); 
    setIsChecking(true);

    try {
      const response = await API.post('/inventory/spoilage-check', {
        days_to_expire: Number(formData.daysToExpire),
        lookback_days_sales: Number(formData.lookbackDays),
        target_days_prediction: Number(formData.targetDays),
      });

      const backendMsg = response.data.notif_count; // Extract message from "notif_count" string returned from service.py
      toast.success(backendMsg); 

      onSuccess();

    } catch (err) {
      console.error('Failed to run Spoilage check:', err);
      toast.error('Failed to run Spoilage check. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <form onSubmit={handleRunSpoilCheck} className="flex flex-col gap-4 max-w-md">
      <h3 className="text-lg font-bold text-gray-900">Execute Spoilage Check</h3>

      {/* Days Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Expiration Window (Days)</label>
        <input
          type="number"
          placeholder="Days to be Expired"
          min="1"
          value={formData.daysToExpire}
          onChange={(e) => setFormData({ ...formData, daysToExpire: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs text-gray-600 leading-relaxed">
          <strong>How it works?</strong> For Example, if you type <strong>7</strong>, it lists products expiring in the next 7 days and evaluates leftover stock to determine risk level (Warning or Danger).
        </p>
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
        <p className="mt-1 text-[11px] text-gray-500">
          *Max 5 days due to OpenWeather free-tier limits.
        </p>
      </div>

      <button
        type="submit"
        disabled={isChecking}
        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
      >
        {isChecking ? 'Running...' : 'Run'}
      </button>
    </form>
  );
}
