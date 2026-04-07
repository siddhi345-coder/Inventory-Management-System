import React, { useState, useEffect } from 'react';
import { getAllProducts, createSale, getSales, getCustomers, getSaleById } from '../../services/salesService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import '../../styles/components.css';

const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('create'); // 'create' or 'history'
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    customerId: '',
  });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, customersData, salesData] = await Promise.all([
        getAllProducts(),
        getCustomers(),
        getSales(),
      ]);
      setProducts(productsData);
      setCustomers(customersData);
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) {
      alert('Please select product and quantity');
      return;
    }

    const product = products.find((p) => p.id === parseInt(formData.productId));
    if (!product) {
      alert('Product not found');
      return;
    }

    if (parseInt(formData.quantity) > product.stock_quantity) {
      alert(`Only ${product.stock_quantity} units available`);
      return;
    }

    // Check if product already in cart
    const existingItem = cartItems.find((item) => item.product_id === parseInt(formData.productId));
    if (existingItem) {
      const newQuantity = existingItem.quantity + parseInt(formData.quantity);
      if (newQuantity > product.stock_quantity) {
        alert(`Only ${product.stock_quantity} units available`);
        return;
      }
      setCartItems(
        cartItems.map((item) =>
          item.product_id === parseInt(formData.productId)
            ? {
                ...item,
                quantity: newQuantity,
                total: newQuantity * item.unit_price,
              }
            : item
        )
      );
    } else {
      const newItem = {
        id: Date.now(),
        product_id: parseInt(formData.productId),
        productName: product.name,
        quantity: parseInt(formData.quantity),
        unit_price: product.selling_price,
        total: parseInt(formData.quantity) * product.selling_price,
      };
      setCartItems([...cartItems, newItem]);
    }

    setFormData({ ...formData, productId: '', quantity: '' });
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(id);
      return;
    }

    const item = cartItems.find((i) => i.id === id);
    const product = products.find((p) => p.id === item.product_id);

    if (newQuantity > product.stock_quantity) {
      alert(`Only ${product.stock_quantity} units available`);
      return;
    }

    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.unit_price,
            }
          : item
      )
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    const saleData = {
      customer_id: parseInt(formData.customerId),
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
    };

    try {
      const result = await createSale(saleData);
      alert('Sale created successfully!');
      setCartItems([]);
      setFormData({ productId: '', quantity: '', customerId: '' });
      fetchData(); // Refresh sales list
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error creating sale');
    }
  };

  const handleViewSale = async (saleId) => {
    try {
      const sale = await getSaleById(saleId);
      setSelectedSale(sale);
      setShowInvoice(true);
    } catch (error) {
      console.error('Error fetching sale:', error);
    }
  };

  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

  const columns = [
    { key: 'id', label: 'Sale ID' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'staff_name', label: 'Staff' },
    { key: 'total_amount', label: 'Amount', render: (val) => `₹${val?.toFixed(2) || '0.00'}` },
    { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, sale) => (
        <button
          onClick={() => handleViewSale(sale.id)}
          style={{
            padding: '6px 12px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          View Invoice
        </button>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <h1 style={{ marginBottom: '30px' }}>Sales Management</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setView('create')}
          style={{
            padding: '10px 20px',
            background: view === 'create' ? '#2ecc71' : '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Create Sale
        </button>
        <button
          onClick={() => setView('history')}
          style={{
            padding: '10px 20px',
            background: view === 'history' ? '#2ecc71' : '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sales History
        </button>
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedSale && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Card
            style={{
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Invoice #{selectedSale.id || 'N/A'}</h2>
              <button onClick={() => setShowInvoice(false)} style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p>
                  <strong>Customer:</strong> {selectedSale.customer_name || 'N/A'}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(selectedSale.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p>
                  <strong>Staff:</strong> {selectedSale.staff_name || 'N/A'}
                </p>
                <p>
                  <strong>Sale ID:</strong> {selectedSale.id}
                </p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Product</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items?.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                    <td style={{ padding: '10px' }}>{item.product_name || 'N/A'}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>₹{item.unit_price?.toFixed(2) || '0.00'}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>₹{(item.quantity * item.unit_price)?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>Grand Total: ₹{selectedSale.total_amount?.toFixed(2) || '0.00'}</h3>
            </div>

            <button
              onClick={() => window.print()}
              style={{
                padding: '10px 20px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Print Invoice
            </button>
            <button
              onClick={() => setShowInvoice(false)}
              style={{
                padding: '10px 20px',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </Card>
        </div>
      )}

      {view === 'create' ? (
        // Create Sale View
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Product Selection */}
          <Card>
            <h2>Add Items to Cart</h2>
            <form onSubmit={handleAddToCart} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label>Select Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #bdc3c7',
                    fontSize: '14px',
                  }}
                >
                  <option value="">-- Select Product --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.selling_price} (Stock: {product.stock_quantity})
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

              <Button type="submit" text="Add to Cart" />
            </form>
          </Card>

          {/* Cart */}
          <Card>
            <h2>Shopping Cart</h2>
            {cartItems.length === 0 ? (
              <p>Cart is empty</p>
            ) : (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Product</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Price</th>
                      <th style={{ textAlign: 'center', padding: '8px' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Total</th>
                      <th style={{ textAlign: 'center', padding: '8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                        <td style={{ padding: '8px' }}>{item.productName}</td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>₹{item.unit_price}</td>
                        <td style={{ textAlign: 'center', padding: '8px' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                            style={{ width: '50px', padding: '4px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>₹{item.total.toFixed(2)}</td>
                        <td style={{ textAlign: 'center', padding: '8px' }}>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            style={{
                              padding: '4px 8px',
                              background: '#e74c3c',
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

                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Cart Total: ₹{totalCartAmount.toFixed(2)}</h3>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label>Select Customer</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '1px solid #bdc3c7',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.phone || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleCheckout}
                  text="Checkout"
                  style={{ background: '#27ae60', width: '100%' }}
                />
              </div>
            )}
          </Card>
        </div>
      ) : (
        // Sales History View
        <Card>
          <h2>Sales History</h2>
          {loading ? (
            <p>Loading sales...</p>
          ) : sales.length === 0 ? (
            <p>No sales found</p>
          ) : (
            <Table columns={columns} data={sales} />
          )}
        </Card>
      )}
    </div>
  );
};

export default SalesPage;
