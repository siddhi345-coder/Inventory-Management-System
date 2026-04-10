import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createPurchase, getSuppliers } from '../../services/purchaseService';
import { getProducts } from '../../services/productService';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import '../../styles/components.css';

const PurchasesPage = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'admin';
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    productId: '',
    quantity: '',
    costPrice: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersData, productsData] = await Promise.all([
        getSuppliers(),
        getProducts(),
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.productId || !formData.quantity || !formData.costPrice) {
      alert('Please fill all fields');
      return;
    }

    const product = products.find((p) => p.id === parseInt(formData.productId));
    const newItem = {
      id: Date.now(),
      product_id: parseInt(formData.productId),
      productName: product.name,
      quantity: parseInt(formData.quantity),
      cost_price: parseFloat(formData.costPrice),
      total: parseInt(formData.quantity) * parseFloat(formData.costPrice),
    };

    setCartItems([...cartItems, newItem]);
    setFormData({ ...formData, productId: '', quantity: '', costPrice: '' });
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleSubmitPurchase = async () => {
    if (cartItems.length === 0) {
      alert('Add items to cart first');
      return;
    }

    const purchaseData = {
      supplier_id: parseInt(formData.supplierId),
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        cost_price: item.cost_price,
      })),
    };

    try {
      await createPurchase(purchaseData);
      alert('Purchase created successfully! Stock updated.');
      setCartItems([]);
      setFormData({ supplierId: '', productId: '', quantity: '', costPrice: '' });
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Error creating purchase');
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <Layout>
      <div className="page-header">
        <h1>Purchase Management</h1>
      </div>

      <div>
        {isReadOnly ? (
        <Card style={{ marginTop: '20px' }}>
          <h2>View only mode</h2>
          <p>Purchase creation is disabled for this role. You can still view supplier and product information.</p>
          <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
            <div>
              <strong>Suppliers loaded:</strong> {suppliers.length}
            </div>
            <div>
              <strong>Products loaded:</strong> {products.length}
            </div>
          </div>
        </Card>
      ) : (
          <div style={{ display: 'flex', gap: '30px' }}>
          {/* Supplier Selection & Items Input */}
          <Card style={{ flex: '1' }}>
            <h2>Add Purchase</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label>Select Supplier</label>
                <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid gray',
                  fontSize: '14px',
                }}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Select Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid gray',
                  fontSize: '14px',
                }}
              >
                <option value="">-- Select Product --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock_quantity})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />

            <Input
              label="Cost Price per Unit (Rs)"
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            />

            <Button onClick={handleAddToCart} text="Add to Cart" />
          </div>
        </Card>

        {/* Cart Summary */}
        <Card style={{ flex: '1' }}>
          <h2>Purchase Cart</h2>
          {cartItems.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <div>
<table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px' }}>Product</th>
                      <th style={{ textAlign: 'right', padding: '10px' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '10px' }}>Price</th>
                      <th style={{ textAlign: 'right', padding: '10px' }}>Total</th>
                      <th style={{ textAlign: 'center', padding: '10px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                      <td style={{ padding: '10px' }}>{item.productName}</td>
                      <td style={{ textAlign: 'right', padding: '10px' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '10px' }}>Rs {item.cost_price}</td>
                      <td style={{ textAlign: 'right', padding: '10px' }}>Rs {item.total.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', padding: '10px' }}>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          style={{
                            padding: '4px 8px',
                              background: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ background: 'lightgray', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Total Amount: Rs {totalAmount.toFixed(2)}</h3>
              </div>

              <Button
                onClick={handleSubmitPurchase}
                text="Confirm Purchase"
                style={{ background: 'green', width: '100%' }}
              />
            </div>
          )}
        </Card>
      </div>
      )}
      </div>
    </Layout>
  );
};

export default PurchasesPage;
