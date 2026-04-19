import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';
import { useCallback } from "react";
const API = process.env.REACT_APP_API_URL;
const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error, isLoading, Razorpay } = useRazorpay();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || ''
  });
  const [processing, setProcessing] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/cart`);
      setCart(response.data);
      if (response.data.items.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [navigate]);

useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
      toast.error('Please fill all address fields');
      return;
    }

    setProcessing(true);

    try {
      const orderItems = cart.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        seller_id: item.product.seller_id
      }));

      const orderData = {
        items: orderItems,
        total_amount: cart.total,
        shipping_address: address,
        customer_phone: address.phone
      };

      const response = await axios.post(`${API}/orders/create-razorpay-order`, orderData);
      const { razorpay_order_id, amount, currency, key_id } = response.data;

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'Gram Connect',
        description: 'Order Payment',
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API}/orders/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Order placed successfully!');
            navigate('/orders');
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.phone
        },
        theme: {
          color: '#E07A5F'
        }
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-8" data-testid="checkout-title">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-heading font-semibold text-[#3D405B] mb-4">Delivery Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D405B] mb-2">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="input-field w-full"
                    placeholder="House no, Street name"
                    data-testid="checkout-street-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D405B] mb-2">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="input-field w-full"
                      data-testid="checkout-city-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D405B] mb-2">State</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="input-field w-full"
                      data-testid="checkout-state-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3D405B] mb-2">Pincode</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="input-field w-full"
                      data-testid="checkout-pincode-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3D405B] mb-2">Phone</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="input-field w-full"
                      data-testid="checkout-phone-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-heading font-semibold text-[#3D405B] mb-4">Order Items</h2>
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-[#3D405B]">{item.product.name}</p>
                      <p className="text-sm text-[#5F637A]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-[#E07A5F]">₹{item.item_total}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-heading font-semibold text-[#3D405B] mb-4">Payment Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#5F637A]">Subtotal</span>
                  <span className="font-semibold text-[#3D405B]">₹{cart.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F637A]">Delivery</span>
                  <span className="font-semibold text-[#81B29A]">FREE</span>
                </div>
                <div className="border-t border-[#EBE9D7] pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-[#3D405B]">Total</span>
                  <span className="text-2xl font-bold text-[#E07A5F]" data-testid="checkout-total">₹{cart.total}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="btn-primary w-full disabled:opacity-50"
                data-testid="place-order-button"
              >
                {processing ? 'Processing...' : 'Place Order & Pay'}
              </button>

              <p className="text-xs text-[#8D91A8] mt-4 text-center">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
