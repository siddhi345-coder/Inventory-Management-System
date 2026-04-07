import { useState, useEffect, useContext } from "react";
import { getAllProducts } from "../../services/salesService";
import { CartContext } from "../../context/CartContext";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product) => {
    const normalizedProduct = {
      ...product,
      id: product.id || product._id,
      price: product.price ?? product.selling_price ?? 0,
      stock: product.stock ?? product.stock_quantity ?? 0,
    };

    addToCart(normalizedProduct, 1);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-table-container">
      <div className="table-header">
        <h3>Available Products</h3>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="no-data">No products found</p>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const price = Number(product.price ?? product.selling_price ?? 0);
              const stock = Number(product.stock ?? product.stock_quantity ?? 0);
              return (
                <tr key={product.id || product._id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>₹{Number.isNaN(price) ? "0.00" : price.toFixed(2)}</td>
                  <td>
                    <span className={stock > 0 ? "in-stock" : "out-stock"}>
                      {stock}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="add-btn"
                      disabled={stock === 0}
                    >
                      Add to Cart
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
