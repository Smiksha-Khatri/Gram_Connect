import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Package, ShoppingBag, Plus, Store } from 'lucide-react';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('/seller/products'),
        axios.get('/orders')
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);

      try {
        const storeRes = await axios.get('/seller/my-store');
        setStore(storeRes.data);
      } catch (error) {
        console.log('No store found');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => {
    const orderTotal = order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    return sum + orderTotal;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-8" data-testid="seller-dashboard-title">
          Seller Dashboard
        </h1>

        {!store && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8" data-testid="setup-store-prompt">
            <h3 className="font-semibold text-yellow-800 mb-2">Setup Your Store</h3>
            <p className="text-yellow-700 mb-4">Complete your store setup to start selling</p>
            <Link to="/seller/store-setup" className="btn-primary" data-testid="setup-store-button">
              Setup Store Now
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#E07A5F]/10 rounded-full flex items-center justify-center mr-4">
                <ShoppingBag className="w-6 h-6 text-[#E07A5F]" />
              </div>
              <div>
                <h3 className="text-sm text-[#5F637A]">Total Products</h3>
                <p className="text-2xl font-bold text-[#3D405B]" data-testid="total-products-count">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#81B29A]/10 rounded-full flex items-center justify-center mr-4">
                <Package className="w-6 h-6 text-[#81B29A]" />
              </div>
              <div>
                <h3 className="text-sm text-[#5F637A]">Total Orders</h3>
                <p className="text-2xl font-bold text-[#3D405B]" data-testid="total-orders-count">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#F2CC8F]/20 rounded-full flex items-center justify-center mr-4">
                <Store className="w-6 h-6 text-[#5F4B3B]" />
              </div>
              <div>
                <h3 className="text-sm text-[#5F637A]">Total Revenue</h3>
                <p className="text-2xl font-bold text-[#E07A5F]" data-testid="total-revenue">₹{totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-heading font-semibold text-[#3D405B]">My Products</h2>
              <Link to="/seller/products/new" className="btn-secondary" data-testid="add-product-button">
                <Plus className="w-4 h-4 inline mr-1" /> Add Product
              </Link>
            </div>
            
            {products.length === 0 ? (
              <p className="text-[#5F637A] text-center py-6" data-testid="no-products-message">No products yet. Add your first product!</p>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <div key={product.product_id} className="flex items-center border-b border-[#EBE9D7] pb-3" data-testid={`product-${product.product_id}`}>
                    <img
                      src={product.images[0] || 'https://images.pexels.com/photos/6808985/pexels-photo-6808985.jpeg?w=100'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-[#3D405B]">{product.name}</p>
                      <p className="text-sm text-[#5F637A]">Stock: {product.quantity}</p>
                    </div>
                    <p className="font-bold text-[#E07A5F]">₹{product.price}</p>
                  </div>
                ))}
                <Link to="/seller/products" className="block text-center text-[#E07A5F] hover:text-[#D0694E] font-medium mt-4">
                  View All Products
                </Link>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-heading font-semibold text-[#3D405B] mb-4">Recent Orders</h2>
            
            {orders.length === 0 ? (
              <p className="text-[#5F637A] text-center py-6" data-testid="no-orders-message">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.order_id} className="border-b border-[#EBE9D7] pb-3" data-testid={`order-${order.order_id}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-[#3D405B]">Order #{order.order_id.substring(0, 8)}</p>
                        <p className="text-xs text-[#8D91A8]">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#81B29A]">{order.status}</span>
                    </div>
                    <p className="text-sm text-[#5F637A]">{order.items.length} item(s)</p>
                  </div>
                ))}
                <Link to="/seller/orders" className="block text-center text-[#E07A5F] hover:text-[#D0694E] font-medium mt-4">
                  View All Orders
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
