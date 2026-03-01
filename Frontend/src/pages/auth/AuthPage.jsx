/**
 * AuthPage - Login/Register Page
 * 
 * Handles user authentication with:
 * - Email/password login
 * - User registration
 * - Form validation
 * - Error handling
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  AuthInput, 
  PrimaryButton, 
  TabSwitcher, 
  TechFooter 
} from './AuthComponents';
import useToastStore from '../../store/useToastStore';

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
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (activeTab === 'register') {
      if (!formData.username.trim()) {
        errors.username = 'Username is required';
        isValid = false;
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
        isValid = false;
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

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

    if (!validateForm()) {
      addToast('Please fix the errors above', 'error');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (activeTab === 'login') {
        response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });
      } else {
        response = await api.post('/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }

      // Backend returns accessToken, not token
      const { accessToken } = response.data;
      
      // Validate token before storing
      if (!accessToken || typeof accessToken !== 'string' || !accessToken.startsWith('eyJ')) {
        console.error('Token validation failed:', { accessToken, responseData: response.data });
        throw new Error('Invalid token received from server');
      }
      
      localStorage.setItem('token', accessToken);

      addToast('Welcome to the Arena! 🎮', 'success');

      setTimeout(() => {
        navigate('/home');
      }, 500);

    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Authentication failed. Please try again.';

      addToast(errorMessage, 'error');

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
          <h1 className="text-4xl md:text-5xl font-bold glitch-text mb-3 tracking-tight">
            <span className="text-white">BULLS</span>
            <span className="text-primary mx-2">&</span>
            <span className="text-white">COWS</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Enter the Arena
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface-dark/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="mb-7">
            <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          <form onSubmit={handleAuth} className="space-y-7">
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

            <AuthInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon="✉️"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={fieldErrors.email}
            />

            <div>
              <AuthInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon="🔒"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={fieldErrors.password}
              />
              {activeTab === 'login' && (
                <button
                  type="button"
                  className="text-[11px] text-blue-400 hover:text-primary transition-colors tracking-wide mt-1 ml-1"
                >
                  Forgot your password?
                </button>
              )}
            </div>

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

            <div className="pt-2">
              <PrimaryButton type="submit" loading={loading}>
                {activeTab === 'login' ? '🎮 ENTER ARENA' : '🚀 CREATE ACCOUNT'}
              </PrimaryButton>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={() => {/* TODO: Google OAuth logic */}}
            className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl
              bg-white/5 border border-slate-600 text-slate-200 font-semibold text-sm
              hover:bg-white/10 hover:border-slate-500 transition-all duration-200
              active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <TechFooter />

      </div>
    </div>
  );
}
