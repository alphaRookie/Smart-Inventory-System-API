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
  const handleUpdateSuccess = async () => {
    await fetchData();
    setIsEditing(false);        // closes edit form and returns to read-only view
  };

  if (loading) return <div className="text-gray-500 font-medium p-4">Loading product details...</div>;
  if (!product) return <div className="text-red-500 font-medium p-4">Product not found.</div>;

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* SPA Navigation back to main list view without reloading browser tab */}
      <Link to="/products" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
        ⬅ Back to Product List
      </Link>

      {/* Header and Toggle Edit Button */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        
        {/* Button to toggle edit mode on and off */}
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isEditing 
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
          }`}
        > 
          {isEditing ? 'Cancel Edit' : 'Edit Product'}
        </button>
      </div>

      {/* Conditional Rendering: Render form component if editing, else show product details */}
      {isEditing ? (
        /* Reuses existing ProductForm component with initialData pre-filled */
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-6 shadow-md">
          <ProductForm 
            shelves={shelves} 
            initialData={product} /* referring to that specific product when PATCH */
            onSuccess={handleUpdateSuccess} 
          />
        </div>
      ) : (
        /* Read-Only Product Details Display */
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
          
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><span className="font-semibold text-gray-700">Product ID:</span> {product.id}</p>
            <p><span className="font-semibold text-gray-700">Type:</span> {product.type}</p>
            <p><span className="font-semibold text-gray-700">Quantity in Stock:</span> {product.quantity}</p>
            <p><span className="font-semibold text-gray-700">Unit Cost:</span> ${product.unit_cost}</p>
            <p><span className="font-semibold text-gray-700">Selling Price:</span> ${product.selling_price}</p>
            <p><span className="font-semibold text-gray-700">Expire Date:</span> {product.expire_date}</p>
            <p><span className="font-semibold text-gray-700">Remaining Shelf Life:</span> {product.shelf_life} days</p>
            <p><span className="font-semibold text-gray-700">Deleted:</span> {product.is_deleted ? 'Yes' : 'No'}</p>
            
            {/* Status Pill */}
            <div className="flex items-center gap-2 col-span-1 md:col-span-2 mt-2">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                product.is_expired 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {product.is_expired ? 'Expired ❌' : 'Good ✅'}
              </span>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Render nested shelf_allocations array */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Shelf Allocations</h3>
            {product.shelf_allocations?.length > 0 ? (
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {product.shelf_allocations.map((alloc, idx) => (
                  <li key={idx} className="p-3 bg-gray-50 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Shelf #{alloc.shelf}</span>
                    <span className="font-bold text-gray-800">{alloc.quantity} units</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No shelves assigned yet.</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
