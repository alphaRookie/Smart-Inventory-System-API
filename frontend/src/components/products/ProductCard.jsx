// Handle DELETE

import { Link } from 'react-router-dom';
import API from '../../api/axios';

export default function ProductCard({ product, onDelete }) { // these 2 are props received
  
  const handleDelete = async () => { // This fills the 'deletedId' parameter in ProductsPage
    try { 
      await API.delete(`/inventory/product/${product.id}`); // Send DELETE request to specific ID
      onDelete(product.id); // Tell the Page to remove this item from the screen
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
      <strong>{product.name}</strong> - ${product.selling_price} (Stock: {product.quantity})
      
      <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
        <Link to={`/products/${product.id}`}>
          <button style={{ color: 'blue' }}> View Details </button>
        </Link>
        <button onClick={handleDelete} style={{ color: 'red' }}> Delete </button>
      </div>
    </div>
  );
}
