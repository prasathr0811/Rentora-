import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Key, Sparkles, HelpCircle } from 'lucide-react';

const Login = () => {
  const { login, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect, { replace: true });
    }
  }, [userInfo, navigate, redirect]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all fields');
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err || 'Failed to login. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // One-Click Fill for Test User
  const fillTestCredentials = () => {
    setEmail('user@rentora.com');
    setPassword('123456');
    toast.success('Credentials filled! Click Login.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Title / Banner */}
        <div className="text-center">
          <span className="inline-flex items-center space-x-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
            <Sparkles size={12} className="mr-1" /> Portfolio Version
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to buy or rent products with Rentora.</p>
        </div>

        {/* Test User Info Box */}
        <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-2xl space-y-3">
          <div className="flex items-center text-primary-800 text-xs font-bold uppercase tracking-wide">
            <HelpCircle size={14} className="mr-1.5" /> Quick Testing Credentials
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Use this pre-seeded account to instantly explore orders, rentals, PDF receipt generation, and emails.
          </p>
          <button
            onClick={fillTestCredentials}
            className="w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-sm shadow-primary-500/10"
          >
            Auto-Fill Test Account
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              placeholder="e.g. user@rentora.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
