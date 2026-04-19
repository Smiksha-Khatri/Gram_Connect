import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { BottomNav } from '../components/shared/BottomNav';
import { Leaf, Heart, Truck, Users, ArrowRight, CheckCircle, Star } from 'lucide-react';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredFarmers, setFeaturedFarmers] = useState([]);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      const [productsRes, farmersRes] = await Promise.all([
        axios.get('/featured/products'),
        axios.get('/featured/farmers')
      ]);
      setFeaturedProducts(productsRes.data.slice(0, 4));
      setFeaturedFarmers(farmersRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching featured content:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section
        className="relative h-[70vh] md:h-[80vh] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/20445181/pexels-photo-20445181.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800')`
        }}
      >
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 leading-tight" data-testid="hero-title">
            Farm Fresh to Your Doorstep
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
            Connect directly with farmers. Buy authentic organic products. Support rural communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="btn-primary inline-flex items-center justify-center" data-testid="hero-shop-now">
              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-outline bg-white/10 backdrop-blur-sm hover:bg-white inline-flex items-center justify-center" data-testid="hero-become-seller">
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-white" id="mission">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-heading font-semibold text-[#3D405B] mb-4">
            Our Mission
          </h2>
          <p className="text-lg text-[#5F637A] max-w-3xl mx-auto">
            Empowering rural farmers by connecting them directly with conscious consumers, 
            eliminating middlemen, and ensuring fair prices for authentic organic products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 card-hover-gradient rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#81B29A]/10 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-[#81B29A]" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-[#3D405B] mb-2">100% Organic</h3>
            <p className="text-[#5F637A]">Certified organic products straight from village farms</p>
          </div>

          <div className="text-center p-6 card-hover-gradient rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E07A5F]/10 rounded-full mb-4">
              <Heart className="w-8 h-8 text-[#E07A5F]" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-[#3D405B] mb-2">Fair Trade</h3>
            <p className="text-[#5F637A]">Direct connections ensure farmers get what they deserve</p>
          </div>

          <div className="text-center p-6 card-hover-gradient rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F2CC8F]/20 rounded-full mb-4">
              <Truck className="w-8 h-8 text-[#5F4B3B]" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-[#3D405B] mb-2">Fast Delivery</h3>
            <p className="text-[#5F637A]">Fresh products delivered to your home within days</p>
          </div>
        </div>
      </section>

      {/* Featured Farmers */}
      {featuredFarmers.length > 0 && (
        <section className="section-padding bg-[#F4F1DE]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-heading font-semibold text-[#3D405B] mb-4">
              Meet Our Farmers
            </h2>
            <p className="text-lg text-[#5F637A]">The real heroes behind your food</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredFarmers.map((farmer) => (
              <Link
                key={farmer.store_id}
                to={`/store/${farmer.store_url}`}
                className="card group cursor-pointer"
                data-testid={`featured-farmer-${farmer.store_url}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={farmer.profile_image || 'https://images.unsplash.com/photo-1594179131702-112ff2a880e4?w=500'}
                    alt={farmer.village_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  {farmer.verified && (
                    <span className="badge-verified mb-2">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  <h3 className="text-xl font-heading font-semibold text-[#3D405B] mb-2">
                    {farmer.village_name}
                  </h3>
                  <p className="text-sm text-[#5F637A] mb-2">{farmer.state}</p>
                  <p className="text-sm text-[#3D405B] line-clamp-2 italic font-serif">
                    "{farmer.story.substring(0, 100)}..."
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section-padding bg-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-heading font-semibold text-[#3D405B] mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-[#5F637A]">Certified organic, fresh from farms</p>
          </div>

          <div className="products-grid">
            {featuredProducts.map((product) => (
              <Link
                key={product.product_id}
                to={`/products/${product.product_id}`}
                className="product-card group"
                data-testid={`featured-product-${product.product_id}`}
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
                    <span className="badge-organic mb-2">Organic</span>
                  )}
                  <h3 className="text-lg font-semibold text-[#3D405B] mb-1">{product.name}</h3>
                  <p className="text-sm text-[#5F637A] mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#E07A5F]">₹{product.price}</span>
                    <span className="text-sm text-[#8D91A8]">/{product.unit}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary" data-testid="view-all-products">
              View All Products
            </Link>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="section-padding bg-[#F4F1DE]" id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-heading font-semibold text-[#3D405B] mb-4">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: 1, title: 'Browse Products', desc: 'Explore authentic organic products from verified farmers' },
            { step: 2, title: 'Meet the Farmer', desc: 'Learn about the farmer, their village, and farming practices' },
            { step: 3, title: 'Place Order', desc: 'Add to cart and checkout securely with Razorpay' },
            { step: 4, title: 'Get Delivered', desc: 'Receive fresh products at your doorstep' }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E07A5F] text-white rounded-full text-2xl font-bold mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-[#3D405B] mb-2">{item.title}</h3>
              <p className="text-sm text-[#5F637A]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="section-padding bg-white" id="impact">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-heading font-semibold text-[#3D405B] mb-4">
            Our Impact
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[#E07A5F] mb-2">500+</div>
            <div className="text-[#5F637A]">Farmers Connected</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[#81B29A] mb-2">10K+</div>
            <div className="text-[#5F637A]">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[#F2CC8F] mb-2">200+</div>
            <div className="text-[#5F637A]">Villages Covered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[#5F4B3B] mb-2">100%</div>
            <div className="text-[#5F637A]">Organic Certified</div>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default HomePage;
