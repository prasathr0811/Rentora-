import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { CreditCard, Shield, Truck, Phone, MapPin, Loader, Sparkles, ArrowLeft, Calendar } from 'lucide-react';

const Checkout = () => {
  const {
    cartItems,
    clearCart,
    totalBuyAmount,
    totalRentalCharges,
    totalRentalDeposit,
    grandTotal,
  } = useContext(CartContext);

  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form inputs
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState(userInfo?.phone || '');
  const [name, setName] = useState(userInfo?.name || '');

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Add products before checkout.');
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      return toast.error('Please enter your shipping address.');
    }
    if (!contactNumber.trim()) {
      return toast.error('Please enter your contact number.');
    }
    if (contactNumber.trim().length < 10) {
      return toast.error('Please enter a valid 10-digit mobile number.');
    }

    setIsProcessing(true);
    setProcessingStep(1); // Step 1: Initiating Secure Connection

    // Simulated payment delay & phase updates
    setTimeout(() => {
      setProcessingStep(2); // Step 2: Authorizing Transaction
    }, 1000);

    setTimeout(() => {
      setProcessingStep(3); // Step 3: Generating Receipt & finalising
    }, 2000);

    setTimeout(async () => {
      try {
        let lastTransId = '';
        
        // Loop through all items and save to database
        for (const item of cartItems) {
          if (item.type === 'buy') {
            const { data } = await API.post('/orders', {
              productId: item.product._id,
              quantity: item.quantity,
              shippingAddress,
              contactNumber,
            });
            lastTransId = data.transactionId;
          } else {
            const { data } = await API.post('/rentals', {
              productId: item.product._id,
              startDate: item.startDate,
              endDate: item.endDate,
              shippingAddress,
              contactNumber,
            });
            lastTransId = data.transactionId;
          }
        }

        toast.success('Payment Successful! Thank you for your order.');
        clearCart();
        setIsProcessing(false);
        
        if (lastTransId) {
          navigate(`/receipt/${lastTransId}`);
        } else {
          navigate('/profile');
        }
      } catch (err) {
        console.error('Checkout error:', err);
        const errorMsg = typeof err === 'string' ? err : (err?.response?.data?.message || err?.message || 'Payment processing failed. Please try again.');
        toast.error(errorMsg);
        setIsProcessing(false);
      }
    }, 3000);
  };

  if (isProcessing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-300">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <CreditCard className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-600 animate-pulse" size={32} />
        </div>
        
        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight animate-bounce">
            {processingStep === 1 && 'Connecting to Payment Gateway...'}
            {processingStep === 2 && 'Authorizing Payment...'}
            {processingStep === 3 && 'Finalizing Your Receipt...'}
          </h2>
          <p className="text-slate-500 text-sm">
            {processingStep === 1 && 'Establishing secure connection to Rentora billing gateway...'}
            {processingStep === 2 && 'Validating payment details and securing your transaction...'}
            {processingStep === 3 && 'Generating invoice, sending confirmation email and PDF receipt...'}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full">
          <Shield size={12} className="text-emerald-500" />
          <span>Secure Payment Gateway • Secure SSL 256-Bit</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="flex items-center space-x-2">
        <Link to="/cart" className="flex items-center text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-wider">
          <ArrowLeft size={16} className="mr-1" /> Back to Cart
        </Link>
      </div>

      <h1 className="text-3xl font-black text-slate-800 tracking-tight">Checkout Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Billing Address Form */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-3">
            <Truck size={20} className="mr-2 text-slate-500" /> Delivery & Shipping Info
          </h2>

          <form onSubmit={handleSubmitPayment} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <Phone size={12} className="mr-1 text-slate-400" /> Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>

            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                <MapPin size={12} className="mr-1 text-slate-400" /> Complete Shipping Address
              </label>
              <textarea
                rows="4"
                required
                placeholder="Enter complete shipping details (Street, Area, Landmark, City, Pincode)"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder:text-slate-400"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                <Shield size={16} className="text-emerald-500" />
                <span>Secure Payment. Your data is protected.</span>
              </span>
              
              <button
                type="submit"
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg shadow-primary-500/20 text-sm flex items-center justify-center gap-2"
              >
                <CreditCard size={18} /> Pay Now (INR {grandTotal.toLocaleString()})
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Order summary preview */}
        <aside className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center">
            <Sparkles size={16} className="mr-2 text-slate-500" /> Basket Items ({cartItems.length})
          </h3>

          <div className="divide-y divide-slate-50 max-h-[250px] overflow-y-auto pr-2">
            {cartItems.map((item, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                      item.type === 'buy' ? 'bg-blue-50 text-blue-700' : 'bg-primary-50 text-primary-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.product.category}</p>
                  
                  {item.type === 'rent' && (
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {item.days} day(s) lease
                    </span>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-slate-800">
                    INR {
                      item.type === 'buy'
                        ? (item.product.buyPrice * item.quantity).toLocaleString()
                        : (item.rentCost + item.securityDeposit).toLocaleString()
                    }
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {item.type === 'buy' ? `Qty: ${item.quantity}` : `Dep: INR ${item.securityDeposit.toLocaleString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
            {totalBuyAmount > 0 && (
              <div className="flex justify-between">
                <span>Purchase Subtotal:</span>
                <span className="font-semibold text-slate-800">INR {totalBuyAmount.toLocaleString()}</span>
              </div>
            )}
            {totalRentalCharges > 0 && (
              <div className="flex justify-between">
                <span>Rental Charges:</span>
                <span className="font-semibold text-slate-800">INR {totalRentalCharges.toLocaleString()}</span>
              </div>
            )}
            {totalRentalDeposit > 0 && (
              <div className="flex justify-between">
                <span>Refundable Deposits:</span>
                <span className="font-semibold text-primary-600">INR {totalRentalDeposit.toLocaleString()}</span>
              </div>
            )}
            
            <hr className="border-slate-100" />

            <div className="flex justify-between text-base font-extrabold text-slate-800">
              <span>Grand Total:</span>
              <span>INR {grandTotal.toLocaleString()}</span>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default Checkout;
