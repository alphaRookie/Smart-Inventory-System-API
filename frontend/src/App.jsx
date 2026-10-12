import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';

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

import TaskScheduler from './pages/settings/TaskScheduler';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />

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

            <Route path="/scheduler" element={<TaskScheduler />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
