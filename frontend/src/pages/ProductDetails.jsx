import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { DetailsSkeleton } from '../components/SkeletonLoader';
import toast from 'react-hot-toast';
import { Star, Calendar, Shield, ShoppingCart, MessageSquare, Clipboard, AlertCircle } from 'lucide-react';
import { getCleanProductImage } from '../utils/imageHelper';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionParam = searchParams.get('action'); // 'buy' or 'rent'

  const { addToCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  // Tab state for Buy / Rent selector
  const [checkoutMode, setCheckoutMode] = useState(actionParam === 'rent' ? 'rent' : 'buy');

  // Buy States
  const [quantity, setQuantity] = useState(1);

  // Rent States
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTomorrowString());
  const [rentalDays, setRentalDays] = useState(1);

  // Review Input States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        const cleanImg = getCleanProductImage(data.product);
        const updatedProduct = {
          ...data.product,
          images: [cleanImg, ...(data.product.images?.slice(1) || [])],
        };
        setProduct(updatedProduct);
        setReviews(data.reviews || []);
        setActiveImage(cleanImg);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load product details');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Sync dates calculation
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        setRentalDays(diffDays);
      } else {
        setRentalDays(0);
      }
    }
  }, [startDate, endDate]);

  const handleAddToCart = () => {
    if (!product) return;

    if (checkoutMode === 'buy') {
      if (product.stock < quantity) {
        return toast.error('Requested quantity exceeds available stock');
      }
      addToCart(product, 'buy', { quantity });
      toast.success(`${product.name} (Buy) added to cart.`);
    } else {
      if (rentalDays <= 0) {
        return toast.error('Rental end date must be after start date');
      }
      addToCart(product, 'rent', { startDate, endDate });
      toast.success(`${product.name} (Rent) added to cart.`);
    }

    // Redirect to cart
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error('Please add review text');
    }

    if (!userInfo) {
      toast.error('You must sign in to submit reviews.');
      return navigate('/login');
    }

    setReviewLoading(true);
    try {
      const { data } = await API.post(`/products/${product._id}/reviews`, { rating, comment });
      toast.success('Review submitted successfully!');
      
      // Reload reviews
      const response = await API.get(`/products/${product._id}`);
      setReviews(response.data.reviews || []);
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-500 font-semibold text-lg">Product not found.</p>
      </div>
    );
  }

  // Calculate rental totals
  const rentalCostTotal = product.rentPricePerDay * rentalDays;
  const grandRentalTotal = rentalCostTotal + product.securityDeposit;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          
          {/* Main Active Image Display */}
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner relative">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all"
            />
            {product.stock === 0 && (
              <span className="absolute top-4 right-4 bg-red-600 text-white font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
                Out Of Stock
              </span>
            )}
          </div>

          {/* Thumbnail Selectors */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-primary-600 scale-105' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right Side: Product Details & Buying/Renting Forms */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
              <span className="text-primary-600">{product.category}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{product.subCategory}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center space-x-4 text-sm font-semibold">
              <span className="flex items-center text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold">
                <Star size={14} className="fill-amber-500 text-amber-500 mr-1" />
                {product.rating ? product.rating.toFixed(1) : '4.5'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{reviews.length} Customer Reviews</span>
              <span className="text-slate-300">|</span>
              <span className={product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}>
                {product.stock > 0 ? `${product.stock} Units In Stock` : 'Out of Stock'}
              </span>
            </div>

            <hr className="border-slate-100" />

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications Details */}
            {product.specs && product.specs.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Specifications</h4>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <table className="w-full text-xs text-slate-600">
                    <tbody>
                      {product.specs.map((spec, i) => {
                        const parts = spec.split(':');
                        const key = parts[0];
                        const val = parts.slice(1).join(':').trim();
                        return (
                          <tr key={i} className={i !== 0 ? 'border-t border-slate-100' : ''}>
                            <td className="py-2 font-bold text-slate-500 pr-4 w-1/3 uppercase tracking-wider">{key}</td>
                            <td className="py-2 text-slate-700 font-semibold">{val || 'Yes'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Buying vs Renting Checkout workflow panel */}
          <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 mt-6 space-y-6">
            
            {/* Action Toggles */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setCheckoutMode('buy')}
                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  checkoutMode === 'buy' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Purchase
              </button>
              <button
                type="button"
                onClick={() => setCheckoutMode('rent')}
                className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  checkoutMode === 'rent' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Rent Out
              </button>
            </div>

            {/* Buy Mode Panel */}
            {checkoutMode === 'buy' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Purchase Price</p>
                    <p className="text-2xl font-black text-slate-800">INR {product.buyPrice.toLocaleString()}</p>
                  </div>
                  
                  {/* Quantity input */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-400 font-bold uppercase">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-slate-900 hover:bg-slate-850 disabled:bg-slate-200 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingCart size={18} /> Add to Cart (Buy)
                </button>
              </div>
            )}

            {/* Rent Mode Panel */}
            {checkoutMode === 'rent' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rent rate</label>
                    <p className="text-xl font-extrabold text-slate-800">INR {product.rentPricePerDay.toLocaleString()}/day</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Refundable Deposit</label>
                    <p className="text-xl font-extrabold text-primary-600">INR {product.securityDeposit.toLocaleString()}</p>
                  </div>
                </div>

                {/* Calendar inputs */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Start Date</label>
                    <input
                      type="date"
                      min={getTodayString()}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">End Date</label>
                    <input
                      type="date"
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Calculations summary preview */}
                {rentalDays > 0 ? (
                  <div className="p-3 bg-primary-50/50 border border-primary-100 rounded-2xl text-xs space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span>Lease Duration:</span>
                      <span className="font-bold text-slate-800">{rentalDays} Day(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rent Total ({rentalDays} days):</span>
                      <span className="font-bold text-slate-800">INR {rentalCostTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-bold text-slate-800">INR {product.securityDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-primary-100 pt-1.5 mt-1 text-sm font-bold text-primary-700">
                      <span>Grand Total:</span>
                      <span>INR {grandRentalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-1.5">
                    <AlertCircle size={14} />
                    <span>Please choose a valid end date.</span>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={rentalDays <= 0}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  <Calendar size={18} /> Add to Cart (Rent)
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Reviews Section */}
      <div className="space-y-8">
        
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <MessageSquare className="text-slate-500" />
          <h2 className="text-xl font-bold text-slate-800">Reviews &amp; Ratings ({reviews.length})</h2>
        </div>

        {/* Rating Summary */}
        {reviews.length > 0 && (() => {
          const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length);
          const counts = [5,4,3,2,1].map(n => ({ star: n, count: reviews.filter(r => r.rating === n).length }));
          return (
            <div className="bg-gradient-to-r from-slate-50 to-primary-50/30 border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
              {/* Big Average */}
              <div className="text-center flex-shrink-0">
                <p className="text-5xl font-black text-slate-800">{avg.toFixed(1)}</p>
                <div className="flex items-center justify-center gap-0.5 my-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                  ))}
                </div>
                <p className="text-xs text-slate-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
              </div>
              {/* Bars */}
              <div className="flex-1 w-full space-y-1.5">
                {counts.map(({ star, count }) => {
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-4">{star}</span>
                      <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Panel: Review Form */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Write a Review</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        size={24}
                        className={star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-500">{['','Terrible','Poor','Okay','Good','Excellent'][hoverRating || rating]}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Comment</label>
                  <span className={`text-[10px] font-semibold ${comment.length > 270 ? 'text-red-500' : 'text-slate-400'}`}>{comment.length}/300</span>
                </div>
                <textarea
                  rows="4"
                  maxLength={300}
                  placeholder="Share your experience renting or buying this item..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder:text-slate-400"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {reviewLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Submit Review'
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-400 text-xs font-semibold">
                No reviews yet. Be the first to purchase/rent and write an audit report.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-orange-500','bg-pink-500','bg-teal-500'];
                  const colorIdx = rev.userName.charCodeAt(0) % colors.length;
                  return (
                  <div key={rev._id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-lg ${colors[colorIdx]} text-white flex items-center justify-center font-bold text-xs uppercase`}>
                          {rev.userName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-800 text-xs">{rev.userName}</h4>
                            {rev.rating >= 4 && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetails;
