import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { Heart, Trash2, ShoppingCart, Star, ArrowRight, PackageOpen } from 'lucide-react';
import { getCleanProductImage } from '../utils/imageHelper';
import API from '../services/api';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';

const Wishlist = () => {
  const { wishlist, toggleWishlist, loading } = useContext(WishlistContext);
  const { userInfo } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [products, setProducts] = React.useState([]);
  const [fetching, setFetching] = React.useState(true);

  React.useEffect(() => {
    const fetchWishlistProducts = async () => {
      setFetching(true);
      try {
        const { data } = await API.get('/wishlist');
        setProducts(data.products || []);
      } catch {
        toast.error('Failed to load wishlist');
      } finally {
        setFetching(false);
      }
    };
    if (userInfo) fetchWishlistProducts();
  }, [wishlist, userInfo]);

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    setProducts(prev => prev.filter(p => p._id !== productId));
  };

  const handleAddToCart = (product) => {
    addToCart(product, 'buy', { quantity: 1 });
    toast.success(`${product.name} added to cart!`);
    navigate('/cart');
  };

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Heart size={20} className="fill-red-500 text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Wishlist</h1>
          </div>
          <p className="text-slate-400 text-sm ml-[52px]">
            {products.length === 0 ? 'No saved items yet' : `${products.length} item${products.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        <Link
          to="/products"
          className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
        >
          Browse Products <ArrowRight size={16} />
        </Link>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <PackageOpen size={40} className="text-red-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Your wishlist is empty</h2>
          <p className="text-slate-400 text-sm max-w-xs mb-8">
            Start exploring and save items you love by tapping the ❤️ on any product.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-500/25"
          >
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const imgSrc = getCleanProductImage(product);
            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl border border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/400x240/f1f5f9/94a3b8?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                  </Link>
                  <span className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-sm text-white font-semibold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {product.category}
                  </span>
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Heart size={14} className="fill-red-500 text-red-500" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-primary-600 uppercase tracking-wide font-bold truncate">
                      {product.subCategory}
                    </span>
                    <span className="flex items-center bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                      <Star size={8} className="fill-amber-500 text-amber-500 mr-0.5" />
                      {product.rating ? product.rating.toFixed(1) : '4.5'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mb-3 group-hover:text-primary-600 transition-colors">
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                  </h3>

                  {/* Prices */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 mb-3 text-xs">
                    <div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Buy</p>
                      <p className="font-extrabold text-slate-800">
                        ₹{product.buyPrice?.toLocaleString('en-IN') || 'N/A'}
                      </p>
                    </div>
                    <div className="h-5 w-px bg-slate-200" />
                    <div className="text-right">
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Rent/day</p>
                      <p className="font-extrabold text-primary-600">
                        ₹{product.rentPricePerDay?.toLocaleString('en-IN') || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="text-xs font-semibold py-2 text-center border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="text-xs font-semibold py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all flex items-center justify-center gap-1"
                    >
                      <ShoppingCart size={12} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
