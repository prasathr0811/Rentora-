import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { getCleanProductImage } from '../utils/imageHelper';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const { userInfo } = useContext(AuthContext);

  const handleBuyClick = (e) => {
    e.preventDefault();
    navigate(`/products/${product._id}?action=buy`);
  };

  const handleRentClick = (e) => {
    e.preventDefault();
    navigate(`/products/${product._id}?action=rent`);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) {
      toast.error('Please login to save items to wishlist');
      return navigate('/login');
    }
    toggleWishlist(product._id);
  };

  const wishlisted = isWishlisted(product._id);
  const imgSrc = getCleanProductImage(product);

  return (
    <div className="group bg-white rounded-xl border border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden hover:-translate-y-0.5">

      {/* ── Image — fixed 125px height ── */}
      <Link
        to={`/products/${product._id}`}
        className="relative block overflow-hidden bg-slate-100 flex-shrink-0 h-[125px]"
      >
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/400x220/f1f5f9/94a3b8?text=${encodeURIComponent(product.name || 'Product')}`;
          }}
        />
        <span className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-sm text-white font-semibold text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wide">
          {product.category}
        </span>
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">
            Sold Out
          </span>
        )}

        {/* Wishlist heart button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
            wishlisted
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 text-slate-400 hover:text-red-500 hover:scale-110'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={13} className={wishlisted ? 'fill-white' : ''} />
        </button>
      </Link>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col flex-1">

        {/* Sub-category + Rating */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-primary-600 uppercase tracking-wide font-bold truncate max-w-[65%]">
            {product.subCategory}
          </span>
          <span className="flex items-center bg-amber-50 text-amber-700 px-1 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0">
            <Star size={8} className="fill-amber-500 text-amber-500 mr-0.5" />
            {product.rating ? product.rating.toFixed(1) : '4.5'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-xs line-clamp-1 mb-2 group-hover:text-primary-600 transition-colors leading-tight">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>

        {/* Prices */}
        <div className="flex items-center justify-between text-[10px] bg-slate-50 rounded-lg px-2 py-1.5 mb-2">
          <div>
            <p className="text-[8px] text-slate-400 font-bold uppercase">Buy</p>
            <p className="font-extrabold text-slate-800 text-[11px]">
              ₹{product.buyPrice ? product.buyPrice.toLocaleString('en-IN') : 'N/A'}
            </p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-right">
            <p className="text-[8px] text-slate-400 font-bold uppercase">Rent/day</p>
            <p className="font-extrabold text-primary-600 text-[11px]">
              ₹{product.rentPricePerDay ? product.rentPricePerDay.toLocaleString('en-IN') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1 mt-auto">
          <button
            onClick={handleBuyClick}
            className="text-[10px] font-semibold py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Buy Now
          </button>
          <button
            onClick={handleRentClick}
            className="text-[10px] font-semibold py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all"
          >
            Rent Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
