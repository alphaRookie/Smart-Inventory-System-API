import { useState, useEffect } from 'react';
import API from '../../api/axios';
import ProductForm from '../../components/products/ProductForm';
import ProductCard from '../../components/products/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]); // Holds the list of product obj fetched from backend. Starts as an empty list
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true); // Tracks if data is still downloading. Starts as true

  const [showForm, setShowForm] = useState(false); // Controls form visibility for creating new products

  // Triggers 'fetchInitialData' when page loads
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [prodRes, shelfRes] = await Promise.all([ // Runs both GET API requests in parallel for speed
        API.get('/inventory/product'),
        API.get('/inventory/shelf'),
      ]);
      setProducts(prodRes.data); // saves backend results into local state
      setShelves(shelfRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Triggered when user clicks "Add Product" button
  const handleOpenAddForm = () => {
    setShowForm(true);
  };

  // State handler for creating a product (POST only)
  const handleFormSuccess = (newProduct) => {
    setProducts([...products, newProduct]); // Appends newProduct to products array using spread operator (...)
    setShowForm(false); // Close form after successful creation
  };

  // Triggered when deleting a product
  const handleDelete = (deletedId) => {
    setProducts(products.filter((p) => p.id !== deletedId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Product Management</h2>

      {/* Add Button */}
      {!showForm && (
        <button 
          onClick={handleOpenAddForm} 
          style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          + Add New Product
        </button>
      )}

      {/* Create Form Display */}
      {showForm && (
        <div style={{ border: '2px solid #007bff', padding: '15px', borderRadius: '6px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
          <ProductForm 
            shelves={shelves} 
            initialData={null} // Always null since this page only creates new products
            onSuccess={handleFormSuccess} 
          />
          <button 
            onClick={() => setShowForm(false)} 
            style={{ marginTop: '10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
          >
            Cancel
          </button>
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />

      {/* Product List */}
      <h3>Product List ({products.length})</h3> 
      {products.map((product) => ( /* Loops over every product object in the state and renders a <ProductCard> card for each one */
        <ProductCard 
          key={product.id} 
          product={product} 
          onDelete={handleDelete}
        />
      ))}
      
    </div>
  );
}
