import Layout from '../../components/layout/Layout';
import { useState, useEffect } from 'react';
import { getSales, getSaleById } from '../../services/salesService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

const ManagerSalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await getSales();
      setSales(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleViewSale = async (id) => {
    try {
      const s = await getSaleById(id);
      setSelectedSale(s);
      setShowInvoice(true);
    } catch (e) { console.error(e); }
  };

  const columns = [
    { key: 'id', label: 'Sale ID', render: (v) => `#${v}` },
    { key: 'customer_name', label: 'Customer', render: (v) => v || 'N/A' },
    { key: 'staff_name', label: 'Staff', render: (v) => v || 'N/A' },
    { key: 'total_amount', label: 'Amount', render: (v) => `₹${parseFloat(v || 0).toFixed(2)}` },
    { key: 'sale_date', label: 'Date', render: (v) => new Date(v).toLocaleDateString('en-IN') },
    {
      key: 'actions', label: 'Actions',
      render: (_, s) => (
        <button
          onClick={() => handleViewSale(s.id)}
          style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          View Invoice
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1>Sales History</h1>
      </div>

      {showInvoice && selectedSale && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Invoice #{selectedSale.id}</h2>
              <button onClick={() => setShowInvoice(false)} style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p><strong>Customer:</strong> {selectedSale.customer_name || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(selectedSale.sale_date).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p><strong>Staff:</strong> {selectedSale.staff_name || 'N/A'}</p>
                <p><strong>Sale ID:</strong> #{selectedSale.id}</p>
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
                    <td style={{ textAlign: 'right', padding: '10px' }}>₹{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>₹{(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Grand Total: ₹{parseFloat(selectedSale.total_amount || 0).toFixed(2)}</h3>
            </div>
            <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Print Invoice</button>
            <button onClick={() => setShowInvoice(false)} style={{ padding: '10px 20px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
          </Card>
        </div>
      )}

      <Card>
        {loading ? (
          <p>Loading sales...</p>
        ) : sales.length === 0 ? (
          <p>No sales found.</p>
        ) : (
          <Table columns={columns} data={sales} />
        )}
      </Card>
    </Layout>
  );
};

export default ManagerSalesPage;
