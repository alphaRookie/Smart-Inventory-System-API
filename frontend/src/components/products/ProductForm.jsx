// Handle form for POST/PATCH

import { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function ProductForm({ shelves, initialData = null, onSuccess }) { // these 3 are props received
  const isEditing = Boolean(initialData?.id);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'WEATHER_NEUTRAL',
    shelf_allocations: [],
    expire_date: '',
    quantity: 0,
    unit_cost: 0,
    selling_price: 0,
  });

  // Auto-fill the form when editing an existing product
  useEffect(() => {
    if (initialData) {
      setFormData({
        // fetch and show the value when PATCH and empty it when POST
        name: initialData.name || '',
        type: initialData.type || 'WEATHER_NEUTRAL',
        shelf_allocations: initialData.shelf_allocations || [],
        expire_date: initialData.expire_date || '',
        quantity: initialData.quantity || 0,
        unit_cost: initialData.unit_cost || 0,
        selling_price: initialData.selling_price || 0,
      });
    }
  }, [initialData]);

  // Extracts selected shelf IDs from multi-select options, keeps existing quantities if already selected, or sets default quantity: 1 for new selections
  const handleShelfSelect = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
    const updatedAllocations = selectedIds.map((id) => {
      const existing = formData.shelf_allocations.find((item) => item.shelf === id);
      return existing || { shelf: id, quantity: 1 };
    });
    setFormData({ ...formData, shelf_allocations: updatedAllocations });
  };

  // Updates individual shelf quantity values inside the shelf_allocations array
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

      // Sends the newly returned backend object back to ProductsPage.jsx
      const savedProduct = response.data?.product || response.data;
      onSuccess(savedProduct, isEditing);

      if (!isEditing) {
        // Reset form fields after successful POST
        setFormData({ name: '', type: 'WEATHER_NEUTRAL', shelf_allocations: [], expire_date: '', quantity: 0, unit_cost: 0, selling_price: 0, });
      }
    } catch (err) {
      console.error("Form Submission Error:", err.response?.data);
      setErrorMessage(JSON.stringify(err.response?.data || "Operation failed"));
    }
  };

  // Maps shelf_allocations to an array of IDs so <select multiple> displays selected highlights correctly
  const selectedShelfIds = formData.shelf_allocations.map((item) => item.shelf);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
      <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>

      {errorMessage && (
        <div style={{ color: 'red', background: '#fee', padding: '8px', fontSize: '12px' }}>
          {errorMessage}
        </div>
      )}

      <input 
        type="text" 
        placeholder="Product Name" 
        value={formData.name} 
        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
        required 
      />

      <label style={{ fontSize: '12px' }}>Allocate quantity per shelf (Hold Ctrl/Cmd):</label>
      <select multiple value={selectedShelfIds} onChange={handleShelfSelect} style={{ height: '80px' }}>
        {shelves.map((s) => (
          <option key={s.id} value={s.id}>{s.category} (ID: {s.id})</option>
        ))}
      </select>

      {formData.shelf_allocations.map((alloc) => (
        <div key={alloc.shelf} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px' }}>Qty for Shelf #{alloc.shelf}:</label>
          <input 
            type="number" 
            min="1" 
            value={alloc.quantity} 
            onChange={(e) => handleShelfQtyChange(alloc.shelf, e.target.value)} 
          />
        </div>
      ))}

      <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
        <option value="WEATHER_NEUTRAL">All-Weather</option>
        <option value="HEAT_BOOST">Heat-Responsive</option>
        <option value="COLD_BOOST">Cold-Responsive</option>
      </select>

      <input 
        type="date" 
        value={formData.expire_date} 
        onChange={(e) => setFormData({ ...formData, expire_date: e.target.value })} 
        required 
      />
      <input 
        type="number" 
        placeholder="Quantity" 
        value={formData.quantity} 
        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} 
      />
      <input 
        type="number" 
        placeholder="Unit Cost" 
        value={formData.unit_cost} 
        onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })} 
      />
      <input 
        type="number" 
        placeholder="Selling Price" 
        value={formData.selling_price} 
        onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })} 
      />

      <button type="submit">{isEditing ? 'Update Product' : 'Save Product'}</button>
    </form>
  );
} 
