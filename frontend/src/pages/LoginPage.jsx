import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import { Navbar } from '../components/shared/Navbar';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', { email, password });
      const { access_token, user } = response.data;

      login(access_token, user);
      toast.success('Login successful!');

      if (user.role === 'customer') {
        navigate('/products');
      } else if (user.role === 'seller') {
        navigate('/seller/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Login failed. Please check your credentials.'
      );
      toast.error('Login failed');
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
              data-testid="login-title"
            >
              Welcome Back
            </h1>
            <p className="text-[#5F637A] text-center mb-8">
              Login to Gram Connect
            </p>

            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start"
                data-testid="login-error"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#3D405B] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8D91A8] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full pl-10"
                    placeholder="your@email.com"
                    required
                    data-testid="login-email-input"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full pl-10"
                    placeholder="••••••••"
                    required
                    data-testid="login-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="login-submit-button"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#5F637A]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#E07A5F] hover:text-[#D0694E] font-semibold"
                data-testid="login-register-link"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
