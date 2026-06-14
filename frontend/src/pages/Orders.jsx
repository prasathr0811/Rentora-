import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { ListSkeleton } from '../components/SkeletonLoader';
import { ClipboardList, Receipt, Calendar, Package, ArrowRight, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/myorders');
        setOrders(data || []);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load purchase history.');
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await API.put(`/orders/${orderId}/cancel`);
      toast.success(data.message || 'Order cancelled successfully.');
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o)));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to cancel order.');
    }
  };

  const handleReturnOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to return this purchased item?')) return;
    try {
      const { data } = await API.put(`/orders/${orderId}/return`);
      toast.success(data.message || 'Return initiated successfully.');
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'Returned' } : o)));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to return order.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Purchase History</h1>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Purchase History</h1>
          <p className="text-xs text-slate-400 mt-1">Review and manage your product purchases and transaction invoices.</p>
        </div>
        
        <Link
          to="/products"
          className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wider bg-primary-50 px-4 py-2.5 rounded-xl border border-primary-100"
        >
          Browse More Assets <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <ClipboardList size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Purchases Found</h3>
          <p className="text-slate-500 text-xs max-w-xs mx-auto">
            You haven't bought any items outright yet. All standard products support instant purchase options.
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all"
          >
            Explore E-Commerce Store
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row justify-between gap-6"
            >
              
              {/* Product Info Block */}
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-50 flex-shrink-0">
                  <img
                    src={order.product?.images && order.product.images[0] ? order.product.images[0] : 'https://placehold.co/100'}
                    alt={order.product?.name || 'Deleted Product'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm hover:text-primary-600 transition-colors">
                      {order.product ? (
                        <Link to={`/products/${order.product._id}`}>{order.product.name}</Link>
                      ) : (
                        'Asset Details Unavailable'
                      )}
                    </h3>
                    <span className="text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                      {order.product?.category || 'General'}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center"><Calendar size={12} className="mr-1 text-slate-400" /> Purchased on {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center font-mono"><Package size={12} className="mr-1 text-slate-400" /> TXN: {order.transactionId}</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-600">
                    Quantity: <span className="font-bold text-slate-800">{order.quantity}</span> • Unit Price: <span className="font-bold text-slate-800">INR {order.product?.buyPrice ? order.product.buyPrice.toLocaleString() : 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 border-slate-50 pt-4 lg:pt-0 gap-4">
                
                <div className="text-left lg:text-right">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Paid</p>
                  <p className="font-extrabold text-slate-800 text-lg">INR {order.totalAmount.toLocaleString()}</p>
                  
                  {/* Order Status Badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 uppercase ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : order.orderStatus === 'Shipped'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-red-50 text-red-700 border border-red-100'
                      : order.orderStatus === 'Returned'
                      ? 'bg-purple-50 text-purple-700 border border-purple-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/receipt/${order.transactionId}`}
                    className="flex items-center bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex-shrink-0"
                  >
                    <Receipt size={14} className="mr-1.5" /> Invoice Slip
                  </Link>

                  {/* Cancel Order Button */}
                  {(order.orderStatus === 'Processing' || order.orderStatus === 'Confirmed') && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex-shrink-0"
                    >
                      Cancel
                    </button>
                  )}

                  {/* Return Order Button */}
                  {(order.orderStatus === 'Delivered') && (
                    <button
                      onClick={() => handleReturnOrder(order._id)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex-shrink-0"
                    >
                      Return
                    </button>
                  )}
                  {order.product && (
                    <Link
                      to={`/products/${order.product._id}`}
                      className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 text-slate-450 hover:text-slate-600 transition-colors flex-shrink-0"
                      title="Buy Again"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Orders;
