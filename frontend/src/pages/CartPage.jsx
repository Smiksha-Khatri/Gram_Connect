import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { BottomNav } from '../components/shared/BottomNav';
import { Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import API from "../api";
const CartPage = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await API.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await axios.delete(`/cart/${productId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

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
        <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-8" data-testid="cart-title">
          Shopping Cart
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-20" data-testid="cart-empty">
            <ShoppingBag className="w-20 h-20 text-[#8D91A8] mx-auto mb-4" />
            <p className="text-lg text-[#5F637A] mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
              data-testid="continue-shopping-button"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.product_id} className="card p-6 flex gap-6" data-testid={`cart-item-${item.product_id}`}>
                  <img
                    src={item.product.images[0] || 'https://images.pexels.com/photos/6808985/pexels-photo-6808985.jpeg?w=200'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#3D405B] mb-1">{item.product.name}</h3>
                    <p className="text-sm text-[#5F637A] mb-2">{item.product.category}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-[#E07A5F]">₹{item.product.price}</span>
                        <span className="text-sm text-[#8D91A8] ml-1">x {item.quantity}</span>
                      </div>
                      <div className="text-lg font-bold text-[#3D405B]">
                        ₹{item.item_total}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.product_id)}
                    className="text-red-500 hover:text-red-700"
                    data-testid={`remove-item-${item.product_id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-xl font-heading font-semibold text-[#3D405B] mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#5F637A]">Subtotal ({cart.items.length} items)</span>
                    <span className="font-semibold text-[#3D405B]" data-testid="cart-subtotal">₹{cart.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5F637A]">Delivery</span>
                    <span className="font-semibold text-[#81B29A]">FREE</span>
                  </div>
                  <div className="border-t border-[#EBE9D7] pt-3 flex justify-between">
                    <span className="text-lg font-semibold text-[#3D405B]">Total</span>
                    <span className="text-2xl font-bold text-[#E07A5F]" data-testid="cart-total">₹{cart.total}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full"
                  data-testid="checkout-button"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default CartPage;
