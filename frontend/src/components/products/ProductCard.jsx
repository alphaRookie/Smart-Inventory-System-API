// Handle DELETE

import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useState } from 'react';

export default function ProductCard({ product, onDelete }) { // these 2 are props received
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDeleted = product.is_deleted; 

  const handleDelete = async () => { // This fills the 'deletedId' parameter in ProductsPage
    try { 
      setIsDeleting(true); // 1. set to true to lock the button
      setErrorMsg(''); // Reset old errors before trying again
      await API.delete(`/inventory/product/${product.id}`); // 2. Send DELETE request to specific ID
      onDelete(product.id); // 3. After API call succeed, Tell the Page to remove this item from the screen
      setShowModal(false); // 4. finally close the modal (this runs only when succeed)
    } catch (error) {
      console.error("Error deleting product:", error);
      setErrorMsg('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false); // always unlock the button whether succeed/failed
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrorMsg(''); // Reset error when modal closes
  };

  return (
    <div 
      className={`p-4 rounded-lg border shadow-sm transition-all ${
        isDeleted 
          ? 'bg-gray-800 border-gray-700 text-gray-400 opacity-60' 
          : 'bg-white border-gray-200 text-gray-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <strong className={`text-base font-semibold ${isDeleted ? 'line-through' : 'text-gray-900'}`}>
            #{product.id} - {product.name}
          </strong>
          <span className="text-sm ml-2">
            — <span className="font-medium text-emerald-600">${product.selling_price}</span> (Stock: {product.quantity})
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <Link to={`/products/${product.id}`}> {/* matching what defined in App.jsx, not django */}
            <button className={`text-sm font-medium ${isDeleted ? 'text-indigo-400 hover:text-indigo-500' : 'text-indigo-600 hover:text-indigo-700'} transition-colors`}>
              View Details
            </button>
          </Link>

          <button 
            onClick={() => setShowModal(true)} 
            className={`text-sm font-medium ${isDeleted ? 'text-rose-400 hover:text-rose-500' : 'text-rose-600 hover:text-rose-700'}  transition-colors`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-gray-800 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete this product?</p>
            
            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-md">
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={handleCloseModal} 
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting} 
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {/* when click 'confirm' it returns true */}
                {isDeleting ? "Deleting..." : "Confirm"} {/* Button shows "Deleting..." & becomes disable until API call finished */}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
