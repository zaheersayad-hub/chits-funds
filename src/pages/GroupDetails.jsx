import React, { useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiArrowLeft, FiCalendar, FiUsers, FiDollarSign, FiAward, FiCheckCircle, FiClock, FiChevronRight } from 'react-icons/fi';

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups } = useContext(ChitContext);

  const group = groups.find(g => g.id === id);

  if (!group) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-brand-bg text-center">
        <FiClock className="w-12 h-12 text-brand-danger mb-2" />
        <h2 className="text-lg font-bold">Group Not Found</h2>
        <Link to="/dashboard" className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg">Back to Home</Link>
      </div>
    );
  }

  // Calculate statistics
  const totalPot = group.monthlyAmount * group.members.length;
  const paidCount = group.members.filter(m => m.status === 'Paid').length;
  const pendingCount = group.members.length - paidCount;
  const collectedAmount = paidCount * group.monthlyAmount;
  const progressPercentage = Math.round((group.currentMonth / group.totalMonths) * 100);

  // Get last winner
  const lastWinner = group.winnerHistory && group.winnerHistory.length > 0 
    ? group.winnerHistory[group.winnerHistory.length - 1] 
    : null;

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      
      {/* Outer container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:py-8 space-y-6">
        
        {/* Top Header Card */}
        <div className="flex items-center justify-between pb-2 border-b border-brand-border/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/groups')}
              className="w-9 h-9 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-dark hover:bg-slate-50 active-scale"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-brand-dark truncate tracking-tight max-w-[280px] sm:max-w-md">{group.name}</h2>
              <p className="text-[10px] text-brand-gray font-bold tracking-wider uppercase mt-0.5">Group ID: {group.id}</p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT PANEL: Banner details, month progress & winner cards (Spans 1 or 2 cols depending on breakpoint) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Gradient Group Card */}
            <div className={`bg-gradient-to-r ${group.gradient} rounded-2xl p-6 text-white shadow-md animate-scale-in`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <span className="text-[9px] font-black uppercase bg-white/20 px-2.5 py-1 rounded-full tracking-wider">
                    Chit Cycle Active
                  </span>
                  <h3 className="text-2xl font-black mt-3 tracking-tight">{group.name}</h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[9px] opacity-80 block font-bold uppercase tracking-wider">Subscribed Monthly Pot</span>
                  <span className="text-2xl font-black">₹{totalPot.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Installment breakdown stats */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/20 text-xs">
                <div>
                  <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Installment / Mo</span>
                  <span className="font-extrabold text-sm mt-0.5 block">₹{group.monthlyAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-center">
                  <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Members Total</span>
                  <span className="font-extrabold text-sm mt-0.5 block">{group.members.length} Users</span>
                </div>
                <div className="text-right">
                  <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Active Cycle</span>
                  <span className="font-extrabold text-sm mt-0.5 block">M{group.currentMonth} of {group.totalMonths}</span>
                </div>
              </div>
            </div>

            {/* Current month collection meter */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex justify-between items-center text-xs font-bold text-brand-dark mb-3">
                <span>Month {group.currentMonth} Collection Status</span>
                <span className="text-brand-blue">{paidCount} Paid / {group.members.length} Members</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden flex">
                <div 
                  className="bg-brand-success h-full rounded-full transition-all duration-500"
                  style={{ width: `${(paidCount / group.members.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] font-bold text-brand-gray mt-3 pt-1">
                <span>Collected: ₹{collectedAmount.toLocaleString('en-IN')}</span>
                <span>Pending: ₹{(pendingCount * group.monthlyAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Auction Winner Card */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-4.5 flex items-center gap-1.5 border-b border-brand-border/60 pb-2">
                <FiAward className="text-brand-blue w-4.5 h-4.5" />
                Latest Auction Winner
              </h4>

              {lastWinner ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-brand-dark">{lastWinner.name}</span>
                    <span className="text-[10px] text-brand-gray block mt-1">Cycle Month {lastWinner.month} Winner • Payout cleared on {lastWinner.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-success block">₹{lastWinner.payout.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-brand-gray font-bold block">Bid: ₹{lastWinner.bidAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-brand-gray font-medium">
                  No auctions completed yet. Month 1 bidding starts soon!
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: Members list Payment Checklist (Spans 1 col) */}
          <div className="lg:col-span-1 space-y-4">
            
            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider px-1">
              Member payments (Month {group.currentMonth})
            </h4>

            {/* List box */}
            <div className="bg-white rounded-2xl border border-brand-border divide-y divide-brand-border overflow-hidden shadow-xs animate-slide-up" style={{ animationDelay: '0.15s' }}>
              {group.members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-bg text-brand-dark font-extrabold text-xs flex items-center justify-center border border-brand-border shrink-0 shadow-2xs">
                      {member.avatar}
                    </div>
                    <div className="truncate max-w-[120px] sm:max-w-xs">
                      <p className="text-xs font-bold text-brand-dark truncate">{member.name}</p>
                      <p className="text-[9px] text-brand-gray font-bold mt-0.5 tracking-wide uppercase">UPI registered</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.status === 'Paid' ? (
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[9px] font-black text-brand-success bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-0.5 border border-green-100">
                          <FiCheckCircle /> Paid
                        </span>
                        <span className="text-[8px] text-brand-gray font-semibold mt-0.5">{member.paymentDate}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-0.5 border border-amber-100">
                          <FiClock /> Pending
                        </span>
                        <button
                          onClick={() => navigate('/payments', { state: { groupId: group.id, memberId: member.id } })}
                          className="text-[9px] font-extrabold text-white bg-brand-blue hover:bg-brand-blue-hover px-3 py-1.5 rounded-lg active-scale transition-colors shadow-2xs"
                        >
                          Collect
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
