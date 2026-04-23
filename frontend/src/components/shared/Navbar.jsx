import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  ShoppingCart,
  Menu,
  X,
  Heart,
  ShoppingBasket,
  LogOut,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isCustomer, isSeller } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate('/');
  };

  const dashboardPath = isCustomer
    ? '/customer/dashboard'
    : isSeller
    ? '/seller/dashboard'
    : '/admin/dashboard';

  return (
    <nav className="bg-white border-b border-[#EBE9D7] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-2"
            data-testid="nav-logo"
            onClick={closeMobileMenu}
          >
            <ShoppingBasket className="w-8 h-8 text-[#E07A5F]" />
            <span className="text-2xl font-heading font-bold text-[#3D405B]">
              Gram Connect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/products"
              className="text-[#3D405B] hover:text-[#E07A5F] font-medium"
              data-testid="nav-products"
            >
              Products
            </Link>

            {isAuthenticated ? (
              <>
                {isCustomer && (
                  <>
                    <Link
                      to="/wishlist"
                      className="text-[#3D405B] hover:text-[#E07A5F]"
                      data-testid="nav-wishlist"
                      aria-label="Wishlist"
                    >
                      <Heart className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/cart"
                      className="text-[#3D405B] hover:text-[#E07A5F]"
                      data-testid="nav-cart"
                      aria-label="Cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#5F637A]">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-[#E07A5F] hover:text-[#D0694E]"
                    data-testid="nav-logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                <Link
                  to={dashboardPath}
                  className="btn-primary"
                  data-testid="nav-dashboard"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#3D405B] hover:text-[#E07A5F] font-medium"
                  data-testid="nav-login"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                  data-testid="nav-register"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#3D405B]"
            data-testid="mobile-menu-button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden bg-white border-t border-[#EBE9D7] pb-4"
          data-testid="mobile-menu"
        >
          <div className="px-4 pt-4 space-y-3">
            <Link
              to="/products"
              onClick={closeMobileMenu}
              className="block text-[#3D405B] hover:text-[#E07A5F] font-medium py-2"
            >
              Products
            </Link>
            {isAuthenticated ? (
              <>
                {isCustomer && (
                  <>
                    <Link
                      to="/wishlist"
                      onClick={closeMobileMenu}
                      className="block text-[#3D405B] hover:text-[#E07A5F] font-medium py-2"
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/cart"
                      onClick={closeMobileMenu}
                      className="block text-[#3D405B] hover:text-[#E07A5F] font-medium py-2"
                    >
                      Cart
                    </Link>
                  </>
                )}
                <Link
                  to={dashboardPath}
                  onClick={closeMobileMenu}
                  className="block text-[#3D405B] hover:text-[#E07A5F] font-medium py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-[#E07A5F] hover:text-[#D0694E] font-medium py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block text-[#3D405B] hover:text-[#E07A5F] font-medium py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block btn-primary text-center py-2"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
