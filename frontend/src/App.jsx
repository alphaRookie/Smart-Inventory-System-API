import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import React, { useState } from 'react';
// Import pages
import DashboardPage from './pages/DashboardPage'; 
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';

import ShelvesPage from './pages/shelves/ShelvesPage';
import ShelfDetailPage from './pages/shelves/ShelfDetailPage';

import SalesPage from './pages/sales/SalesPage';
import SaleDetailPage from './pages/sales/SaleDetailPage';

import OrderPredForecast from './pages/orderpred/OrderPredForecast';
import OrderPredHistory from './pages/orderpred/OrderPredHistory';
import OrderPredHistoryDetail from './pages/orderpred/OrderPredHistoryDetail';

import SpoilCheckPage from './pages/spoilcheck/SpoilCheckPages';
import SpoilCheckDetailPage from './pages/spoilcheck/SpoilCheckDetailPage';

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <BrowserRouter>
      {/* Outer wrapper to set screen height and light gray background */}
      <div className="min-h-screen bg-gray-50">
        
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                SmartSense
            </Link>
            
            <div className="flex items-center gap-6 font-medium">
              <Link to="/products" className="text-gray-600 hover:text-indigo-600 transition-colors py-1">
                Products
              </Link>
              <Link to="/shelves" className="text-gray-600 hover:text-indigo-600 transition-colors py-1">
                Shelves
              </Link>
              <Link to="/sales" className="text-gray-600 hover:text-indigo-600 transition-colors py-1">
                Sales
              </Link>

              {/* Dropdown Menu Container */}
              <div className="relative">
                <button 
                  onClick={() => setOpen(!open)}
                  className="text-gray-600 hover:text-indigo-600 flex items-center gap-1.5 py-1 font-medium transition-colors"
                >
                  Order Predictions 
                  
                  {/* Paste the JSX Icon and toggle rotation */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" 
                    className={`w-4 h-4 text-gray-400 translate-y-[2px] transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {open && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-white/90 backdrop-blur-md border border-gray-100 rounded-lg shadow-xl py-1 flex flex-col z-20 transition-all">
                    <Link 
                      to="/orderpred/forecast" onClick={() => setOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                    >
                      Forecast
                    </Link>
                    <Link 
                      to="/orderpred/history" onClick={() => setOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                    >
                      History
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/spoilage" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors py-1 !-ml-2">
                Spoilage Check
              </Link>

            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/shelves" element={<ShelvesPage />} />
            <Route path="/shelves/:id" element={<ShelfDetailPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/:id" element={<SaleDetailPage />} />
            <Route path="/orderpred/forecast" element={<OrderPredForecast />} />
            <Route path="/orderpred/history" element={<OrderPredHistory />} />
            <Route path="/orderpred/history/:id" element={<OrderPredHistoryDetail />} />
            <Route path="/spoilage" element={<SpoilCheckPage />} />
            <Route path="/spoilage/:id" element={<SpoilCheckDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
