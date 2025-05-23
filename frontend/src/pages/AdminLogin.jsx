import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminLogin = ({ onRoleSet }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, formData);
      
      if (response.data.success) {
        onRoleSet('admin');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 text-slate-700 mb-4">
            <Shield size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Access the admin dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={20} />
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="admin@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login to Admin Panel'
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Default Admin Credentials:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> admin@company.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Please change these credentials in production.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-slate-600 hover:text-slate-700 text-sm font-medium flex items-center justify-center"
          >
            <User className="mr-2" size={16} />
            Employee Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;