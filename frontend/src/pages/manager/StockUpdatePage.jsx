import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { getProducts } from '../../services/productService';

const StockUpdatePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id, stock_quantity }
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.patch(`/products/${editing.id}/stock`, { stock_quantity: parseInt(editing.stock_quantity) });
      setMessage(`Stock updated successfully for product #${editing.id}`);
      setEditing(null);
      fetchProducts();
    } catch (e) {
      setMessage('Failed to update stock. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'brand', label: 'Brand' },
    {
      key: 'stock_quantity',
      label: 'Current Stock',
      render: (val) => (
        <span style={{ color: val <= 6 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
          {val} {val <= 6 ? '⚠️' : ''}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Update Stock',
      render: (_, product) => (
        <button
          onClick={() => setEditing({ id: product.id, name: product.name, stock_quantity: product.stock_quantity })}
          style={{ padding: '6px 12px', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Edit Stock
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1>Stock Update</h1>
        <p>Manually update product stock quantities.</p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', marginBottom: '16px', background: message.includes('success') ? '#d1fae5' : '#fee2e2', border: `1px solid ${message.includes('success') ? '#6ee7b7' : '#fca5a5'}`, borderRadius: '8px', color: message.includes('success') ? '#065f46' : '#991b1b' }}>
          {message}
        </div>
      )}

      {editing && (
        <Card style={{ marginBottom: '24px' }}>
          <h2>Update Stock — {editing.name}</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginTop: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>New Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={editing.stock_quantity}
                onChange={(e) => setEditing({ ...editing, stock_quantity: e.target.value })}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px', width: '160px' }}
              />
            </div>
            <Button onClick={handleSave} text={saving ? 'Saving...' : 'Save'} style={{ background: '#10b981' }} />
            <Button onClick={() => setEditing(null)} text="Cancel" style={{ background: '#6b7280' }} />
          </div>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Product Stock Levels</h2>
          <span style={{ fontSize: '13px', color: '#ef4444' }}>⚠️ = Low stock (6 or below)</span>
        </div>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <Table columns={columns} data={products} />
        )}
      </Card>
    </Layout>
  );
};

export default StockUpdatePage;
