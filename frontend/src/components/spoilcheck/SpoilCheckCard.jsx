import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useState } from 'react';

export default function SpoilNotifCard({ spoilnotif, onDelete }) { // receive spoilnotif object and onDelete handler
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDelete = async () => {
    try {
      setIsDeleting(true); // 1. Lock button state
      setErrorMsg(''); // Reset prior errors
      await API.delete(`/inventory/spoilage-notif/${spoilnotif.id}`); // 2. Send DELETE request
      onDelete(spoilnotif.id); // 3. Remove item from parent state
      setShowModal(false); // 4. Close modal on success
    } catch (error) {
      console.error("Error deleting a spoilage notif record:", error);
      setErrorMsg('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false); // Always unlock button
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setErrorMsg('');
  };


  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <strong className="text-base font-semibold text-gray-900">
            #{spoilnotif.id} - {spoilnotif.product_obj?.name} {/* i use custom serializer to get product obj */}
          </strong>
          <div className="text-sm text-gray-500 mt-1">
            <span>
              Level:{" "}
              <span
              className={`font-medium ${
                  spoilnotif.level === 'DANGER' ? 'text-red-600' : 
                  spoilnotif.level === 'WARNING' ? 'text-yellow-600' : 'text-gray-800'
              }`}
              >
              {spoilnotif.level}
            </span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <Link to={`/spoilage/${spoilnotif.id}`}>
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
            <p className="text-sm text-gray-600">Are you sure you want to delete this spoilnotif record?</p>
            
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
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
