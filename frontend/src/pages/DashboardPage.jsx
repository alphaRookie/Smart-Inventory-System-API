import { Link } from 'react-router-dom';
import { isNormalUser, isWorker } from '../utils/Permissions';

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
      {isNormalUser() && ( // SHOW to normal user
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm flex items-start space-x-3">
          <div className="flex-shrink-0">
            {/* Warning Icon */}
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-800">Account Pending Role Assignment</h3>
            <p className="text-sm text-amber-700 mt-1">
              Your account is successfully registered. Please wait for an administrator to assign your role before module access is unlocked.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/*phone: max 1 per block ; deteskop: max 2 cards per block */}
        
        {/* Products Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all hover:shadow-indigo-500/30 hover:ring-1 hover:ring-indigo-500/60"> {/* custom opacity of colored shadow and border color when gets hovered */}
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="mt-2 text-sm text-gray-600 mb-4">
            View, track expiration, set the selling price, and assign products on 1 or more shelves.
          </p>
          {!isNormalUser() && ( // HIDE from normal user
            <Link 
              to="/products" 
              className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Go to Products <span className="ml-1">➔</span>
            </Link>
          )}
        </div>

        {/* Shelves Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all hover:shadow-indigo-500/30 hover:ring-1 hover:ring-indigo-500/60">
          <h2 className="text-lg font-semibold text-gray-900">Shelves</h2>
          <p className="mt-2 text-sm text-gray-600 mb-4">
            Create shelf, track capacity, and view product allocations.
          </p>
          {!isNormalUser() && (
            <Link 
              to="/shelves" 
              className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Go to Shelves <span className="ml-1">➔</span>
            </Link>
          )}
        </div>

        {/* Sales Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all hover:shadow-indigo-500/30 hover:ring-1 hover:ring-indigo-500/60">
          <h2 className="text-lg font-semibold text-gray-900">Sales</h2>
          <p className="mt-2 text-sm text-gray-600 mb-4">
            Trigger transaction, tracks the timing, quantity sold, and revenue.
          </p>
          {!isNormalUser() && (
            <Link 
              to="/sales" 
              className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Go to Sales <span className="ml-1">➔</span>
            </Link>
          )}
        </div>

        {/* Order Prediction Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all hover:shadow-indigo-500/30 hover:ring-1 hover:ring-indigo-500/60">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Order Prediction</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">ML Powered</span>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 mb-4">
            Forecast stock demand using weather data, analyze sales lookback periods, and view prediction logs.
          </p>
          
          {!isNormalUser() && !isWorker() && ( // anyone apart from Normal user and Worker can access
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
          )}
        </div>

        {/* Spoilage Check Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all hover:shadow-indigo-500/30 hover:ring-1 hover:ring-indigo-500/60">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Spoilage Check</h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">ML Powered</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">Instant Telegram Alert</span>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 mb-4">
            Run the Possibility of spoilage products that will be notified by Telegram and Tracks the history
          </p>
          
          {!isNormalUser() && !isWorker() && ( // anyone apart from Normal user and Worker can access
            <Link 
              to="/spoilage" 
              className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Run Check <span className="ml-1">➔</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
