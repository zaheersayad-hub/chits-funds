import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiPhone, FiLock, FiCheckCircle } from 'react-icons/fi';

export default function Login() {
  const { login, user } = useContext(ChitContext);
  const navigate = useNavigate();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate sending OTP (Google Pay style)
    setTimeout(() => {
      setLoading(false);
      setShowOtp(true);
    }, 1200);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace back-focus
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Please enter 4-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');

    // Simulate OTP verification (Correct code is 1234 or any code for testing)
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      
      // Success tick sound / animation delay
      setTimeout(() => {
        login(phoneNumber);
        navigate('/dashboard');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-white flex flex-col justify-between px-6 pt-4 pb-8 animate-fade-in">
      
      {/* Top Section: Header & Illustration */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Fintech Illustration */}
        <div className="w-56 h-56 mb-8 text-brand-blue flex items-center justify-center relative">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background elements */}
            <circle cx="100" cy="100" r="80" fill="url(#blue-gradient)" fillOpacity="0.08" />
            <circle cx="100" cy="100" r="60" fill="url(#blue-gradient)" fillOpacity="0.12" />
            
            {/* Circular network arrows representing chit group */}
            <circle cx="100" cy="100" r="45" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 6" className="animate-spin" style={{ animationDuration: '60s' }} />
            
            {/* Group silhouettes */}
            <circle cx="70" cy="75" r="12" fill="#93C5FD" />
            <circle cx="130" cy="75" r="12" fill="#93C5FD" />
            <circle cx="100" cy="140" r="14" fill="#3B82F6" />
            
            {/* Money bag / Shield in center */}
            <rect x="85" y="85" width="30" height="30" rx="15" fill="#2563EB" />
            <path d="M96 93.5H104M96 97H104M96 100.5H104" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="100" cy="100" r="2" fill="white" />
            
            {/* Floating coins */}
            <circle cx="60" cy="120" r="6" fill="#FBBF24" />
            <circle cx="140" cy="120" r="8" fill="#FBBF24" />
            <circle cx="100" cy="50" r="5" fill="#FBBF24" />
            
            <defs>
              <linearGradient id="blue-gradient" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563EB" />
                <stop offset="1" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
          </svg>
          {/* Subtle logo tagline floating */}
          <div className="absolute bottom-2 bg-brand-blue text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
            TRUSTED BY 10L+ SAVERS
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">
            {showOtp ? 'Enter OTP' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-brand-gray mt-2 px-6">
            {showOtp 
              ? `We sent a 4-digit code to +91 ${phoneNumber}` 
              : 'Grow your savings safely with verified local chit groups'}
          </p>
        </div>

        {/* Form area */}
        <div className="w-full max-w-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-brand-danger text-brand-danger text-xs font-semibold rounded-r-md animate-scale-in">
              {error}
            </div>
          )}

          {verified ? (
            <div className="flex flex-col items-center justify-center p-6 text-center animate-scale-in">
              <FiCheckCircle className="w-16 h-16 text-brand-success mb-2 animate-bounce" />
              <h2 className="text-lg font-bold text-brand-dark">Logged in Successfully!</h2>
              <p className="text-xs text-brand-gray mt-1">Taking you to your dashboard...</p>
            </div>
          ) : !showOtp ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Mobile Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none text-brand-dark font-semibold text-sm">
                    <span>🇮🇳</span>
                    <span>+91</span>
                    <span className="h-4 w-px bg-brand-border"></span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10 digit number"
                    className="w-full pl-18 pr-4 py-3.5 bg-brand-bg border border-brand-border rounded-xl font-semibold text-sm tracking-widest text-brand-dark outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold text-sm shadow-md hover:bg-brand-blue-hover transition-all flex items-center justify-center gap-2 tap-highlight-transparent active-scale disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <FiPhone className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-dark uppercase tracking-wider text-center block">Verification PIN</label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 bg-brand-bg border border-brand-border rounded-xl text-center font-extrabold text-xl text-brand-dark focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                      required
                    />
                  ))}
                </div>
                <p className="text-[11px] text-center text-brand-gray mt-1">
                  Default OTP code is <span className="font-bold text-brand-blue">1234</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold text-sm shadow-md hover:bg-brand-blue-hover transition-all flex items-center justify-center gap-2 tap-highlight-transparent active-scale disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Verify & Proceed</span>
                      <FiLock className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowOtp(false);
                    setOtp(['', '', '', '']);
                  }}
                  className="w-full py-3 bg-transparent text-brand-blue font-bold text-xs text-center hover:underline active-scale tap-highlight-transparent"
                >
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom section: Safety disclaimer */}
      <div className="mt-8 text-center text-[10px] text-brand-gray flex flex-col items-center gap-1 shrink-0">
        <div className="flex items-center gap-1 font-semibold text-brand-dark">
          <svg className="w-3.5 h-3.5 text-brand-success fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          100% Government Registered & Insured
        </div>
        <span>By logging in, you agree to our Terms & Privacy Policy</span>
      </div>
    </div>
  );
}
