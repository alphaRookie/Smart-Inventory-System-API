import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import ShelfForm from '../../components/shelves/ShelfForm'; 

export default function ShelfDetailPage() {
  const { id } = useParams(); // Grabs the dynamic :id parameter from URL path (e.g., /shelves/3)
  const [shelf, setShelf] = useState(null); 

  const [isEditing, setIsEditing] = useState(false); // Controls view mode (false = read-only, true = edit form)
  const [loading, setLoading] = useState(true); 

  // Triggers fetchData whenever URL's id changes
  useEffect(() => {
    fetchData();
  }, [id]);

  // Fetches target shelf details
  const fetchData = async () => {
    try {
      const shelfRes = await API.get(`/inventory/shelf/${id}`);
      setShelf(shelfRes.data); // Save target shelf data to state
    } catch (error) {
      console.error("Error loading shelf details:", error);
    } finally {
      setLoading(false); // Stop loading whether succeed/failed
    }
  };

  // Callback function passed to ShelfForm (runs after successful PATCH submit)
  const handleUpdateSuccess = (updatedShelf) => {
    setShelf(updatedShelf); // updates local state with response from server
    setIsEditing(false);     // closes edit form and returns to read-only view
  };

  if (loading) return <div>Loading shelf details...</div>;
  if (!shelf) return <div>Shelf not found.</div>;

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* SPA Navigation back to main list view without reloading browser tab */}
      <Link to="/shelves" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
        ⬅ Back to Shelf List
      </Link>

      {/* Header and Toggle Edit Button */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Shelf #{shelf.id} ({shelf.category})</h1>
        
        {/* Button to toggle edit mode on and off */}
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isEditing 
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
          }`}
        > 
          {isEditing ? 'Cancel Edit' : 'Edit Shelf'}
        </button>
      </div>

      {/* Conditional Rendering: Render form component if editing, else show shelf details */}
      {isEditing ? (
        /* Reuses existing ShelfForm component with initialData pre-filled */
        <div className="bg-white border-2 border-indigo-500 rounded-lg p-6 shadow-md">
          <ShelfForm 
            initialData={shelf} /* referring to that specific shelf when PATCH */
            onSuccess={handleUpdateSuccess} 
          />
        </div>
      ) : (
        /* Read-Only Shelf Details Display */
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
          
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><span className="font-semibold text-gray-700">Shelf ID:</span> {shelf.id}</p>
            <p><span className="font-semibold text-gray-700">Category:</span> {shelf.category}</p>
            <p><span className="font-semibold text-gray-700">Current Stock:</span> {shelf.current_stock} units</p>
            <p><span className="font-semibold text-gray-700">Max Capacity:</span> {shelf.max_shelf_capacity} units</p>
          </div>

          <hr className="border-gray-200" />

          {/* Render allocated products array if available from backend */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Allocated Products on this Shelf</h3>
            {shelf.product_allocations?.length > 0 ? (
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {shelf.product_allocations
                  .filter(alloc => !alloc.product.is_deleted && !alloc.product.is_expired) /* filter out soft-deleted and expired products */
                  .map((alloc) => (
                    <li key={alloc.id} className="p-3 bg-gray-50 flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">
                        {alloc.product.name} <span className="text-xs text-gray-500 font-normal">(id: {alloc.product.id})</span>
                      </span>
                      <span className="font-bold text-gray-800">{alloc.quantity} units</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No products allocated on this shelf yet.</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
