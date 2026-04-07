import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/productService';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import '../../styles/components.css';

const ProductsPage = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    selling_price: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
      const cats = [...new Set((data || []).map(p => p.category).filter(Boolean))];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({ name: '', category: '', brand: '', selling_price: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      selling_price: product.selling_price,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, formData);
      } else {
        await addProduct(formData);
      }
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      alert(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        alert(error);
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'brand', label: 'Brand' },
    { key: 'selling_price', label: 'Price', render: (val) => `₹${val}` },
    { key: 'stock_quantity', label: 'Stock' },
  ];

  if (!isReadOnly) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (_, product) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEditClick(product)}
            style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(product.id)}
            style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>
      ),
    });
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>Products Management</h1>
        <p>Manage product inventory, add new products, and update stock levels.</p>
      </div>

      {showForm && (
        <Card style={{ marginBottom: "24px" }}>
          <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                {formData.category && !categories.includes(formData.category) && (
                  <option value={formData.category}>{formData.category}</option>
                )}
              </select>
            </div>
            <Input
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
            <Input
              label="Selling Price (₹)"
              type="number"
              step="0.01"
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
              required
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" text={editingId ? 'Update Product' : 'Add Product'} />
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                text="Cancel"
                style={{ background: '#95a5a6' }}
              />
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2>Product List</h2>
            <p>View all products in your inventory.</p>
          </div>
          {!isReadOnly && <Button onClick={handleAddClick} text="+ Add Product" />}
        </div>
        {isReadOnly && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <strong>View only mode:</strong> editing, adding, and deleting products is disabled for this role.
          </div>
        )}

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found. Add your first product!</p>
        ) : (
          <Table columns={columns} data={products} />
        )}
      </Card>
    </Layout>
  );
};

export default ProductsPage;
