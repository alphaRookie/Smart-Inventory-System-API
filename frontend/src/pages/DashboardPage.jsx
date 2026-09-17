import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Smart Inventory System</h2>
      <p>Welcome! Select a module to manage your inventory.</p>

      {/* Quick Summary / Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
        
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3>📦 Products</h3>
          <p>View, track, and create products or shelf allocations.</p>
          <Link to="/products" style={{ color: '#007bff', fontWeight: 'bold' }}>Go to Products ➔</Link>
        </div>

        

      </div>
    </div>
  );
}
