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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
