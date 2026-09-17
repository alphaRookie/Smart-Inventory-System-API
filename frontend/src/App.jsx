/* The main root component of user interface. It holds the layout structure and renders components (pages, navbars, forms) */
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Import pages
import DashboardPage from './pages/DashboardPage'; 
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';


export default function App() {
  return (
    <BrowserRouter>
      {/* Navigation Bar (Changes the URL path when clicked without refresh the page) */}
      <nav style={{ display: 'flex', gap: '15px', padding: '10px', background: '#eee' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/products">Products</Link>
      </nav>

      {/* URL Routes (listens to that URL change and decides which React component to render) */}
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
