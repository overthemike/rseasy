import { generateStructureId, getStructureInfo } from 'structure-id';

// Sample data that will be tracked by RSEasy
const homeData = {
  title: 'Welcome to RSEasy Demo',
  stats: {
    totalUsers: 1250,
    totalProducts: 89,
    activeOrders: 15
  },
  recentActivity: [
    { id: 1, action: 'User registered', timestamp: '2024-01-15T10:30:00Z' },
    { id: 2, action: 'Product created', timestamp: '2024-01-15T10:15:00Z' },
    { id: 3, action: 'Order placed', timestamp: '2024-01-15T10:00:00Z' }
  ]
};

export default function HomePage() {
  // In a real app, this would come from a database or API
  const data = homeData;
  
  // Demonstrate RSEasy structure detection
  const structureInfo = getStructureInfo(data);
  const statsStructureInfo = getStructureInfo(data.stats);
  
  console.log('RSEasy Demo - Home Page Structure:', {
    dataStructureId: structureInfo.id,
    statsStructureId: statsStructureInfo.id,
    levels: structureInfo.levels
  });
  
  return (
    <div>
      <h2>{data.title}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '2rem 0' }}>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.totalUsers}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Products</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.totalProducts}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Active Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.activeOrders}</p>
        </div>
      </div>
      
      <h3>Recent Activity</h3>
      <ul>
        {data.recentActivity.map(activity => (
          <li key={activity.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{activity.action}</strong> - {new Date(activity.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5' }}>
        <h4>RSEasy Protocol Status</h4>
        <p>This page demonstrates RSEasy structure-aware data transfer.</p>
        <p>Open browser dev tools and check network requests to see the optimized payloads.</p>
        <p>Navigate between pages to see how RSEasy optimizes repeated data structures.</p>
      </div>
    </div>
  );
}