import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiArrowLeft, FiLogOut, FiGlobe, FiShield, FiUser, FiInfo, FiChevronRight, FiCreditCard } from 'react-icons/fi';

export default function Profile() {
  const { user, logout } = useContext(ChitContext);
  const navigate = useNavigate();
  const [lang, setLang] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const languages = ['English', 'हिंदी (Hindi)', 'മലയാളം (Malayalam)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)'];

  const handleSelectLanguage = (selected) => {
    setLang(selected.split(' ')[0]);
    setShowLanguageModal(false);
  };

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      
      {/* Outer container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:py-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-brand-border/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-dark hover:bg-slate-50 active-scale"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Account Profile</h2>
              <p className="text-[10px] text-brand-gray font-bold tracking-wider uppercase mt-0.5">Preferences & Security</p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT PANEL: User Identity Avatar & Savings score dial (Spans 1 col) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs text-center flex flex-col items-center animate-scale-in">
              <div className="w-18 h-18 rounded-full bg-brand-blue text-white font-extrabold text-xl flex items-center justify-center shadow-md border-4 border-slate-50 mb-3 animate-pulse-border">
                {user.avatar}
              </div>
              
              <h3 className="text-base font-black text-brand-dark">{user.name}</h3>
              <p className="text-xs font-semibold text-brand-gray mt-0.5">+91 {user.phone}</p>
              
              <span className="text-[10px] bg-slate-50 text-brand-gray font-bold px-3.5 py-1.5 rounded-full border border-brand-border mt-3 shadow-2xs">
                UPI ID: {user.upi}
              </span>
            </div>

            {/* CRED-style Savings Score Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 text-white shadow-md border border-slate-850 flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div>
                <span className="text-[8px] font-black text-indigo-400 bg-indigo-950/60 border border-indigo-900/40 px-2 py-0.5 rounded uppercase tracking-wider">
                  Chit Saving Score
                </span>
                <h4 className="text-xl font-black text-white mt-2 flex items-baseline gap-1">
                  980 <span className="text-[10px] text-brand-success font-bold">Top Tier</span>
                </h4>
                <p className="text-[9.5px] text-slate-400 mt-1 max-w-[160px] leading-relaxed">Instalment contributions are cleared punctually.</p>
              </div>
              
              {/* Dial graphic */}
              <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" className="stroke-slate-700" strokeWidth="4.5" fill="transparent" />
                  <circle cx="32" cy="32" r="26" className="stroke-brand-success" strokeWidth="4.5" fill="transparent" strokeDasharray="163.2" strokeDashoffset="16.3" strokeLinecap="round" />
                </svg>
                <span className="absolute text-[10px] font-black">98%</span>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Preferences Options checklist & Logout buttons (Spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl border border-brand-border divide-y divide-brand-border overflow-hidden shadow-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
              
              {/* Bank Linkages summary */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-9.5 h-9.5 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 border border-blue-100">
                    <FiCreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">Linked Bank Accounts</span>
                    <span className="text-[10px] text-brand-gray font-semibold">State Bank of India •••• 3489</span>
                  </div>
                </div>
                <FiChevronRight className="text-brand-gray w-5 h-5" />
              </div>

              {/* Language switcher trigger */}
              <div 
                onClick={() => setShowLanguageModal(true)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9.5 h-9.5 rounded-xl bg-green-50 text-brand-success flex items-center justify-center shrink-0 border border-green-100">
                    <FiGlobe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">Preferred Language</span>
                    <span className="text-[10px] text-brand-gray font-semibold">Current: {lang}</span>
                  </div>
                </div>
                <FiChevronRight className="text-brand-gray w-5 h-5" />
              </div>

              {/* Security trust badge info */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-9.5 h-9.5 rounded-xl bg-indigo-50 text-brand-blue flex items-center justify-center shrink-0 border border-indigo-100">
                    <FiShield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">Trust & Verification</span>
                    <span className="text-[10px] text-brand-gray font-semibold">100% Secure Government Approved</span>
                  </div>
                </div>
                <FiChevronRight className="text-brand-gray w-5 h-5" />
              </div>

              {/* Customer support desk */}
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-9.5 h-9.5 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
                    <FiInfo className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-dark block">Help & Support Desk</span>
                    <span className="text-[10px] text-brand-gray font-semibold">Get assistance in local languages 24x7</span>
                  </div>
                </div>
                <FiChevronRight className="text-brand-gray w-5 h-5" />
              </div>

            </div>

            {/* Logout button */}
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

      {/* Language selection bottom sheet modal */}
      {showLanguageModal && (
        <div className="absolute inset-0 bg-slate-950/70 z-50 flex items-end justify-center p-0 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-t-[32px] p-6 space-y-4 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-3.5">
              <h3 className="font-extrabold text-sm text-brand-dark">Select Language</h3>
              <button 
                onClick={() => setShowLanguageModal(false)}
                className="text-xs font-bold text-brand-gray hover:text-brand-dark cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-1">
              {languages.map(language => (
                <button
                  key={language}
                  onClick={() => handleSelectLanguage(language)}
                  className={`w-full text-left p-3.5 rounded-xl font-bold text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    language.includes(lang) 
                      ? 'bg-blue-50 text-brand-blue' 
                      : 'hover:bg-slate-50 text-brand-dark'
                  }`}
                >
                  <span>{language}</span>
                  {language.includes(lang) && <div className="w-2.5 h-2.5 bg-brand-blue rounded-full"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
