import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { BottomNav } from '../components/shared/BottomNav';
import { Package, ShoppingBag } from 'lucide-react';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-8" data-testid="customer-dashboard-title">
          My Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/cart" className="card p-6 hover:shadow-lg transition-shadow" data-testid="goto-cart">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#E07A5F]/10 rounded-full flex items-center justify-center mr-4">
                <ShoppingBag className="w-6 h-6 text-[#E07A5F]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#3D405B]">Shopping Cart</h3>
                <p className="text-sm text-[#5F637A]">View your cart</p>
              </div>
            </div>
          </Link>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#81B29A]/10 rounded-full flex items-center justify-center mr-4">
                <Package className="w-6 h-6 text-[#81B29A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#3D405B]">Total Orders</h3>
                <p className="text-2xl font-bold text-[#E07A5F]" data-testid="total-orders-count">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-2xl font-heading font-semibold text-[#3D405B] mb-6">My Orders</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10" data-testid="no-orders-message">
              <Package className="w-16 h-16 text-[#8D91A8] mx-auto mb-4" />
              <p className="text-[#5F637A] mb-4">No orders yet</p>
              <Link to="/products" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_id} className="border border-[#EBE9D7] rounded-lg p-4" data-testid={`order-${order.order_id}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-[#5F637A]">Order #{order.order_id.substring(0, 8)}</p>
                      <p className="text-xs text-[#8D91A8]">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-[#3D405B] font-medium">{item.product_name}</span>
                        <span className="text-[#8D91A8] ml-2">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-[#EBE9D7]">
                    <span className="text-sm text-[#5F637A]">Total</span>
                    <span className="text-lg font-bold text-[#E07A5F]">₹{order.total_amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default CustomerDashboard;
