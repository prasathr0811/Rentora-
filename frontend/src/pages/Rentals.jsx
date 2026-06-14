import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { ListSkeleton } from '../components/SkeletonLoader';
import { RefreshCw, Receipt, Calendar, Key, AlertCircle, ArrowRight, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const { data } = await API.get('/rentals/myrentals');
        setRentals(data || []);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load rental history.');
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  const handleCancelRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to cancel this rental agreement?')) return;
    try {
      const { data } = await API.put(`/rentals/${rentalId}/cancel`);
      toast.success(data.message || 'Rental cancelled successfully.');
      setRentals((prev) => prev.map((r) => (r._id === rentalId ? { ...r, status: 'Cancelled' } : r)));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to cancel rental.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Rental History</h1>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Rental History</h1>
          <p className="text-xs text-slate-400 mt-1">Monitor active leasing agreements, deposits status, and returning procedures.</p>
        </div>
        
        <Link
          to="/products?priceType=rent"
          className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wider bg-primary-50 px-4 py-2.5 rounded-xl border border-primary-100"
        >
          Browse Rental Assets <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>

      {rentals.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <RefreshCw size={28} className="animate-spin duration-10000" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Rental Agreements</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            You haven't leased any products yet. Choose the rent option on any product details screen to lease it.
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all"
          >
            Rent Tools & Vehicles
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => {
            const start = new Date(rental.startDate);
            const end = new Date(rental.endDate);
            const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;

            return (
              <div
                key={rental._id}
                className="bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row justify-between gap-6 animate-in fade-in duration-300"
              >
                
                {/* Left Section: Product & Dates Info */}
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-50 flex-shrink-0">
                    <img
                      src={rental.product?.images && rental.product.images[0] ? rental.product.images[0] : 'https://placehold.co/100'}
                      alt={rental.product?.name || 'Deleted Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm hover:text-primary-600 transition-colors">
                        {rental.product ? (
                          <Link to={`/products/${rental.product._id}`}>{rental.product.name}</Link>
                        ) : (
                          'Asset Details Unavailable'
                        )}
                      </h3>
                      <span className="text-[9px] font-extrabold uppercase bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full border border-primary-100">
                        {rental.product?.category || 'General'}
                      </span>
                    </div>

                    {/* Rental Period range */}
                    <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center space-x-2 w-fit text-[10px] text-slate-600 font-semibold">
                      <Calendar size={12} className="text-primary-500" />
                      <span>{start.toLocaleDateString()}</span>
                      <ArrowLeftRight size={10} className="text-slate-400" />
                      <span>{end.toLocaleDateString()}</span>
                      <span className="text-slate-350">•</span>
                      <span className="text-primary-600">{diffDays} Day(s) lease</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-2">
                      TXN ID: {rental.transactionId}
                    </div>
                  </div>
                </div>

                {/* Right Section: Pricing details & receipt link */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 border-slate-50 pt-4 lg:pt-0 gap-6">
                  
                  <div className="grid grid-cols-2 gap-x-6 text-left lg:text-right">
                    <div>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Lease Cost</p>
                      <p className="font-bold text-slate-700 text-xs">INR {rental.rentCost.toLocaleString()}</p>
                    </div>
                    <div className="border-l lg:border-l-0 lg:border-r border-slate-100 pl-4 lg:pl-0 lg:pr-4">
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Security Deposit</p>
                      <p className="font-bold text-primary-600 text-xs">INR {rental.securityDeposit.toLocaleString()}</p>
                    </div>
                    
                    <div className="col-span-2 border-t border-slate-100 mt-1.5 pt-1.5 flex lg:justify-end items-center space-x-2">
                      <span className="text-[8px] text-slate-400 font-bold uppercase">Grand Total Paid:</span>
                      <span className="font-extrabold text-slate-800 text-sm">INR {rental.totalPaid.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                      rental.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : rental.status === 'Returned'
                        ? 'bg-slate-100 text-slate-500 border border-slate-200'
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {rental.status}
                    </span>

                    <Link
                      to={`/receipt/${rental.transactionId}`}
                      className="flex items-center bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      <Receipt size={14} className="mr-1.5" /> Invoice Slip
                    </Link>

                    {/* Cancel Rental Button */}
                    {rental.status === 'Active' && (
                      <button
                        onClick={() => handleCancelRental(rental._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex-shrink-0"
                      >
                        Cancel
                      </button>
                    )}
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

export default Rentals;
