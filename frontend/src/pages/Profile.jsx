import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Save, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { userInfo, updateProfile } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setPhone(userInfo.phone || '');
    }
  }, [userInfo]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      return toast.error('Name and Email are required');
    }

    if (password && password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const updateData = { name, email, phone };
      if (password) {
        updateData.password = password;
      }

      await updateProfile(updateData);
      setPassword('');
      setConfirmPassword('');
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3">
        
        {/* Left Panel: Overview */}
        <div className="bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <span className="text-primary-400 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              User Dashboard
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">Account Profile</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage your personal information, contact credentials, and security password attributes.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center font-black text-lg text-white uppercase shadow-md shadow-primary-500/20">
              {name ? name[0] : 'U'}
            </div>
            <div>
              <h4 className="font-bold text-base truncate max-w-[150px]">{name}</h4>
              <p className="text-xs text-slate-400 capitalize">{userInfo?.role || 'User'} Member</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Edit Form */}
        <div className="md:col-span-2 p-8 md:p-12">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Update Personal Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <User size={14} className="mr-1 text-slate-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <Mail size={14} className="mr-1 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                <Phone size={14} className="mr-1 text-slate-400" /> Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pt-4 pb-3">Change Password (Optional)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <Lock size={14} className="mr-1 text-slate-400" /> New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                  <Lock size={14} className="mr-1 text-slate-400" /> Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {userInfo?.email === 'user@rentora.com' && (
              <div className="flex items-center space-x-2 text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs leading-relaxed">
                <ShieldAlert size={16} className="text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Notice:</strong> Updates on the default test account are supported but temporary resets may apply upon database restarts.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary-500/10 flex items-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
