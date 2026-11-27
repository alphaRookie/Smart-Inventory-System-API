import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';

export default function SpoilCheckDetailPage() {
  const { id } = useParams(); // Gets id directly from URL route /spoilage-notif/:id
  const [spoilnotif, setSpoilNotif] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API.get(`/inventory/spoilage-notif/${id}`);
        setSpoilNotif(res.data);
      } catch (err) {
        console.error("Error fetching detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!spoilnotif) return <div>Spoilage notification record not found.</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link 
        to="/spoilage"
        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        ⬅ Back to Spoilage Notifications List
      </Link>

      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          SpoilCheck #{spoilnotif.id} — {spoilnotif.product_obj?.name}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm items-center">
          
          <p><span className="font-semibold text-gray-700">Record ID:</span> #{spoilnotif.id}</p>

          {/* Level Pill */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Level:</span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
              spoilnotif.level === 'DANGER'
                ? 'bg-red-100 text-red-800'
                : spoilnotif.level === 'WARNING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {spoilnotif.level}
            </span>
          </div>

          <p className="col-span-1 md:col-span-2">
            <span className="font-semibold text-gray-700">Product Name:</span> {spoilnotif.product_obj?.name}
          </p>

          <p className="col-span-1 md:col-span-2">
            <span className="font-semibold text-gray-700">Message:</span> {spoilnotif.message}
          </p>

        </div>
      </div>
    </div>
  );
}
