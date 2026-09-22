import { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function SalesForm({ onSuccess }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    product: '',
    quantity_sold: 1,
  });

  // Fetch available products for the dropdown menu
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get('/inventory/product');
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // API Submission (POST only)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops page reload
    setErrorMessage('');

    // Format payload to ensure proper data types
    const payload = {
      product: Number(formData.product),
      quantity_sold: Number(formData.quantity_sold),
    };

    try {
      const response = await API.post('/inventory/sales', payload);

      // Sends newly returned backend object to parent component
      const savedSale = response.data?.sale || response.data;
      if (onSuccess) onSuccess(savedSale);

      // Reset form fields after successful POST
      setFormData({
        product: products.length > 0 ? products[0].id : '',
        quantity_sold: 1,
      });
    } catch (err) {
      console.error("Form Submission Error:", err.response?.data);
      setErrorMessage(JSON.stringify(err.response?.data || "Operation failed"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <h3 className="text-lg font-bold text-gray-900">Record New Sale</h3>

      {errorMessage && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Product Selection Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Select Product</label>
        <select 
          value={formData.product} 
          onChange={(e) => setFormData({ ...formData, product: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="" disabled>-- Select a Product --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (ID: {p.id})
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Sold Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity Sold</label>
        <input 
          type="number" 
          placeholder="Quantity" 
          min="1"
          value={formData.quantity_sold} 
          onChange={(e) => setFormData({ ...formData, quantity_sold: Number(e.target.value) })} 
          required 
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button 
        type="submit"
        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm"
      >
        Save Sale Record
      </button>
    </form>
  );
}
