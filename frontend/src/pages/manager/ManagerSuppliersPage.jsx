import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { getSuppliers, getSupplierProducts, getProductSuppliers } from '../../services/supplierService';

const cell = { padding: '10px 14px', color: '#555' };
const badge = (text, bg, color) => (
  <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

export default function ManagerSuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSuppliers, setProductSuppliers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  useEffect(() => { getSuppliers().then(setSuppliers).catch(console.error); }, []);

  const handleSupplierClick = async (supplier) => {
    if (selectedSupplier?.id === supplier.id) {
      setSelectedSupplier(null); setProducts([]); setSelectedProduct(null); setProductSuppliers([]);
      return;
    }
    setSelectedSupplier(supplier); setSelectedProduct(null); setProductSuppliers([]);
    setLoadingProducts(true);
    try { setProducts(await getSupplierProducts(supplier.id)); }
    catch { setProducts([]); }
    finally { setLoadingProducts(false); }
  };

  const handleProductClick = async (product) => {
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null); setProductSuppliers([]); return;
    }
    setSelectedProduct(product);
    setLoadingSuppliers(true);
    try { setProductSuppliers(await getProductSuppliers(selectedSupplier.id, product.id)); }
    catch { setProductSuppliers([]); }
    finally { setLoadingSuppliers(false); }
  };

  const thStyle = { textAlign: 'left', padding: '10px 14px', color: '#555', background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: 24, color: '#333' }}>Suppliers</h1>

        {/* Suppliers Table */}
        <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Address</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => handleSupplierClick(s)}
                  style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', background: selectedSupplier?.id === s.id ? '#eff6ff' : 'white', transition: 'background 0.15s' }}
                >
                  <td style={{ ...cell, fontWeight: 600, color: '#2563eb' }}>{s.name}</td>
                  <td style={cell}>{s.phone || '—'}</td>
                  <td style={cell}>{s.email || '—'}</td>
                  <td style={cell}>{s.address || '—'}</td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#999' }}>No suppliers found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Products supplied by selected supplier */}
        {selectedSupplier && (
          <div style={{ marginTop: 24, background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: 16 }}>Products supplied by <span style={{ color: '#2563eb' }}>{selectedSupplier.name}</span></h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>Click a product to see all its suppliers</p>
            </div>
            {loadingProducts ? (
              <p style={{ padding: 20, color: '#999', fontSize: 13 }}>Loading...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Product</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Brand</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                    <th style={thStyle}>Last Purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => handleProductClick(p)}
                      style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', background: selectedProduct?.id === p.id ? '#f0fdf4' : 'white', transition: 'background 0.15s' }}
                    >
                      <td style={{ ...cell, fontWeight: 600, color: '#16a34a' }}>{p.name}</td>
                      <td style={cell}>{p.category || '—'}</td>
                      <td style={cell}>{p.brand || '—'}</td>
                      <td style={{ ...cell, textAlign: 'right' }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td style={cell}>{p.last_purchase_date ? new Date(p.last_purchase_date).toLocaleDateString('en-IN') : '—'}</td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#999' }}>No products found for this supplier</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Suppliers for selected product */}
        {selectedProduct && (
          <div style={{ marginTop: 24, background: 'white', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: 16 }}>Suppliers for <span style={{ color: '#16a34a' }}>{selectedProduct.name}</span></h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>Preferred supplier = most purchases</p>
            </div>
            {loadingSuppliers ? (
              <p style={{ padding: 20, color: '#999', fontSize: 13 }}>Loading...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Supplier</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Email</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Purchases</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productSuppliers.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', background: i === 0 ? '#fefce8' : 'white' }}>
                      <td style={{ ...cell, fontWeight: 600 }}>{s.name}</td>
                      <td style={cell}>{s.phone || '—'}</td>
                      <td style={cell}>{s.email || '—'}</td>
                      <td style={{ ...cell, textAlign: 'right' }}>₹{Number(s.price).toLocaleString('en-IN')}</td>
                      <td style={{ ...cell, textAlign: 'center' }}>{s.purchase_count}</td>
                      <td style={{ ...cell, textAlign: 'center' }}>
                        {i === 0 ? badge('⭐ Preferred', '#fef9c3', '#854d0e') : badge('Alternative', '#f1f5f9', '#475569')}
                      </td>
                    </tr>
                  ))}
                  {productSuppliers.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: '#999' }}>No supplier data found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
