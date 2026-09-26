// Handle form for POST/PATCH

import { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function ProductForm({ shelves, initialData = null, onSuccess }) { // these 3 are props received
  const isEditing = Boolean(initialData?.id);
  const [errorMessage, setErrorMessage] = useState('');

  // EXACT name key expected by Django
  const [formData, setFormData] = useState({name: '', type: '', shelf_allocations: [], expire_date: '', quantity: '', unit_cost: '', selling_price: ''});

  // Auto-fill the form when editing an existing product
  useEffect(() => {
    if (initialData) {
      setFormData({
        // fetch and show the value when PATCH and empty it when POST
        name: initialData.name || '',
        type: initialData.type || '',
        shelf_allocations: initialData.shelf_allocations || [],
        expire_date: initialData.expire_date || '',
        quantity: initialData.quantity || '',
        unit_cost: initialData.unit_cost || '',
        selling_price: initialData.selling_price || '',
      });
    }
  }, [initialData]);

  // Handle selecting from Dropdowns
  const handleShelfToggle = (shelfId) => {
    const exists = formData.shelf_allocations.some((item) => item.shelf === shelfId);
    let updatedAllocations;

    if (exists) {
      // Remove if unchecked
      updatedAllocations = formData.shelf_allocations.filter((item) => item.shelf !== shelfId);
    } else {
      // Add with default quantity 1 if checked
      updatedAllocations = [...formData.shelf_allocations, { shelf: shelfId, quantity: 1 }];
    }

    setFormData({ ...formData, shelf_allocations: updatedAllocations });
  };

  // Updates quantity for that spesific shelf
  const handleShelfQtyChange = (shelfId, qty) => {
    const updatedAllocations = formData.shelf_allocations.map((item) => 
      item.shelf === shelfId ? { ...item, quantity: Number(qty) } : item
    );
    setFormData({ ...formData, shelf_allocations: updatedAllocations });
  };

  // API Submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the browser from refreshing on form submit
    setErrorMessage('');

    try {
      let response;
      if (isEditing) { // PATCH request when editing
        response = await API.patch(`/inventory/product/${initialData.id}`, formData); 
      } else { // POST request when creating
        response = await API.post('/inventory/product', formData);
      }

      onSuccess();  // trigger success signal to parent after form is sent

    } catch (err) {
      console.error("Form Submission Error:", err.response?.data);
      setErrorMessage(JSON.stringify(err.response?.data || "Operation failed"));
    }
  };

  // Maps shelf_allocations to an array of IDs so <select multiple> displays selected highlights correctly
  const selectedShelfIds = formData.shelf_allocations.map((item) => item.shelf);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>

      {errorMessage && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
        <input 
          type="text" 
          placeholder="Product Name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          required 
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Add Shelf</label>
        
        {/* Dropdown */}
        <select 
          value="" 
          onChange={(e) => handleShelfToggle(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option disabled value="">-- Select a shelf --</option>
          {shelves
            .filter((s) => !selectedShelfIds.includes(s.id))
            .map((s) => <option key={s.id} value={s.id}>{s.category} (ID: {s.id})</option>)}
        </select>

        {/* Selected Items List */}
        <div className="mt-2 space-y-1">
          {formData.shelf_allocations.map((alloc) => (
            <div key={alloc.shelf} className="flex items-center justify-between border p-2 rounded-lg bg-gray-50 text-xs">
              <span>Shelf #{alloc.shelf}</span>
              <input 
                type="number" 
                min="1" 
                value={alloc.quantity} 
                onChange={(e) => handleShelfQtyChange(alloc.shelf, e.target.value)} 
                className="w-16 border p-1 rounded-lg bg-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={() => handleShelfToggle(alloc.shelf)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Weather Behavior</label>
        <select 
          value={formData.type} 
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="" disabled>-- Select Weather Responsiveness --</option>
          <option value="WEATHER_NEUTRAL">All-Weather</option>
          <option value="HEAT_BOOST">Heat-Responsive</option>
          <option value="COLD_BOOST">Cold-Responsive</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Expiration Date</label>
        <input 
          type="date" 
          value={formData.expire_date} 
          onChange={(e) => setFormData({ ...formData, expire_date: e.target.value })} 
          required 
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
          <input 
            type="number" 
            placeholder="Quantity" 
            value={formData.quantity} 
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Unit Cost</label>
          <input 
            type="number" 
            placeholder="Unit Cost" 
            value={formData.unit_cost} 
            onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price</label>
          <input 
            type="number" 
            placeholder="Selling Price" 
            value={formData.selling_price} 
            onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })} 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button 
        type="submit"
        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm"
      >
        {isEditing ? 'Update Product' : 'Save Product'}
      </button>
    </form>
  );
}
