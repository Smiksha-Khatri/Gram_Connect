import React from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="section-padding">
        <h1 className="text-3xl font-heading font-bold text-[#3D405B] mb-8">Admin Dashboard</h1>
        <p className="text-[#5F637A]">Admin features coming soon!</p>
      </div>
      <Footer />
    </div>
  );
};
console.log(process.env.REACT_APP_API_URL);
export default AdminDashboard;
