import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  AuthInput, 
  PrimaryButton, 
  TabSwitcher, 
  TechFooter 
} from './AuthComponents';
import useToastStore from '../../store/useToastStore';

// API Base URL - Update this if your backend runs on a different port
const API_URL = '/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Username validation (Register only)
    if (activeTab === 'register') {
      if (!formData.username.trim()) {
        errors.username = 'Username is required';
        isValid = false;
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
        isValid = false;
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation (Register only)
    if (activeTab === 'register') {
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      addToast('Please fix the errors above', 'error');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (activeTab === 'login') {
        // LOGIN REQUEST
        response = await axios.post(`${API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
      } else {
        // REGISTER REQUEST
        response = await axios.post(`${API_URL}/auth/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }

      // Success! Save token and redirect
      const { token } = response.data;
      localStorage.setItem('token', token);

      addToast('Welcome to the Arena! 🎮', 'success');

      // Small delay to show the success toast
      setTimeout(() => {
        navigate('/home');
      }, 500);

    } catch (err) {
      // Extract error message from backend response
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Authentication failed. Please try again.';

      addToast(errorMessage, 'error');

      // Highlight the relevant field if we can determine which one failed
      if (errorMessage.toLowerCase().includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('password')) {
        setFieldErrors(prev => ({ ...prev, password: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('username')) {
        setFieldErrors(prev => ({ ...prev, username: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFieldErrors({});
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4 font-space relative overflow-hidden">
      {/* Scanlines Overlay */}
      <div className="scanlines" />
      
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white glitch-text mb-2">
            BULLS & COWS
          </h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Enter the Arena
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface-dark/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-xl">
          {/* Tab Switcher */}
          <div className="mb-8">
            <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            {/* Username (Register Only) */}
            {activeTab === 'register' && (
              <AuthInput
                label="Username"
                type="text"
                placeholder="Enter your username"
                icon="👤"
                value={formData.username}
                onChange={handleInputChange('username')}
                error={fieldErrors.username}
              />
            )}

            {/* Email */}
            <AuthInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon="✉️"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={fieldErrors.email}
            />

            {/* Password */}
            <AuthInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon="🔒"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={fieldErrors.password}
            />

            {/* Confirm Password (Register Only) */}
            {activeTab === 'register' && (
              <AuthInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                icon="🔐"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={fieldErrors.confirmPassword}
              />
            )}

            {/* Forgot Password Link (Login Only) */}
            {activeTab === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-primary transition-colors uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <PrimaryButton type="submit" loading={loading}>
                {activeTab === 'login' ? '🎮 ENTER ARENA' : '🚀 CREATE ACCOUNT'}
              </PrimaryButton>
            </div>
          </form>

          {/* Terms Text */}
          <p className="mt-6 text-xs text-slate-500 text-center">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>

        {/* Tech Footer */}
        <TechFooter />

        {/* Version Info */}
        <div className="mt-4 text-center">
          <span className="text-xs text-slate-600">v1.0.0 • Built with ⚡</span>
        </div>
      </div>
    </div>
  );
}
