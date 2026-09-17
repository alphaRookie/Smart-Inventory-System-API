import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import ProductForm from '../../components/products/ProductForm'; 

export default function ProductDetailPage() {
  const { id } = useParams(); // Grabs the dynamic :id parameter from the URL path (e.g., /products/31)
  const [product, setProduct] = useState(null); 
  const [shelves, setShelves] = useState([]); // Holds shelf options needed for ProductForm dropdown

  const [isEditing, setIsEditing] = useState(false); // Controls view mode (false = read-only, true = edit form)
  const [loading, setLoading] = useState(true); 

  // Triggers fetchData whenever load or URL's id changes
  useEffect(() => {
    fetchData();
  }, [id]);

  // Fetches both the target product details and shelf list at the same time for better speed
  const fetchData = async () => {
    try {
      const [productRes, shelfRes] = await Promise.all([
        API.get(`/inventory/product/${id}`),
        API.get('/inventory/shelf'),
      ]);
      setProduct(productRes.data); // Save target product data to state
      setShelves(shelfRes.data);   // Save available shelves options to state
    } catch (error) {
      console.error("Error loading product details:", error);
    } finally {
      setLoading(false); // Stop loading whether succeed/failed
    }
  };

  // Callback function passed to ProductForm (runs after successful PATCH submit)
  const handleUpdateSuccess = (updatedProduct) => {
    setProduct(updatedProduct); // updates local state with response from server
    setIsEditing(false);        // closes edit form and returns to read-only view
  };

  if (loading) return <div>Loading product details...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      {/* SPA Navigation back to main list view without reloading browser tab */}
      <Link to="/products">⬅ Back to Product List</Link>
      
      <h2>{product.name}</h2>

      {/* Button to toggle edit mode on and off */}
      {/* if now in edit mode (isEditing=true), show 'Cancel Edit' and set to 'false' to close form . Otherwise show 'Edit Product' */}
      <button onClick={() => setIsEditing(isEditing ? false : true)} style={{ marginBottom: '15px' }}> 
        {isEditing ? 'Cancel Edit' : 'Edit Product'}
      </button>

      {/* Conditional Rendering: Render form component if editing, else show product details */}
      {isEditing ? (
        /* Reuses existing ProductForm component with initialData pre-filled */
        <ProductForm 
          shelves={shelves} 
          initialData={product} /* referring to that spesific product when PATCH */
          onSuccess={handleUpdateSuccess} 
        />
      ) : (
        /* Read-Only Product Details Display */
        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
          <p><strong>Product ID:</strong> {product.id}</p>
          <p><strong>Type:</strong> {product.type}</p>
          <p><strong>Quantity in Stock:</strong> {product.quantity}</p>
          <p><strong>Unit Cost:</strong> ${product.unit_cost}</p>
          <p><strong>Selling Price:</strong> ${product.selling_price}</p>
          <p><strong>Expire Date:</strong> {product.expire_date}</p>
          <p><strong>Remaining Shelf Life:</strong> {product.shelf_life} days</p>
          <p><strong>Deleted:</strong> {product.is_deleted ? 'Yes' : 'No'} </p>
          <p><strong>Status:</strong> {product.is_expired ? 'Expired ❌' : 'Good ✅'}</p>

          <hr style={{ margin: '15px 0' }} />

          {/* Render nested shelf_allocations array */}
          <h4>Shelf Allocations:</h4>
          {product.shelf_allocations?.length > 0 ? (
            <ul>
              {product.shelf_allocations.map((alloc, idx) => (
                <li key={idx}>
                  Shelf #{alloc.shelf}: <strong>{alloc.quantity} units</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#777' }}>No shelves assigned yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
