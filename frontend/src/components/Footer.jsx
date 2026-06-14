import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Shield, Zap, Sparkles } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error('Please enter an email address');
    }
    setLoading(true);
    try {
      const { data } = await API.post('/newsletter', { email });
      toast.success(data.message || 'Subscribed successfully!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      
      {/* Upper Footer: Newsletter & Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-850">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-2">Subscribe to our Rentora Weekly</h3>
            <p className="text-sm text-slate-400">Get the latest listings, promotional discounts, and exclusive rental guides directly in your inbox.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-l-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-500 text-white font-semibold px-6 py-3 rounded-r-lg text-sm transition-colors"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
              RENTORA
            </span>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Rentora is a premier unified marketplace offering seamless options to buy outright or rent on flexible daily tenures. Supercharging asset ownership efficiency.
            </p>
            <div className="flex space-x-4 mt-6">
              <Shield size={20} className="hover:text-primary-400 cursor-pointer transition-colors" title="Safe checkout" />
              <Zap size={20} className="hover:text-primary-400 cursor-pointer transition-colors" title="Instant approvals" />
              <Sparkles size={20} className="hover:text-primary-400 cursor-pointer transition-colors" title="Insured assets" />
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=Vehicles" className="hover:text-white transition-colors">Vehicles</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Furniture" className="hover:text-white transition-colors">Furniture</Link></li>
              <li><Link to="/products?category=Tools%20%26%20Machinery" className="hover:text-white transition-colors">Tools & Machinery</Link></li>
              <li><Link to="/products?category=Event%20Equipment" className="hover:text-white transition-colors">Event Equipment</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">Browse Marketplace</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">User Profile</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
              <li><Link to="/rentals" className="hover:text-white transition-colors">Rental Returns</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Contact Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <MapPin size={16} className="text-primary-500 mr-2 flex-shrink-0" />
                <span>100 SaaS Boulevard, Bangalore, KA, India</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="text-primary-500 mr-2 flex-shrink-0" />
                <span>+91 80 4390 1289</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="text-primary-500 mr-2 flex-shrink-0" />
                <span>support@rentora.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Lower Footer Details */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-xs">
          <p>&copy; 2026 Rentora Marketplace. Constructed for professional portfolio display purposes. Built using React, Tailwind & Node.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
