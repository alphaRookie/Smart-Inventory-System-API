// Handle DELETE

import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useState } from 'react';

export default function ProductCard({ product, onDelete }) { // these 2 are props received
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
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
    <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
      <strong>{product.id} - {product.name}</strong> - ${product.selling_price} (Stock: {product.quantity})
      
      <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>

        <Link to={`/products/${product.id}`}> {/* matching what defined in App.jsx, not django */}
          <button style={{ color: 'blue' }}> View Details </button>
        </Link>

        <button onClick={() => setShowModal(true)} style={{ color: 'red' }}> Delete </button>
        {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <p>Are you sure you want to delete this?</p>
            {errorMsg && <p style={{ color: 'red', margin: '10px 0' }}>{errorMsg}</p>}
            <button onClick={handleDelete} disabled={isDeleting}> {/* when click 'confirm' it returns true */}
              {isDeleting ? "Deleting..." : "Confirm"} {/* Button shows "Deleting..." & becomes disable until API call finished */}
            </button>
            <button onClick={handleCloseModal} disabled={isDeleting}>Cancel</button>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}


