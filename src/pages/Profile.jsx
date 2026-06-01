import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { 
  FiArrowLeft, FiLogOut, FiGlobe, FiShield, FiUser, 
  FiInfo, FiChevronRight, FiCreditCard, FiLock, FiBell, 
  FiMessageCircle, FiCamera, FiCheckCircle, FiFileText 
} from 'react-icons/fi';

export default function Profile() {
  const { user, setUser, logout } = useContext(ChitContext);
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    navigate('/');
    return null;
  }

  // Personal Info States
  const [name, setName] = useState(user.name || 'Rajesh Kumar');
  const [phone, setPhone] = useState(user.phone || '9876543210');
  const [email, setEmail] = useState(user.email || 'rajesh.kumar@gmail.com');
  const [organizerName, setOrganizerName] = useState(user.organizerName || 'Village Friends Savings Club');
  const [avatarBg, setAvatarBg] = useState(user.avatarBg || 'bg-brand-blue');

  // Change Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  // Notification States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // WhatsApp Integration States
  const [autoReceipts, setAutoReceipts] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);

  // App Preferences
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Light');
  const [currency, setCurrency] = useState('₹ (INR)');

  const [profileSaved, setProfileSaved] = useState(false);

  // Organizer Notes States
  const [organizerNotes, setOrganizerNotes] = useState(user.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(user.notesUpdatedAt ? new Date(user.notesUpdatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '');

  // Debounced auto-save for Organizer Notes
  useEffect(() => {
    if (organizerNotes === (user.notes || '')) {
      return;
    }

    setIsSaving(true);
    const timer = setTimeout(() => {
      const updatedUser = {
        ...user,
        notes: organizerNotes,
        notesUpdatedAt: new Date().toISOString()
      };
      setUser(updatedUser);
      setIsSaving(false);
      
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSaved(timeStr);
    }, 1000);

    return () => clearTimeout(timer);
  }, [organizerNotes]);

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Name is required');
      return;
    }
    // Update user in Context
    const updatedUser = {
      ...user,
      name,
      phone,
      email,
      organizerName,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      avatarBg
    };
    setUser(updatedUser);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordStatus('error:Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error:New passwords do not match');
      return;
    }
    setPasswordStatus('success:Password updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(''), 4000);
  };

  const avatarColors = [
    { name: 'Classic Blue', class: 'bg-brand-blue' },
    { name: 'Emerald Teal', class: 'bg-emerald-650 bg-teal-700' },
    { name: 'Vibrant Orange', class: 'bg-orange-500' },
    { name: 'Rose Red', class: 'bg-rose-600' },
    { name: 'Royal Purple', class: 'bg-purple-600' }
  ];

  return (
    <div className="flex-grow bg-brand-bg relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-brand-border/40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-dark hover:bg-slate-50 active-scale"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Profile Settings</h2>
              <p className="text-xs text-brand-gray font-bold tracking-wider uppercase mt-0.5">Manage organizer profile & preferences</p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Profile Pic & Password Change */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Photo Card */}
            <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-2xs text-center flex flex-col items-center animate-scale-in">
              <div className="relative group">
                <div className={`w-24 h-24 rounded-full ${avatarBg} text-white font-black text-2xl flex items-center justify-center shadow-md border-4 border-slate-50 transition-all`}>
                  {user.avatar || 'RK'}
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center border-2 border-white shadow-sm cursor-pointer active-scale" title="Change Avatar Theme">
                  <FiCamera className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className="text-base font-black text-brand-dark mt-4">{name}</h3>
              <p className="text-xs font-bold text-brand-gray mt-0.5">+91 {phone}</p>
              
              <div className="mt-4 pt-4 border-t border-brand-border/60 w-full">
                <span className="text-[10px] font-black text-brand-gray uppercase tracking-wider block mb-2 text-left">Choose Avatar Color</span>
                <div className="flex justify-center gap-2">
                  {avatarColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setAvatarBg(color.class)}
                      className={`w-6 h-6 rounded-full ${color.class} border-2 ${avatarBg === color.class ? 'border-brand-dark scale-110 shadow-xs' : 'border-white'} active-scale cursor-pointer`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
              <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2.5">
                <FiLock className="text-brand-blue" />
                <span>Change Password</span>
              </h4>

              {passwordStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold ${passwordStatus.startsWith('success') ? 'bg-green-50 border border-green-150 text-brand-success' : 'bg-red-50 border border-red-150 text-brand-danger'}`}>
                  {passwordStatus.split(':')[1]}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-xl font-bold text-brand-dark outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-xl font-bold text-brand-dark outline-none focus:border-brand-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border rounded-xl font-bold text-brand-dark outline-none focus:border-brand-blue"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-black active-scale transition-colors shadow-2xs cursor-pointer mt-1"
                >
                  Update Password
                </button>
              </div>
            </form>

          </div>

          {/* RIGHT COLUMN: Info Inputs, Notifications, WhatsApp & App Preferences */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Info Form */}
            <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
              <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center justify-between border-b border-brand-border/60 pb-2.5">
                <span className="flex items-center gap-1.5">
                  <FiUser className="text-brand-blue" />
                  <span>Organizer Details</span>
                </span>
                {profileSaved && (
                  <span className="text-[10px] font-black text-brand-success bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-0.5 uppercase">
                    <FiCheckCircle /> Saved
                  </span>
                )}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* User Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">User Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                    required
                  />
                </div>

                {/* Organizer/Savings Club Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Organizer Name</label>
                  <input
                    type="text"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-black shadow-md active-scale transition-colors cursor-pointer"
                >
                  Save Personal Info
                </button>
              </div>
            </form>

            {/* Switch Toggles & Settings Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Notification Settings */}
              <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
                <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2.5">
                  <FiBell className="text-brand-blue" />
                  <span>Notification Settings</span>
                </h4>
                <div className="space-y-3.5 text-xs text-brand-dark">
                  
                  {/* Email Alerts */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Email Alerts</span>
                      <span className="text-[9.5px] text-brand-gray block font-medium">Monthly collection summaries</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={emailAlerts} 
                        onChange={() => setEmailAlerts(!emailAlerts)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-success"></div>
                    </label>
                  </div>

                  {/* SMS Reminders */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block">SMS Reminders</span>
                      <span className="text-[9.5px] text-brand-gray block font-medium">Auto SMS dispatch to pending members</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={smsAlerts} 
                        onChange={() => setSmsAlerts(!smsAlerts)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-success"></div>
                    </label>
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Push Notifications</span>
                      <span className="text-[9.5px] text-brand-gray block font-medium">Browser alerts for critical updates</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={pushNotifications} 
                        onChange={() => setPushNotifications(!pushNotifications)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-success"></div>
                    </label>
                  </div>

                </div>
              </div>

              {/* WhatsApp Integration Settings */}
              <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
                <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2.5">
                  <FiMessageCircle className="text-brand-blue" />
                  <span>WhatsApp Settings</span>
                </h4>
                <div className="space-y-3.5 text-xs text-brand-dark">
                  
                  {/* Auto-Receipts */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Auto-Receipt Prompts</span>
                      <span className="text-[9.5px] text-brand-gray block font-medium">Open WhatsApp redirect after saving</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={autoReceipts} 
                        onChange={() => setAutoReceipts(!autoReceipts)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-success"></div>
                    </label>
                  </div>

                  {/* Payment Reminders */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block">WhatsApp Reminders</span>
                      <span className="text-[9.5px] text-brand-gray block font-medium">Direct WhatsApp ping templates for dues</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={paymentReminders} 
                        onChange={() => setPaymentReminders(!paymentReminders)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-success"></div>
                    </label>
                  </div>

                </div>
              </div>

            </div>

            {/* Organizer Notes Card */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border/60 pb-2.5">
                <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                  <FiFileText className="text-brand-blue" />
                  <span>My Organizer Notes & Reminders</span>
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  {isSaving ? (
                    <span className="text-brand-blue animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-ping"></span>
                      Saving...
                    </span>
                  ) : lastSaved ? (
                    <span className="text-brand-success flex items-center gap-1">
                      <FiCheckCircle /> Saved {lastSaved}
                    </span>
                  ) : (
                    <span className="text-brand-gray">Ready</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-brand-gray font-medium leading-relaxed">
                  Write down reminders, checklist, observations, or general guidelines. Changes are saved automatically as you type.
                </p>
                <textarea
                  value={organizerNotes}
                  onChange={(e) => setOrganizerNotes(e.target.value)}
                  placeholder="Type personal reminders, observation logs, or collection strategies..."
                  className="w-full h-40 px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs resize-none"
                />
              </div>
            </div>

            {/* App Preferences */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
              <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2.5">
                <FiGlobe className="text-brand-blue" />
                <span>App Preferences</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brand-dark">
                
                {/* Language Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">App Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl font-bold outline-none focus:border-brand-blue"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Malayalam">മലയാളം (Malayalam)</option>
                  </select>
                </div>

                {/* Theme Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Display Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl font-bold outline-none focus:border-brand-blue"
                  >
                    <option value="Light">Light Mode</option>
                    <option value="Dark">Dark Mode</option>
                    <option value="System">System Default</option>
                  </select>
                </div>

                {/* Currency Symbol Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Currency Unit</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl font-bold outline-none focus:border-brand-blue"
                  >
                    <option value="₹ (INR)">₹ (INR)</option>
                    <option value="$ (USD)">$ (USD)</option>
                    <option value="£ (GBP)">£ (GBP)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Logout Row */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full py-4 bg-white hover:bg-red-50 text-brand-danger border border-red-200 rounded-2xl font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 active-scale cursor-pointer"
            >
              <FiLogOut className="w-4 h-4" />
              Log Out Account
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
