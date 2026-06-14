import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { GridSkeleton } from '../components/SkeletonLoader';
import { Search, Shield, Zap, Sparkles, RefreshCw, Layers, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await API.get('/products?pageSize=8&sortBy=mostPopular');
        setFeaturedProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load featured products:', err);
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword)}`);
    } else {
      navigate('/products');
    }
  };

  const categories = [
    { name: 'Vehicles', count: '80+ items', color: 'from-blue-500 to-indigo-500', icon: '🚗' },
    { name: 'Electronics', count: '50+ items', color: 'from-purple-500 to-pink-500', icon: '💻' },
    { name: 'Furniture', count: '40+ items', color: 'from-orange-500 to-amber-500', icon: '🛋️' },
    { name: 'Tools & Machinery', count: '50+ items', color: 'from-emerald-500 to-teal-500', icon: '🛠️' },
    { name: 'Event Equipment', count: '30+ items', color: 'from-rose-500 to-red-500', icon: '🔊' },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#3b82f6,transparent_45%)] opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#8b5cf6,transparent_50%)] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
          
          <span className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-primary-300 border border-white/10 uppercase">
            <Sparkles size={14} className="mr-1 animate-pulse" /> Unified Buy & Rental Marketplace
          </span>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none max-w-4xl bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Why Buy when you can <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">Rent</span>? Or Do Both!
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Rentora gives you the power to purchase brand-new products outright OR lease them on affordable, daily rental budgets with instant deposits return.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl flex flex-col sm:flex-row items-center bg-white p-2 rounded-2xl shadow-2xl gap-2 mt-4">
            <div className="flex items-center w-full px-3 text-slate-800">
              <Search className="text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for today? Try 'MacBook', 'Creta', 'Drill'..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 text-sm focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md shadow-primary-500/20"
            >
              Search
            </button>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
            >
              Browse Catalog
            </Link>
            <Link
              to="/products?sortBy=newest"
              className="bg-white/10 hover:bg-white/20 border border-white/10 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
            >
              Explore Rentals
            </Link>
          </div>

        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Browse by Category</h2>
          <p className="text-sm text-slate-500 mt-2">Pick an asset class and navigate through premium, audited products.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={i}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex flex-col justify-between p-6 bg-white border border-slate-100 hover:border-transparent rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Background color glow hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0`}></div>
              
              <div className="relative z-10">
                <span className="text-3xl block mb-4 group-hover:scale-120 transition-transform duration-300">{cat.icon}</span>
                <h3 className="font-bold text-slate-800 group-hover:text-white text-base transition-colors">{cat.name}</h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-200 mt-1 transition-colors">{cat.count}</p>
              </div>

              <span className="relative z-10 flex items-center justify-end text-slate-400 group-hover:text-white text-xs font-semibold mt-6 transition-colors">
                Explore <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Popular Choices</h2>
            <p className="text-sm text-slate-500 mt-2">These are the trending rental and purchase deals this week.</p>
          </div>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center mt-3 sm:mt-0 transition-colors">
            See all products <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Rentora Section */}
      <section className="bg-slate-100/60 border-y border-slate-200/50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-100 px-3 py-1 rounded-full">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              A premium marketplace that adapts to your financial flexibility.
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              We understand that buying heavy-duty machinery or flagship smartphones requires capital. That's why we merged standard e-commerce with a flexible daily lease program. Rented products arrive fully sanitized and covered under protection policies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-primary-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Refundable Deposit</h4>
                  <p className="text-xs text-slate-500 mt-1">Get your security deposit back within 2 hours of post-rental return check.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-primary-600">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Express Delivery</h4>
                  <p className="text-xs text-slate-500 mt-1">Rented laptops or mobiles shipped to your doorsteps inside 24 hours.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-primary-600">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Cancel / Renew Anytime</h4>
                  <p className="text-xs text-slate-500 mt-1">Renew your rental duration directly via client panel or terminate early.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-primary-600">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Audit Certificate</h4>
                  <p className="text-xs text-slate-500 mt-1">All vehicles and appliances undergo rigorous multi-point functionality checks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Graphic block */}
          <div className="relative aspect-[4/3] rounded-3xl bg-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            <img
              src="/premium_equipment.png"
              alt="Premium Equipment"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white p-6 glassmorphism-dark border-slate-700/30 rounded-2xl">
              <p className="text-xs text-primary-300 font-bold uppercase tracking-wider">Asset Quality Insured</p>
              <h3 className="font-bold text-lg mt-1">100% Calibrated Machinery</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Rent heavy tools, speakers, and electronics with complete peace of mind. We stand behind our quality guarantees.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Stories from Our Users</h2>
          <p className="text-sm text-slate-500 mt-2">See how Rentora helps builders, students and travelers save capital.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed italic">
              "Renting the MacBook Pro M4 was a game changer for my programming project. The delivery was fast, and the laptop was in mint condition. Will definitely lease again."
            </p>
            <hr className="border-slate-100" />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">AR</div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Aravind Rajan</h4>
                <p className="text-xs text-slate-400">Software Intern</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed italic">
              "We rented full sound equipment and speakers for a corporate party. Saved nearly ₹65,000 compared to external vendor rates. Setup support was extremely helpful."
            </p>
            <hr className="border-slate-100" />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm uppercase">PS</div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Priya Sharma</h4>
                <p className="text-xs text-slate-400">Event Manager</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
            <p className="text-sm text-slate-500 leading-relaxed italic">
              "Renting a Mahindra XUV700 for a weekend road trip was seamless. Calculated dates, paid billing fee, got delivery at my building. Returning it was hassle free."
            </p>
            <hr className="border-slate-100" />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm uppercase">VK</div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Vikram Kapoor</h4>
                <p className="text-xs text-slate-400">Travel Blogger</p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
