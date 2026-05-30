import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiArrowLeft, FiDollarSign, FiPercent, FiTrendingDown, FiUser, FiCheckCircle } from 'react-icons/fi';

export default function Auction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, submitAuctionBid } = useContext(ChitContext);

  const group = groups.find(g => g.id === id);

  const [winnerName, setWinnerName] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If group not found, return fallback
  if (!group) {
    return (
      <div className="flex-grow flex items-center justify-center p-6 bg-brand-bg text-center">
        <div>
          <h2 className="text-lg font-bold">Group Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg">Go to Home</button>
        </div>
      </div>
    );
  }

  const totalMembers = group.members.length;
  const monthlyAmount = group.monthlyAmount;
  const poolSize = monthlyAmount * totalMembers;

  // Filter members who haven't won yet
  const pastWinners = group.auctionHistory ? group.auctionHistory.map(h => h.winnerName) : [];
  const eligibleMembers = group.members.filter(m => !pastWinners.includes(m.name));

  // Initialize winner selection
  useEffect(() => {
    if (eligibleMembers.length > 0 && !winnerName) {
      setWinnerName(eligibleMembers[0].name);
    }
  }, [eligibleMembers, winnerName]);

  // Live Auto Calculations
  const winningBidVal = Number(bidAmount) || 0;
  const discountVal = Math.max(0, poolSize - winningBidVal);
  
  const commModel = group.commissionModel || 'discount';
  const commissionVal = commModel === 'fixed'
    ? poolSize * (group.commissionPercentage / 100)
    : discountVal * (group.commissionPercentage / 100);

  const dividendPoolVal = Math.max(0, discountVal - commissionVal);
  const dividendPerMemberVal = dividendPoolVal / totalMembers;
  const nextMonthPayableVal = Math.max(0, monthlyAmount - dividendPerMemberVal);

  const handleSubmitAuction = (e) => {
    e.preventDefault();
    if (!winnerName) {
      alert('Please select a winning member');
      return;
    }
    if (winningBidVal <= 0 || winningBidVal > poolSize) {
      alert(`Please enter a valid bid amount between ₹1 and ₹${poolSize.toLocaleString('en-IN')}`);
      return;
    }

    setLoading(true);

    // Simulate API settlement delay
    setTimeout(() => {
      submitAuctionBid(group.id, winnerName, winningBidVal);
      setLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/group/${group.id}`);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:py-8">
        
        {/* Top Header Card */}
        <div className="max-w-2xl mx-auto bg-white border border-brand-border rounded-t-2xl px-6 py-5 flex items-center gap-3.5 shadow-2xs">
          <button 
            onClick={() => navigate(`/group/${group.id}`)}
            className="w-9 h-9 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark hover:bg-slate-100 active-scale"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-brand-dark truncate max-w-[200px] sm:max-w-md">Run Month {group.currentMonth} Auction</h2>
            <p className="text-[10px] text-brand-gray font-bold tracking-wider uppercase mt-0.5">
              {group.name} • {commModel === 'fixed' ? 'Fixed Pool' : 'Discount Based'} Model
            </p>
          </div>
        </div>

        {/* main Form Card */}
        <div className="max-w-2xl mx-auto bg-white border-x border-b border-brand-border rounded-b-2xl p-6 shadow-xs min-h-[420px] flex flex-col justify-between">
          
          {success ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 animate-scale-in">
              <div className="w-18 h-18 bg-green-50 rounded-full flex items-center justify-center text-brand-success mb-4 border border-brand-success/30 animate-bounce">
                <FiCheckCircle className="w-11 h-11" />
              </div>
              <h3 className="text-lg font-black text-brand-dark">Auction Settled!</h3>
              <p className="text-xs text-brand-gray mt-2 px-6">
                Month {group.currentMonth - 1} auction details saved. Members dividends distributed. Next month payable contributions updated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAuction} className="flex-grow flex flex-col justify-between gap-6">
              
              <div className="space-y-5">
                
                {/* Select Winner Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">1. Select Winning Member</label>
                  {eligibleMembers.length > 0 ? (
                    <div className="relative flex items-center">
                      <FiUser className="absolute left-3.5 text-brand-gray w-4.5 h-4.5" />
                      <select
                        value={winnerName}
                        onChange={(e) => setWinnerName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue"
                        required
                      >
                        {eligibleMembers.map(m => (
                          <option key={m.id} value={m.name}>{m.name} (+91 {m.phone})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-brand-danger text-xs font-bold">
                      All group members have already won a bid. Chit cycle complete!
                    </div>
                  )}
                </div>

                {/* Enter Bid Amount Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">2. Enter Winning Bid (₹)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-brand-dark font-black text-xs">₹</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 50000"
                      max={poolSize}
                      className="w-full pl-8 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-extrabold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-brand-gray font-bold">
                    Maximum possible bid: <span className="text-brand-dark font-extrabold">₹{poolSize.toLocaleString('en-IN')}</span> (Total monthly pot size)
                  </p>
                </div>

                {/* Calculation Outputs Panel (CRED/fintech-style card) */}
                <div className="bg-brand-bg rounded-2xl p-5 border border-brand-border shadow-2xs space-y-3.5 animate-slide-up">
                  <h4 className="font-extrabold text-xs text-brand-gray uppercase tracking-wider border-b border-brand-border/60 pb-2">
                    Calculation Engine Breakdown
                  </h4>

                  {/* Calculations breakdown details */}
                  <div className="divide-y divide-brand-border/60 text-xs text-brand-dark space-y-2">
                    
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-brand-gray font-semibold">Total Monthly Pool Size</span>
                      <span className="font-extrabold">₹{poolSize.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-brand-gray font-semibold">Auction Winning Bid</span>
                      <span className="font-extrabold text-brand-blue">₹{winningBidVal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-brand-gray font-semibold flex items-center gap-1">
                        Discount Given <span className="text-[9px] text-brand-gray">(Pool - Bid)</span>
                      </span>
                      <span className="font-extrabold">₹{discountVal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-brand-gray font-semibold flex items-center gap-1">
                        Organizer Commission <span className="text-[9px] bg-slate-100 text-brand-gray px-1.5 py-0.5 rounded font-bold">({group.commissionPercentage}% • {commModel === 'fixed' ? 'Fixed Pool' : 'Discount Based'})</span>
                      </span>
                      <span className="font-extrabold text-brand-danger">₹{commissionVal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-brand-gray font-semibold">Remaining Dividend Pool</span>
                      <span className="font-extrabold">₹{dividendPoolVal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-brand-gray font-semibold">Dividend / Member</span>
                      <span className="font-extrabold text-brand-success">₹{dividendPerMemberVal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-t border-brand-border/80 text-sm font-black">
                      <span className="text-brand-dark uppercase tracking-wide">Next Month Payable</span>
                      <span className="text-brand-blue">₹{nextMonthPayableVal.toLocaleString('en-IN')}</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Confirm submit trigger button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || eligibleMembers.length === 0}
                  className="w-full py-4 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-bold text-xs shadow-md active-scale transition-all flex items-center justify-center gap-2 tap-highlight-transparent cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Confirm & Settle Auction</span>
                      <FiTrendingDown className="w-4.5 h-4.5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
