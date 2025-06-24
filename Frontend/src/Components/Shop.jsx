import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import './Shop.css';

// Fallback products data
const fallbackProducts = [
  {
    _id: '1',
    name: 'Premium Navel Oranges',
    description: 'Sweet and juicy navel oranges, perfect for fresh juice',
    price: 249,
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    _id: '2',
    name: 'Organic Valencia Oranges',
    description: 'Organic valencia oranges, grown with care',
    price: 299,
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    _id: '3',
    name: 'Blood Oranges',
    description: 'Unique blood oranges with a distinct flavor',
    price: 329,
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    _id: '4',
    name: 'Family Combo Pack',
    description: 'Perfect for families, includes variety of oranges',
    price: 499,
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    _id: '5',
    name: 'Mixed Variety Pack',
    description: 'A mix of different orange varieties',
    price: 429,
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.warn('Using fallback products due to API error:', err.message);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Our Products</h1>
        <p>Fresh and organic oranges, delivered to your doorstep</p>
      </div>
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>Note: Using sample products as the server is not available</p>
        </div>
      )}
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-price">₹{product.price}</div>
              <button 
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                <i className="fas fa-shopping-cart"></i>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop; 