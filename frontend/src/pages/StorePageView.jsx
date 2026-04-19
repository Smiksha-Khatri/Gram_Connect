import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { BottomNav } from '../components/shared/BottomNav';
import { MapPin, Leaf } from 'lucide-react';
import { useCallback } from "react";
const StorePageView = () => {
  const { storeUrl } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStoreData = useCallback(async () => {
    try {
      const storeRes = await axios.get(`${API}/seller/store-url/${storeUrl}`);
      setStore(storeRes.data);

      const productsRes = await axios.get(`${API}/products`);
      const storeProducts = productsRes.data.filter(p => p.seller_id === storeRes.data.seller_id);
      setProducts(storeProducts);
    } catch (error) {
      console.error('Error fetching store:', error);
    } finally {
      setLoading(false);
    }
  }, [storeUrl]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);
  
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

  if (!store) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="section-padding text-center">
          <p className="text-lg text-[#5F637A]">Store not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <div className="bg-white rounded-2xl p-8 mb-12 border-l-4 border-[#E07A5F]" data-testid="store-info">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img
                src={store.profile_image || 'https://images.unsplash.com/photo-1594179131702-112ff2a880e4?w=400'}
                alt={store.village_name}
                className="w-full aspect-square rounded-xl object-cover mb-4"
              />
            </div>
            
            <div className="md:col-span-2">
              <h1 className="text-4xl font-heading font-bold text-[#3D405B] mb-4" data-testid="store-title">
                {store.village_name}
              </h1>
              <div className="flex items-center text-[#5F637A] mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{store.village_name}, {store.state}</span>
              </div>
              
              <div className="story-card mb-6">
                <p className="text-lg leading-relaxed">"{store.story}"</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#3D405B] mb-2">Farming Practices</h3>
                  <p className="text-[#5F637A]">{store.farming_practices}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-[#3D405B] mb-2">Family Background</h3>
                  <p className="text-[#5F637A]">{store.family_background}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-heading font-semibold text-[#3D405B] mb-6">Products from this Store</h2>
        
        {products.length === 0 ? (
          <p className="text-[#5F637A] text-center py-10" data-testid="no-store-products">No products available</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <Link
                key={product.product_id}
                to={`/products/${product.product_id}`}
                className="product-card group"
                data-testid={`store-product-${product.product_id}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images[0] || 'https://images.pexels.com/photos/6808985/pexels-photo-6808985.jpeg?w=500'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  {product.organic_certified && (
                    <span className="badge-organic mb-2 inline-flex items-center">
                      <Leaf className="w-3 h-3 mr-1" /> Organic
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-[#3D405B] mb-1">{product.name}</h3>
                  <p className="text-sm text-[#5F637A] mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-[#E07A5F]">₹{product.price}</span>
                    <span className="text-sm text-[#8D91A8]">/{product.unit}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default StorePageView;
