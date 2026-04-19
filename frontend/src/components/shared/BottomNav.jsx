import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import { Home, Search, ShoppingCart, User } from 'lucide-react';

export const BottomNav = () => {
  const { isCustomer } = useAuth();
  const location = useLocation();

  if (!isCustomer) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bottom-nav">
      <Link
        to="/"
        className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
        data-testid="bottom-nav-home"
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>
      <Link
        to="/products"
        className={`bottom-nav-item ${isActive('/products') ? 'active' : ''}`}
        data-testid="bottom-nav-products"
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </Link>
      <Link
        to="/cart"
        className={`bottom-nav-item ${isActive('/cart') ? 'active' : ''}`}
        data-testid="bottom-nav-cart"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>Cart</span>
      </Link>
      <Link
        to="/customer/dashboard"
        className={`bottom-nav-item ${isActive('/customer/dashboard') ? 'active' : ''}`}
        data-testid="bottom-nav-profile"
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
    </div>
  );
};
