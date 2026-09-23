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

        {/* Sales Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900">Sales</h2>
          <p className="mt-2 text-sm text-gray-600 mb-4">
            Trigger transaction, tracks the timing, quantity sold, and revenue.
          </p>
          <Link 
            to="/sales" 
            className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Go to Sales <span className="ml-1">➔</span>
          </Link>
        </div>

        {/* Order Prediction Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Order Prediction</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">ML Powered</span>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 mb-4">
            Forecast stock demand using weather data, analyze sales lookback periods, and view prediction logs.
          </p>
          
          <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
            <Link 
              to="/orderpred/forecast" 
              className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Run Forecast <span className="ml-1">➔</span>
            </Link>
            
            <Link 
              to="/orderpred/history" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              View History
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
