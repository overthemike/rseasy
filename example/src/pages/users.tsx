import { generateStructureId, getStructureInfo } from 'structure-id';

// Sample users data - reuses similar patterns
const usersData = {
  title: 'User Management',
  stats: {
    totalUsers: 1250,
    activeUsers: 892,
    newToday: 23
  },
  users: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', joinDate: '2024-01-10', active: true },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', joinDate: '2024-01-08', active: true },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', joinDate: '2024-01-05', active: false },
    { id: 4, name: 'David Wilson', email: 'david@example.com', joinDate: '2024-01-12', active: true },
    { id: 5, name: 'Eve Brown', email: 'eve@example.com', joinDate: '2024-01-15', active: true }
  ]
};

export default function UsersPage() {
  const data = usersData;
  
  // Demonstrate RSEasy structure detection - stats should match other pages!
  const structureInfo = getStructureInfo(data);
  const statsStructureInfo = getStructureInfo(data.stats);
  
  console.log('RSEasy Demo - Users Page Structure:', {
    dataStructureId: structureInfo.id,
    statsStructureId: statsStructureInfo.id,
    levels: structureInfo.levels,
    note: 'Stats structure should match home and products pages!'
  });
  
  return (
    <div>
      <h2>{data.title}</h2>
      
      {/* Same stats structure pattern again */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '2rem 0' }}>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.totalUsers}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Active Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.activeUsers}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>New Today</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.newToday}</p>
        </div>
      </div>
      
      <h3>Users</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {data.users.map(user => (
          <div key={user.id} style={{ 
            padding: '1rem', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h4 style={{ margin: 0 }}>{user.name}</h4>
              <p style={{ margin: '0.5rem 0', color: '#666' }}>{user.email}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>
                Joined: {new Date(user.joinDate).toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: user.active ? '#d4edda' : '#f8d7da',
                color: user.active ? '#155724' : '#721c24'
              }}>
                {user.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff8e1' }}>
        <h4>Pattern Recognition</h4>
        <p>This page also uses the stats structure pattern from home and products.</p>
        <p>The user list has a different structure than products, demonstrating mixed optimization.</p>
      </div>
    </div>
  );
}