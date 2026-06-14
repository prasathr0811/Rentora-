import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { DetailsSkeleton } from '../components/SkeletonLoader';
import { Download, Printer, ArrowLeft, CheckCircle2, Shield, Calendar, Mail, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Receipt = () => {
  const { transactionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data } = await API.get(`/receipts/details/${transactionId}`);
        setReceiptData(data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load receipt details.');
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [transactionId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Generate direct download URL
    const baseURL = API.defaults.baseURL || 'http://localhost:5000/api';
    const downloadURL = `${baseURL}/receipts/download/${transactionId}`;
    
    // Trigger download in a hidden iframe or browser download
    const link = document.createElement('a');
    link.href = downloadURL;
    link.setAttribute('download', `Rentora_Receipt_${transactionId.substring(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Downloading PDF receipt...');
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!receiptData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-slate-500 font-semibold text-lg">Receipt details not found.</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm font-bold">Return to Homepage</Link>
      </div>
    );
  }

  const { type, details } = receiptData;
  const isRent = type === 'rent';
  const start = isRent ? new Date(details.startDate) : null;
  const end = isRent ? new Date(details.endDate) : null;
  const diffDays = isRent ? Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1 : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 print:py-0 print:px-0">
      
      {/* Top Navigation Panel - Hides when printing */}
      <div className="flex items-center justify-between no-print border-b border-slate-100 pb-5">
        <Link to="/profile" className="flex items-center text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-wider">
          <ArrowLeft size={16} className="mr-1" /> Profile Panel
        </Link>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center bg-white border border-slate-200 hover:border-slate-350 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Printer size={14} className="mr-1.5" /> Print Receipt
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-primary-500/15"
          >
            <Download size={14} className="mr-1.5" /> Download PDF
          </button>
        </div>
      </div>

      {/* Success Confirmer Banner - Hides when printing */}
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-3xl p-5 flex items-start space-x-3.5 no-print">
        <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-emerald-800 text-sm">Payment Successful</h4>
          <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
            Your transaction has been securely processed. A PDF receipt has been generated and sent to your registered email address.
          </p>
        </div>
      </div>

      {/* Main Invoice Card Wrapper */}
      <div className="bg-white border border-slate-100 shadow-xl rounded-[32px] p-8 sm:p-12 space-y-8 print-card print:border-0 print:shadow-none print:p-0">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-wider text-primary-600">RENTORA</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unified Buy & Rental Marketplace</p>
          </div>
          
          <div className="text-left sm:text-right space-y-1">
            <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Invoice / Receipt</h2>
            <p className="text-xs text-slate-500">Invoice No: <span className="font-bold font-mono">INV-{details.transactionId.substring(0, 8).toUpperCase()}</span></p>
            <p className="text-xs text-slate-500">Date: {new Date(details.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Billed to / Payment details info columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
          
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billed To</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 text-sm">{details.user.name}</p>
              <p className="flex items-center"><Mail size={12} className="mr-1.5 text-slate-400" /> {details.user.email}</p>
              <p>Contact: {details.contactNumber}</p>
              <p className="max-w-xs mt-1">Shipping: {details.shippingAddress}</p>
            </div>
          </div>

          <div className="space-y-2.5 sm:text-right">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Info</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Transaction ID: <span className="font-bold font-mono text-slate-800">{details.transactionId}</span></p>
              <p>Status: <span className="font-bold text-emerald-600">SUCCESSFUL</span></p>
              <p>Gateway: Rentora Pay</p>
              <p>Type: <span className="font-bold text-primary-600 uppercase tracking-wider">{type}</span></p>
            </div>
          </div>

        </div>

        {/* Rental specific dates ribbon */}
        {isRent && (
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <Calendar size={14} className="text-primary-500" />
              <span>Rental Start: <strong className="text-slate-800">{start.toLocaleDateString()}</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Calendar size={14} className="text-primary-500" />
              <span>Rental End: <strong className="text-slate-800">{end.toLocaleDateString()}</strong></span>
            </span>
            <span className="bg-primary-100 text-primary-700 font-bold px-3 py-1 rounded-full text-[10px] uppercase">
              Duration: {diffDays} Day(s) lease
            </span>
          </div>
        )}

        {/* Invoice Itemized Table */}
        <div className="pt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 w-1/2">Item Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Qty / Days</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              <tr>
                <td className="py-4">
                  <div className="font-bold text-slate-800">{details.product.name}</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed max-w-sm line-clamp-1">{details.product.description}</p>
                </td>
                <td className="py-4 font-semibold">{details.product.category}</td>
                
                <td className="py-4 text-right">
                  INR {
                    isRent
                      ? `${details.product.rentPricePerDay.toLocaleString()}/day`
                      : details.product.buyPrice.toLocaleString()
                  }
                </td>
                
                <td className="py-4 text-right font-bold">
                  {isRent ? `${diffDays} days` : details.quantity}
                </td>
                
                <td className="py-4 text-right font-bold text-slate-800">
                  INR {
                    isRent
                      ? details.rentCost.toLocaleString()
                      : details.totalAmount.toLocaleString()
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calculations totals block */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-full sm:w-80 space-y-3 text-xs text-slate-600">
            
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                INR {
                  isRent
                    ? details.rentCost.toLocaleString()
                    : details.totalAmount.toLocaleString()
                }
              </span>
            </div>

            {isRent && (
              <div className="flex justify-between">
                <span>Security Deposit (Refundable):</span>
                <span className="font-semibold text-slate-800">INR {details.securityDeposit.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-extrabold text-slate-800">
              <span>Grand Total:</span>
              <span>
                INR {
                  isRent
                    ? details.totalPaid.toLocaleString()
                    : details.totalAmount.toLocaleString()
                }
              </span>
            </div>

          </div>
        </div>

        {/* Invoice Footer */}
        <div className="pt-12 border-t border-slate-100 text-center text-[10px] text-slate-400 leading-relaxed max-w-md mx-auto">
          <p className="flex items-center justify-center gap-1 font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            <Shield size={12} className="text-emerald-500" /> Rentora Verified Invoice
          </p>
          <p>
            Thank you for choosing Rentora! This document serves as your official payment confirmation receipt.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Receipt;
