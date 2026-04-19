import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { BottomNav } from '../components/shared/BottomNav';
import { useAuth } from '../App';
import { ShoppingCart, Leaf, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useCallback } from "react";
const ProductDetailPage = () => {
  const { productId } = useParams();
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProductDetails = useCallback(async () => {
    try {
      const productRes = await axios.get(`${API}/products/${productId}`);
      setProduct(productRes.data);
      
      const sellerRes = await axios.get(`${API}/seller/store/${productRes.data.seller_id}`);
      setSeller(sellerRes.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  },[productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);
  
  const handleAddToCart = async () => {
    if (!isCustomer) {
      toast.error('Please login as customer to add to cart');
      navigate('/login');
      return;
    }

    try {
      await axios.post('/cart/add', {
        product_id: productId,
        quantity: quantity
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
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

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="section-padding text-center">
          <p className="text-lg text-[#5F637A]">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden mb-4">
              <img
                src={product.images[0] || 'https://images.pexels.com/photos/6808985/pexels-photo-6808985.jpeg?w=800'}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-detail-image"
              />
            </div>
          </div>

          <div>
            {product.organic_certified && (
              <span className="badge-organic mb-4 inline-flex items-center">
                <Leaf className="w-4 h-4 mr-1" /> Certified Organic
              </span>
            )}
            <h1 className="text-4xl font-heading font-bold text-[#3D405B] mb-4" data-testid="product-detail-name">
              {product.name}
            </h1>
            <p className="text-[#5F637A] mb-6 leading-relaxed">{product.description}</p>
            
            <div className="bg-[#F4F1DE] rounded-xl p-6 mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-[#E07A5F]" data-testid="product-detail-price">₹{product.price}</span>
                <span className="text-lg text-[#5F637A] ml-2">per {product.unit}</span>
              </div>
              <p className="text-sm text-[#5F637A]">Category: {product.category}</p>
              <p className="text-sm text-[#5F637A]">Available: {product.quantity} {product.unit}</p>
            </div>

            {isCustomer && (
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#3D405B] mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="input-field w-24"
                    data-testid="product-quantity-input"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex items-center mt-6"
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {seller && (
          <div className="bg-white rounded-2xl p-8 border-l-4 border-[#E07A5F]" data-testid="farmer-story-section">
            <h2 className="text-3xl font-heading font-semibold text-[#3D405B] mb-6">
              Meet the Farmer
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <img
                  src={seller.profile_image || 'https://images.unsplash.com/photo-1594179131702-112ff2a880e4?w=400'}
                  alt={seller.village_name}
                  className="w-full aspect-square rounded-xl object-cover mb-4"
                />
                <div className="flex items-center text-[#5F637A] mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{seller.village_name}, {seller.state}</span>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="story-card mb-6">
                  <p className="text-lg leading-relaxed">"{seller.story}"</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#3D405B] mb-2">Farming Practices</h3>
                    <p className="text-[#5F637A]">{seller.farming_practices}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-[#3D405B] mb-2">Family Background</h3>
                    <p className="text-[#5F637A]">{seller.family_background}</p>
                  </div>
                </div>

                <Link
                  to={`/store/${seller.store_url}`}
                  className="btn-secondary mt-6 inline-block"
                  data-testid="visit-store-button"
                >
                  Visit Store
                </Link>
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

export default ProductDetailPage;
