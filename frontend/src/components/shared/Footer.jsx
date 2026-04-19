import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#3D405B] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBasket className="w-8 h-8 text-[#E07A5F]" />
              <span className="text-2xl font-heading font-bold">Gram Connect</span>
            </div>
            <p className="text-sm text-gray-300">
              Connecting villages to the world. Supporting organic farming and empowering rural communities.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-[#F2CC8F]">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/products" className="hover:text-[#E07A5F]">All Products</Link></li>
              <li><Link to="/products?category=spices" className="hover:text-[#E07A5F]">Spices</Link></li>
              <li><Link to="/products?category=grains" className="hover:text-[#E07A5F]">Grains</Link></li>
              <li><Link to="/products?organic=true" className="hover:text-[#E07A5F]">Organic Certified</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-[#F2CC8F]">For Sellers</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/register" className="hover:text-[#E07A5F]">Join as Seller</Link></li>
              <li><Link to="/seller/dashboard" className="hover:text-[#E07A5F]">Seller Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-[#F2CC8F]">About</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#mission" className="hover:text-[#E07A5F]">Our Mission</a></li>
              <li><a href="#impact" className="hover:text-[#E07A5F]">Impact</a></li>
              <li><a href="#contact" className="hover:text-[#E07A5F]">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Gram Connect. Empowering villages, one product at a time.</p>
        </div>
      </div>
    </footer>
  );
};
