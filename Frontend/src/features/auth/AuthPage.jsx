import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaFolder, FaArrowRight } from 'react-icons/fa';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        navigate('/home');
      } else {
        await register({ 
          username: formData.username,
          email: formData.email, 
          password: formData.password 
        });
        setSuccess('Account created successfully!');
        setTimeout(() => {
          setIsLogin(true);
          setSuccess('');
          setFormData({ username: '', email: '', password: '' });
        }, 2000);
      }
    } catch (err) {
      setError(err.message || `${isLogin ? 'Login' : 'Registration'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo and success message */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Success</h3>
              <p className="text-sm text-gray-300">{success}</p>
            </div>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <FaFolder className="text-primary text-3xl" />
          </div>
          <h1 className="text-3xl font-bold">
            BULLS <span className="text-primary">&</span> COWS
          </h1>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              isLogin
                ? 'bg-primary text-dark-bg'
                : 'bg-dark-card text-gray-400 hover:text-white'
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              !isLogin
                ? 'bg-primary text-dark-bg'
                : 'bg-dark-card text-gray-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Form card */}
        <div className="bg-dark-card rounded-3xl p-8 shadow-2xl border border-dark-border">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field (only for register) */}
            {!isLogin && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  Username *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="username"
                    placeholder="CodeName"
                    value={formData.username}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="user@domain.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Secure Key
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="mt-2 h-1 bg-dark-bg rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    formData.password.length === 0 ? 'w-0' :
                    formData.password.length < 6 ? 'w-1/3 bg-red-500' :
                    formData.password.length < 10 ? 'w-2/3 bg-yellow-500' :
                    'w-full bg-green-500'
                  }`}
                ></div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-dark-bg font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  ENTER ARENA
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Footer text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? 'New player? ' : 'Already a player? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                {isLogin ? 'Register' : 'Log in'}
              </button>
            </p>
          </div>

          {/* Version info */}
          <div className="mt-8 text-center text-xs text-gray-600 uppercase tracking-widest">
            <p>Secure Connection</p>
            <p className="text-primary">SYS.VER.2.0.4</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
