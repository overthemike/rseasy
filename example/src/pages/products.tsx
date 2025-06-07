import { generateStructureId, getStructureInfo } from 'structure-id';

// Sample products data - similar structure to home page stats
const productsData = {
  title: 'Product Catalog',
  stats: {
    totalProducts: 89,
    categories: 12,
    inStock: 67
  },
  products: [
    { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'Electronics', inStock: true },
    { id: 2, name: 'Coffee Maker', price: 149.99, category: 'Appliances', inStock: true },
    { id: 3, name: 'Running Shoes', price: 79.99, category: 'Sports', inStock: false },
    { id: 4, name: 'Desk Lamp', price: 39.99, category: 'Furniture', inStock: true },
    { id: 5, name: 'Smartphone Case', price: 24.99, category: 'Electronics', inStock: true }
  ]
};

export default function ProductsPage() {
  const data = productsData;
  
  // Demonstrate RSEasy structure detection - this should match home page stats!
  const structureInfo = getStructureInfo(data);
  const statsStructureInfo = getStructureInfo(data.stats);
  
  console.log('RSEasy Demo - Products Page Structure:', {
    dataStructureId: structureInfo.id,
    statsStructureId: statsStructureInfo.id,
    levels: structureInfo.levels,
    note: 'Stats structure should match home page!'
  });
  
  return (
    <div>
      <h2>{data.title}</h2>
      
      {/* Same stats structure as home page - RSEasy should optimize this */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', margin: '2rem 0' }}>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Total Products</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.totalProducts}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>Categories</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.categories}</p>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3>In Stock</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.inStock}</p>
        </div>
      </div>
      
      <h3>Products</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {data.products.map(product => (
          <div key={product.id} style={{ 
            padding: '1rem', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h4 style={{ margin: 0 }}>{product.name}</h4>
              <p style={{ margin: '0.5rem 0', color: '#666' }}>{product.category}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>${product.price}</p>
              <p style={{ 
                margin: '0.5rem 0', 
                color: product.inStock ? 'green' : 'red',
                fontWeight: 'bold'
              }}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f8ff' }}>
        <h4>Structure Optimization</h4>
        <p>Notice how the stats section has the same structure as the home page.</p>
        <p>RSEasy should recognize this pattern and only transfer the different values!</p>
      </div>
    </div>
  );
}