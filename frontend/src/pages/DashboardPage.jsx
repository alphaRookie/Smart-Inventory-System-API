import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Smart Inventory System</h1>
        <p className="mt-1 text-gray-600">
          Welcome! Select a module to manage your inventory.
        </p>
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/*phone: max 1 per block ; deteskop: max 2 cards per block */}
        
        {/* Products Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="mt-2 text-sm text-gray-600 mb-4">
            View, track expiration, set the selling price, and assign products on 1 or more shelves.
          </p>
          <Link 
            to="/products" 
            className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Go to Products <span className="ml-1">➔</span>
          </Link>
        </div>

        {/* Shelves Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900">Shelves</h2>
          <p className="mt-2 text-sm text-gray-600 mb-4">
            Create shelf, track capacity, and view product allocations.
          </p>
          <Link 
            to="/shelves" 
            className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Go to Shelves <span className="ml-1">➔</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
