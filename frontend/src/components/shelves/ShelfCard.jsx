// Handle DELETE

import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useState } from 'react';

export default function ShelfCard({ shelf, onDelete }) { // these 2 are props received
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleDelete = async () => { // This fills the 'deletedId' parameter in ProductsPage
    try { 
      setIsDeleting(true); // 1. set to true to lock the button
      setErrorMsg(''); // Reset old errors before trying again
      await API.delete(`/inventory/shelf/${shelf.id}`); // 2. Send DELETE request to specific ID
      onDelete(shelf.id); // 3. After API call succeed, Tell the Page to remove this item from the screen
      setShowModal(false); // 4. finally close the modal (this runs only when succeed)
    } catch (error) {
      console.error("Error deleting shelf:", error);
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
    <div className="p-4 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <strong className="text-base font-semibold text-gray-900">
            #{shelf.id} - {shelf.category}
          </strong>
          <span className="text-sm ml-2">
            — <span className="font-medium text-emerald-600">Capacity: {shelf.current_stock}/{shelf.max_shelf_capacity}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <Link to={`/shelves/${shelf.id}`}>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View Details
            </button>
          </Link>

          <button 
            onClick={() => setShowModal(true)} 
            className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
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
            <p className="text-sm text-gray-600">Are you sure you want to delete this shelf?</p>
            
            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-md">
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={handleCloseModal} 
                disabled={isDeleting} /* stops user from clicking the button multiple times while an API request is running */
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting} /* when click 'confirm' it returns true */
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm"} {/* Button shows "Deleting..." & becomes disable until API call finished */}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



