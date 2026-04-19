import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/seller/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/products/${productId}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#3D405B]" data-testid="seller-products-title">
            My Products
          </h1>
          <Link to="/seller/products/new" className="btn-primary" data-testid="add-new-product-button">
            <Plus className="w-5 h-5 inline mr-2" /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center" data-testid="no-products-message">
            <p className="text-lg text-[#5F637A] mb-6">No products yet. Add your first product!</p>
            <Link to="/seller/products/new" className="btn-primary">Add Product</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.product_id} className="card" data-testid={`seller-product-${product.product_id}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images[0] || 'https://images.pexels.com/photos/6808985/pexels-photo-6808985.jpeg?w=500'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#3D405B] mb-1">{product.name}</h3>
                  <p className="text-sm text-[#5F637A] mb-2">{product.category}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-[#E07A5F]">₹{product.price}/{product.unit}</span>
                    <span className="text-sm text-[#5F637A]">Stock: {product.quantity}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      className="flex-1 btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                      data-testid={`delete-product-${product.product_id}`}
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SellerProducts;
