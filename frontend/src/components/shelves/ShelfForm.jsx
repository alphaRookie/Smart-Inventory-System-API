// Handle form for POST/PATCH (Shelves)

import { useState, useEffect } from 'react';
import API from '../../api/axios';

export default function ShelfForm({ initialData = null, onSuccess }) {
  const isEditing = Boolean(initialData?.id);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    category: 'PERISHABLE',
    max_shelf_capacity: 100,
  });

  // Auto-fill the form when editing an existing shelf
  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || 'PERISHABLE',
        max_shelf_capacity: initialData.max_shelf_capacity || 100,
      });
    }
  }, [initialData]);

  // API Submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stops the browser from refreshing on form submit
    setErrorMessage('');

    try {
      let response;
      if (isEditing) { // PATCH request when editing
        response = await API.patch(`/inventory/shelf/${initialData.id}`, formData);
      } else { // POST request when creating
        response = await API.post('/inventory/shelf', formData);
      }

      // Sends the newly returned backend object back to parent page
      const savedShelf = response.data?.shelf || response.data;
      onSuccess(savedShelf, isEditing);

      if (!isEditing) {
        // Reset form fields after successful POST
        setFormData({
          category: 'PERISHABLE',
          max_shelf_capacity: 100,
        });
      }
    } catch (err) {
      console.error("Form Submission Error:", err.response?.data);
      setErrorMessage(JSON.stringify(err.response?.data || "Operation failed"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit Shelf' : 'Add New Shelf'}</h3>

      {errorMessage && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Category Choices mapping Django TextChoices */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Shelf Category</label>
        <select 
          value={formData.category} 
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="PERISHABLE">Perishable Goods</option>
          <option value="NON_PERISHABLE">Non-Perishable Goods</option>
          <option value="FROZEN">Frozen Food</option>
          <option value="HAZMAT">Hazardous Materials</option>
        </select>
      </div>

      {/* Max Capacity Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Max Shelf Capacity</label>
        <input 
          type="number" 
          placeholder="Max Capacity" 
          min="1"
          value={formData.max_shelf_capacity} 
          onChange={(e) => setFormData({ ...formData, max_shelf_capacity: Number(e.target.value) })} 
          required 
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button 
        type="submit"
        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors shadow-sm"
      >
        {isEditing ? 'Update Shelf' : 'Save Shelf'}
      </button>
    </form>
  );
}
