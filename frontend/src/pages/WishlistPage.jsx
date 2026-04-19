import React from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { BottomNav } from '../components/shared/BottomNav';

const WishlistPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="section-padding">
        <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-8">Wishlist</h1>
        <p className="text-[#5F637A]">Wishlist feature coming soon!</p>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default WishlistPage;
