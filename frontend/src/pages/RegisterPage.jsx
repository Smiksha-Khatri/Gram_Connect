import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Navbar } from '../components/shared/Navbar';
import { Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/register', formData);
      const { access_token, user } = response.data;

      login(access_token, user);
      toast.success('Account created successfully!');

      if (user.role === 'customer') {
        navigate('/products');
      } else if (user.role === 'seller') {
        navigate('/seller/store-setup');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Registration failed. Please try again.'
      );
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="section-padding">
        <div className="max-w-md mx-auto">
          <div className="card p-8">
            <h1
              className="text-3xl font-heading font-bold text-[#3D405B] mb-2 text-center"
              data-testid="register-title"
            >
              Join Gram Connect
            </h1>
            <p className="text-[#5F637A] text-center mb-8">
              Create your account
            </p>

            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start"
                data-testid="register-error"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: 'customer' })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'customer'
                        ? 'border-[#E07A5F] bg-[#E07A5F]/5'
                        : 'border-[#EBE9D7] hover:border-[#E07A5F]/50'
                    }`}
                    data-testid="register-role-customer"
                  >
                    <div className="font-semibold text-[#3D405B]">Buy</div>
                    <div className="text-xs text-[#5F637A]">As Customer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: 'seller' })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'seller'
                        ? 'border-[#E07A5F] bg-[#E07A5F]/5'
                        : 'border-[#EBE9D7] hover:border-[#E07A5F]/50'
                    }`}
                    data-testid="register-role-seller"
                  >
                    <div className="font-semibold text-[#3D405B]">Sell</div>
                    <div className="text-xs text-[#5F637A]">As Farmer</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8D91A8] pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="Your name"
                    required
                    data-testid="register-name-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8D91A8] pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="your@email.com"
                    required
                    data-testid="register-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8D91A8] pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="+91 9876543210"
                    data-testid="register-phone-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8D91A8] pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="••••••••"
                    required
                    data-testid="register-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="register-submit-button"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#5F637A]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#E07A5F] hover:text-[#D0694E] font-semibold"
                data-testid="register-login-link"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
