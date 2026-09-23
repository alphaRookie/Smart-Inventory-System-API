import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';

export default function OrderPredDetail() {
  const { id } = useParams(); // Gets id directly from URL route /predictions/:id
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API.get(`/inventory/predictions/${id}`);
        setPrediction(res.data);
      } catch (err) {
        console.error("Error fetching detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!prediction) return <div>Prediction record not found.</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link 
        to="/orderpred/history"
        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        ⬅ Back to Predictions List
      </Link>

      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Prediction #{prediction.id} — {prediction.product_obj?.name}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><span className="font-semibold text-gray-700">Record ID:</span> #{prediction.id}</p>
          <p><span className="font-semibold text-gray-700">Product Name:</span> {prediction.product_obj?.name}</p>
          <p><span className="font-semibold text-gray-700">Demand Prediction:</span> {prediction.demand_prediction} units</p>
          <p><span className="font-semibold text-gray-700">Order Suggestion:</span> {prediction.order_suggestion} units</p>
          <p className="col-span-1 md:col-span-2">
            <span className="font-semibold text-gray-700">Target Timing:</span> {prediction.target_timing}
          </p>
        </div>
      </div>
    </div>
  );
}
