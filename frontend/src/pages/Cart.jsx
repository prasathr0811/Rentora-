import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight, ShieldAlert, Sparkles, Calendar } from 'lucide-react';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalBuyAmount,
    totalRentalCharges,
    totalRentalDeposit,
    grandTotal,
  } = useContext(CartContext);

  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">You haven't selected any items for purchase or daily leasing yet. Browse our verified categories.</p>
        <Link
          to="/products"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md shadow-primary-500/20"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-8">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-200"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={item.product.images && item.product.images[0] ? item.product.images[0] : 'https://placehold.co/100'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-800 text-sm hover:text-primary-600 transition-colors">
                      <Link to={`/products/${item.product._id}`}>{item.product.name}</Link>
                    </h3>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      item.type === 'buy'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-primary-50 text-primary-700 border border-primary-100'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{item.product.category}</p>
                  
                  {/* Rent Specific details label */}
                  {item.type === 'rent' && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-2 bg-slate-50 px-2 py-1 rounded-lg w-fit font-semibold">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()} ({item.days} days)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Operations & Pricing details */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-8 border-t sm:border-0 border-slate-50 pt-3 sm:pt-0">
                
                {/* Quantity or Lease details */}
                {item.type === 'buy' ? (
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-400 font-bold uppercase">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product._id, e.target.value)}
                      className="w-14 px-1 py-1 border border-slate-200 rounded-lg text-center font-bold text-xs"
                    />
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Charges / Deposit</p>
                    <p className="text-xs font-semibold text-slate-600">INR {item.rentCost.toLocaleString()} + INR {item.securityDeposit.toLocaleString()}</p>
                  </div>
                )}

                {/* Subtotal Item Cost */}
                <div className="text-right min-w-[90px]">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Total</p>
                  <p className="font-extrabold text-slate-800 text-sm">
                    INR {
                      item.type === 'buy'
                        ? (item.product.buyPrice * item.quantity).toLocaleString()
                        : (item.rentCost + item.securityDeposit).toLocaleString()
                    }
                  </p>
                </div>

                {/* Delete Trigger */}
                <button
                  onClick={() => removeFromCart(item.product._id, item.type)}
                  className="p-2 text-slate-350 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            </div>
          ))}
        </div>

        {/* Right Column: Calculations Summary Panel */}
        <aside className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 flex items-center">
            <Sparkles size={18} className="mr-2 text-slate-500" /> Order Summary
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            {totalBuyAmount > 0 && (
              <div className="flex justify-between">
                <span>Purchase Items:</span>
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
                <span>Security Deposit (Refundable):</span>
                <span className="font-semibold text-primary-600">INR {totalRentalDeposit.toLocaleString()}</span>
              </div>
            )}
            
            <hr className="border-slate-150" />

            <div className="flex justify-between text-base font-extrabold text-slate-800">
              <span>Grand Total:</span>
              <span>INR {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {totalRentalDeposit > 0 && (
            <div className="flex items-start space-x-2 text-primary-800 bg-primary-50/50 p-3.5 rounded-2xl border border-primary-100 text-[10px] leading-relaxed">
              <ShieldAlert size={16} className="text-primary-600 flex-shrink-0" />
              <span>
                <strong>Refund Guarantee:</strong> Rent items include a security deposit. This will be automatically returned to your account within 2 hours of device returns inspection.
              </span>
            </div>
          )}

          <button
            onClick={handleCheckoutClick}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 text-sm"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </aside>

      </div>
    </div>
  );
};

export default Cart;
