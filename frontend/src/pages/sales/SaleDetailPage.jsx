import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import SalesForm from '../../components/sales/SaleForm';

export default function SaleDetailPage() {
  const { id } = useParams(); // Grabs dynamic :id parameter from URL path (e.g., /sales/3)
  const [sale, setSale] = useState(null);

  const [loading, setLoading] = useState(true);

  // Triggers fetchData whenever URL's id changes
  useEffect(() => {
    fetchData();
  }, [id]);

  // Fetches target sale record details
  const fetchData = async () => {
    try {
      const saleRes = await API.get(`/inventory/sales/${id}`);
      setSale(saleRes.data); // Save target sale data to state
    } catch (error) {
      console.error("Error loading sale details:", error);
    } finally {
      setLoading(false); // Stop loading whether succeeded or failed
    }
  };

  // Callback function passed to SalesForm (runs after successful PATCH submit)
  const handleUpdateSuccess = (updatedSale) => {
    setSale(updatedSale); // Updates local state with response from server
  };

  if (loading) return <div>Loading sale details...</div>;
  if (!sale) return <div>Sale record not found.</div>;

  // Format ISO timestamp into a readable date string
  const formattedDate = sale.created_at 
    ? new Date(sale.created_at).toLocaleString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* SPA Navigation back to main list view without reloading browser tab */}
      <Link to="/sales" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
        ⬅ Back to Sales List
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Sale #{sale.id} — {sale.product_obj?.name} {/* ? (optional chaining) is a safety guard to prevent crashing on the initial load before backend response reaches the page */}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
        {/* Key Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <p><span className="font-semibold text-gray-700">Transaction ID:</span> #{sale.id}</p>
        <p><span className="font-semibold text-gray-700">Product Name:</span> {sale.product_obj?.name}</p>
        <p><span className="font-semibold text-gray-700">Quantity Sold:</span> {sale.quantity_sold} units</p>
        <p><span className="font-semibold text-gray-700">Total Revenue:</span> <span className="font-bold text-emerald-600">${sale.total_revenue}</span></p>
        <p className="col-span-1 md:col-span-2"><span className="font-semibold text-gray-700">Transaction Date:</span> {formattedDate}</p>
        </div>
      </div>

    </div>
  );
}
