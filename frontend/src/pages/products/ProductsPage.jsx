import { useState, useEffect } from 'react';
import API from '../../api/axios';
import ProductForm from '../../components/products/ProductForm';
import ProductCard from '../../components/products/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]); // Holds the list of product obj fetched from backend. Starts as an empty list
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true); // Tracks if data is still downloading. Starts as true

  const [showForm, setShowForm] = useState(false); // Controls create form modal/card

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

  // State handler auto-run after POST/PATCH a product (no need to refresh page to see result)
  const handleFormSuccess = async () => {
    await fetchInitialData(); // Re-fetch from the API so backend calculated fields can automatically run 
    setShowForm(false); // Close form after successful creation
  };

  // Triggered when deleting a product
  const handleDelete = (deletedId) => {
    setProducts(products.filter((p) => p.id !== deletedId));
  };

  // Toggle to hide/unhide deleted products
  const [hideDeletedProd, setHideDeletedProd] = useState(false); 
  const visibleProducts = hideDeletedProd ? products.filter((p) => !p.is_deleted) : products; // if true, hide deleted prod --- if false, show deleted prod

  if (loading) {return <div className="text-gray-500 font-medium p-4">Loading products...</div>;}

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Page Header & Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory stock and shelf placements.</p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <button 
            onClick={handleOpenAddForm} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add New Product
          </button>
        )}
      </div>

      {/* Create Form Display Card */}
      {showForm && (
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-6 shadow-md space-y-4">
          <ProductForm 
            shelves={shelves} 
            initialData={null} // Always null since this page only creates new products
            onSuccess={handleFormSuccess} 
          />
          <button 
            onClick={() => setShowForm(false)} 
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Product List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Product List ({visibleProducts.length})
          </h2>

          <button 
            onClick={() => setHideDeletedProd(!hideDeletedProd)} /* button that triggers to unhide (also hide --bcoz React handles both states with a ! toggle) */
            className="border px-3 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
          >
            {hideDeletedProd ? 'Show All Products' : 'Hide Deleted Products'}
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {visibleProducts.map((product) => ( /* Loops over every product object in the state and renders a <ProductCard> card for each one */
            <ProductCard 
              key={product.id} 
              product={product} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
