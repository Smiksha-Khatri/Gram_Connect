import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { BottomNav } from '../components/shared/BottomNav';
import { Search, Leaf } from 'lucide-react';
import { useCallback } from "react";
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    organic: null,
    minPrice: '',
    maxPrice: '',
    village: ''
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.organic !== null) params.organic = filters.organic;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.village) params.village = filters.village;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get(`${API}/products`, { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  },[filters.category, filters.maxPrice, filters.minPrice, filters.organic, filters.village, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };
  
useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="section-padding">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8D91A8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full"
              placeholder="Search for organic products..."
              data-testid="products-search-input"
            />
          </div>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input-field"
            data-testid="products-category-filter"
          >
            <option value="">All Categories</option>
            <option value="Spices">Spices</option>
            <option value="Grains">Grains</option>
            <option value="Pulses">Pulses</option>
          </select>

          <select
            value={filters.organic === null ? '' : filters.organic}
            onChange={(e) => setFilters({ ...filters, organic: e.target.value === '' ? null : e.target.value === 'true' })}
            className="input-field"
            data-testid="products-organic-filter"
          >
            <option value="">All Products</option>
            <option value="true">Organic Only</option>
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="input-field"
            data-testid="products-min-price"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="input-field"
            data-testid="products-max-price"
          />

          <input
            type="text"
            placeholder="Village"
            value={filters.village}
            onChange={(e) => setFilters({ ...filters, village: e.target.value })}
            className="input-field"
            data-testid="products-village"
          />
        </div>

        <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-6" data-testid="products-title">
          All Products ({products.length})
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20" data-testid="products-empty">
            <p className="text-lg text-[#5F637A]">No products found.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <Link
                key={product.product_id}
                to={`/products/${product.product_id}`}
                className="product-card group"
                data-testid={`product-card-${product.product_id}`}
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
                    <div>
                      <span className="text-2xl font-bold text-[#E07A5F]">₹{product.price}</span>
                      <span className="text-sm text-[#8D91A8] ml-1">/{product.unit}</span>
                    </div>
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

export default ProductsPage;
