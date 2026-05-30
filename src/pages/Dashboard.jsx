import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiPlus, FiAlertCircle, FiTrendingUp, FiLayers, FiCalendar, FiArrowRight, FiCheckCircle, FiDollarSign, FiActivity, FiBriefcase } from 'react-icons/fi';

export default function Dashboard() {
  const { user, groups } = useContext(ChitContext);
  const navigate = useNavigate();
  const [dashboardMode, setDashboardMode] = useState('member'); // member | organizer

  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-brand-bg text-center">
        <FiAlertCircle className="w-12 h-12 text-brand-blue mb-2" />
        <h2 className="text-lg font-bold">Not Logged In</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg">Go to Login</button>
      </div>
    );
  }

  // --- Dynamic Calculation Engine Computations ---
  
  // 1. Member view calculations
  const totalActiveGroups = groups.length;
  let totalMonthlyGoal = 0;
  let totalCollectedThisMonth = 0;
  let userPendingCount = 0;

  groups.forEach(group => {
    const groupGoal = group.monthlyAmount * group.members.length;
    totalMonthlyGoal += groupGoal;
    
    group.members.forEach(member => {
      if (member.status === 'Paid') {
        totalCollectedThisMonth += group.monthlyAmount;
      }
      if (member.name === user.name && member.status === 'Pending') {
        userPendingCount += 1;
      }
    });
  });

  const collectionPercentage = totalMonthlyGoal > 0 
    ? Math.round((totalCollectedThisMonth / totalMonthlyGoal) * 100) 
    : 0;

  // 2. Organizer dashboard calculations
  let totalCommissionEarned = 0;
  let commissionThisMonth = 0;
  let totalDiscountGiven = 0;
  let totalDividendDistributed = 0;
  let totalPoolVolume = 0;
  
  const commissionByGroupList = [];
  const commissionHistoryList = [];

  groups.forEach(group => {
    let groupCommissionSum = 0;
    const totalMembers = group.members.length;
    const monthlyAmount = group.monthlyAmount;
    
    // Add to total pool volume (poolSize * active months completed)
    const groupPoolSize = monthlyAmount * totalMembers;
    totalPoolVolume += groupPoolSize * group.currentMonth;

    if (group.auctionHistory && group.auctionHistory.length > 0) {
      group.auctionHistory.forEach(history => {
        totalCommissionEarned += history.commission;
        groupCommissionSum += history.commission;
        totalDiscountGiven += history.discount;
        totalDividendDistributed += history.dividendPool;

        // Check if auction was completed in May 2026 (current month context starts with 2026-05)
        if (history.date && history.date.startsWith('2026-05')) {
          commissionThisMonth += history.commission;
        }

        commissionHistoryList.push({
          id: `ch_${group.id}_${history.month}`,
          groupName: group.name,
          month: history.month,
          bidAmount: history.bidAmount,
          discount: history.discount,
          commission: history.commission,
          dividendPerMember: history.dividendPerMember,
          commissionModel: group.commissionModel,
          date: history.date
        });
      });
    }

    commissionByGroupList.push({
      groupId: group.id,
      groupName: group.name,
      gradient: group.gradient,
      totalCommission: groupCommissionSum,
      totalMonths: group.totalMonths,
      currentMonth: group.currentMonth,
      commissionModel: group.commissionModel
    });
  });

  // Sort history chronologically (latest first)
  commissionHistoryList.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:py-8 space-y-6">
        
        {/* Toggle View & Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border/65 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="md:hidden w-11 h-11 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-white">
              {user.avatar}
            </div>
            <div>
              <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">Savings & Auction Engine</p>
              <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">
                Welcome, {user.name.split(' ')[0]} 👋
              </h2>
            </div>
          </div>

          {/* Mode Switcher Selector */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white border border-brand-border rounded-xl flex shadow-2xs">
              <button
                onClick={() => setDashboardMode('member')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  dashboardMode === 'member' ? 'bg-brand-blue text-white shadow-2xs' : 'text-brand-gray hover:bg-slate-50'
                }`}
              >
                Member view
              </button>
              <button
                onClick={() => setDashboardMode('organizer')}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  dashboardMode === 'organizer' ? 'bg-brand-blue text-white shadow-2xs' : 'text-brand-gray hover:bg-slate-50'
                }`}
              >
                <FiBriefcase className="w-3.5 h-3.5" />
                Organizer mode
              </button>
            </div>

            {/* Create CTA Button (Desktop only) */}
            <button 
              onClick={() => navigate('/create-group')}
              className="hidden md:flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-blue text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-brand-blue-hover active-scale transition-colors"
            >
              <FiPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {/* ==================== VIEW 1: MEMBER VIEW ==================== */}
        {dashboardMode === 'member' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Left Area (Cols span 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Monthly Collections indicator */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-border animate-slide-up">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand-gray flex items-center gap-1.5 uppercase tracking-wider">
                      <FiTrendingUp className="text-brand-blue w-4.5 h-4.5" />
                      Monthly Collections Tracker
                    </p>
                    <h3 className="text-3xl font-black text-brand-dark mt-2 tracking-tight">
                      ₹{totalCollectedThisMonth.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-[11px] font-semibold text-brand-gray mt-1">
                      Goal: ₹{totalMonthlyGoal.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="bg-blue-50 text-brand-blue text-xs font-extrabold px-3 py-1.5 rounded-xl border border-blue-100 shadow-2xs">
                    {collectionPercentage}% Collected
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-brand-bg rounded-full mt-5 overflow-hidden flex">
                  <div 
                    className="bg-brand-blue h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${collectionPercentage}%` }}
                  ></div>
                </div>

                <div className="mt-5 pt-4 border-t border-brand-border flex items-center justify-between text-xs font-bold text-brand-blue">
                  <span className="text-brand-gray font-medium">All group savings collections are online</span>
                  <Link to="/payments" className="flex items-center gap-1 hover:underline">
                    View Transactions <FiArrowRight />
                  </Link>
                </div>
              </div>

              {/* Active groups list */}
              <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Active Chit Groups</h3>
                  <Link to="/groups" className="text-xs font-bold text-brand-blue hover:underline">
                    View All Groups
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((group, idx) => {
                    const progress = Math.round((group.currentMonth / group.totalMonths) * 100);
                    const userMember = group.members.find(m => m.name === user.name);
                    const isUserPending = userMember?.status === 'Pending';
                    const lastWinnerVal = group.auctionHistory && group.auctionHistory.length > 0
                      ? group.auctionHistory[group.auctionHistory.length - 1]
                      : null;

                    return (
                      <div 
                        key={group.id}
                        className="bg-white rounded-2xl shadow-2xs border border-brand-border overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className={`bg-gradient-to-r ${group.gradient} px-4 py-3.5 text-white flex items-center justify-between`}>
                            <div>
                              <h4 className="font-extrabold text-xs tracking-tight">{group.name}</h4>
                              <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider">
                                ₹{(group.monthlyAmount * group.members.length).toLocaleString('en-IN')} Total Pot
                              </p>
                            </div>
                            <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                              M{group.currentMonth}/{group.totalMonths}
                            </span>
                          </div>

                          <div className="p-4 space-y-3.5">
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-brand-dark">
                              <div>
                                <span className="text-[9px] font-semibold text-brand-gray block uppercase">Contribution</span>
                                <span className="font-extrabold">₹{group.monthlyAmount.toLocaleString('en-IN')}/mo</span>
                              </div>
                              <div>
                                <span className="text-[9px] font-semibold text-brand-gray block uppercase">Next Bidding</span>
                                <span className="font-bold">15th June</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-brand-gray">
                                <span>Cycle Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden">
                                <div className="bg-brand-blue h-full rounded-full" style={{ width: `${progress}%` }}></div>
                              </div>
                            </div>

                            {lastWinnerVal && (
                              <div className="bg-slate-50 border border-brand-border rounded-xl px-3 py-2 text-[10px] text-brand-dark flex items-center justify-between">
                                <div>
                                  <span className="text-brand-gray block">Last Winner (M{lastWinnerVal.month})</span>
                                  <span className="font-bold">{lastWinnerVal.winnerName}</span>
                                </div>
                                <span className="font-extrabold text-brand-blue">₹{lastWinnerVal.bidAmount.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 pt-0 flex items-center justify-between gap-2.5">
                          <Link 
                            to={`/group/${group.id}`}
                            className="text-[10px] font-extrabold text-brand-blue bg-blue-50/50 hover:bg-blue-50 px-3 py-2.5 rounded-xl text-center flex-grow transition-all"
                          >
                            Details
                          </Link>

                          {isUserPending ? (
                            <button
                              onClick={() => navigate('/payments', { state: { groupId: group.id, memberId: userMember.id } })}
                              className="text-[10px] font-bold text-white bg-brand-blue hover:bg-brand-blue-hover px-4 py-2.5 rounded-xl text-center shrink-0 transition-colors animate-pulse-border border border-transparent shadow-xs active-scale"
                            >
                              Pay ₹{group.payableAmount.toLocaleString('en-IN')}
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-brand-success bg-green-50 px-3 py-2.5 rounded-xl text-center shrink-0 flex items-center gap-1 border border-green-100 shadow-2xs">
                              <FiCheckCircle /> Paid
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Area (Col span 1) */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-border/60">
                  Quick Portfolio
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  
                  <Link to="/groups" className="bg-brand-bg rounded-xl p-4 flex items-center gap-3.5 hover:bg-slate-100 transition-colors active-scale">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 border border-blue-100">
                      <FiLayers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider">Chit Groups</span>
                      <h4 className="text-sm font-extrabold text-brand-dark mt-0.5">{totalActiveGroups} Active</h4>
                    </div>
                  </Link>

                  <Link to="/payments" className={`bg-brand-bg rounded-xl p-4 flex items-center gap-3.5 hover:bg-slate-100 transition-colors active-scale ${userPendingCount > 0 ? 'border border-amber-200' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${userPendingCount > 0 ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-green-50 text-brand-success border-green-100'}`}>
                      {userPendingCount > 0 ? <FiAlertCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider">Your Pending</span>
                      <h4 className={`text-sm font-extrabold mt-0.5 ${userPendingCount > 0 ? 'text-amber-600' : 'text-brand-success'}`}>
                        {userPendingCount > 0 ? `${userPendingCount} Insts Due` : 'All Settled'}
                      </h4>
                    </div>
                  </Link>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== VIEW 2: ORGANIZER EARNINGS DASHBOARD ==================== */}
        {dashboardMode === 'organizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Left Area: Core Analytics & History Logs (Spans 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Analytics Section Grid Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-scale-in">
                
                {/* Net Earnings / Total Commission */}
                <div className="bg-white rounded-2xl p-4 border border-brand-border shadow-2xs flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Net Earnings</span>
                  <h4 className="text-base font-black text-brand-blue mt-2">₹{totalCommissionEarned.toLocaleString('en-IN')}</h4>
                  <span className="text-[8px] bg-blue-50 text-brand-blue px-1.5 py-0.5 rounded-sm font-bold block mt-1.5 w-max">Organizer Cut</span>
                </div>

                {/* Total Pool Volume managed */}
                <div className="bg-white rounded-2xl p-4 border border-brand-border shadow-2xs flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Pool Volume</span>
                  <h4 className="text-base font-black text-brand-dark mt-2">₹{totalPoolVolume.toLocaleString('en-IN')}</h4>
                  <span className="text-[8px] bg-slate-100 text-brand-gray px-1.5 py-0.5 rounded-sm font-bold block mt-1.5 w-max">Active Value</span>
                </div>

                {/* Total Discounts Given */}
                <div className="bg-white rounded-2xl p-4 border border-brand-border shadow-2xs flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Discounts Given</span>
                  <h4 className="text-base font-black text-brand-danger mt-2">₹{totalDiscountGiven.toLocaleString('en-IN')}</h4>
                  <span className="text-[8px] bg-red-50 text-brand-danger px-1.5 py-0.5 rounded-sm font-bold block mt-1.5 w-max">Bid Reductions</span>
                </div>

                {/* Total Dividend Distributed */}
                <div className="bg-white rounded-2xl p-4 border border-brand-border shadow-2xs flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Dividends Paid</span>
                  <h4 className="text-base font-black text-brand-success mt-2">₹{totalDividendDistributed.toLocaleString('en-IN')}</h4>
                  <span className="text-[8px] bg-green-50 text-brand-success px-1.5 py-0.5 rounded-sm font-bold block mt-1.5 w-max">Member Yield</span>
                </div>

              </div>

              {/* Commission Earnings History Log */}
              <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider pb-2.5 border-b border-brand-border/60 mb-4 flex items-center gap-1.5">
                  <FiActivity className="text-brand-blue" />
                  Commission History Log
                </h3>

                <div className="divide-y divide-brand-border max-h-[360px] overflow-y-auto no-scrollbar border border-brand-border rounded-xl">
                  {commissionHistoryList.length > 0 ? (
                    commissionHistoryList.map(history => (
                      <div key={history.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <span className="font-extrabold text-xs text-brand-dark block leading-tight">{history.groupName}</span>
                          <span className="text-[10px] text-brand-gray block mt-1">
                            Month {history.month} Auction Completed • Bid: ₹{history.bidAmount.toLocaleString('en-IN')} • {history.commissionModel === 'fixed' ? 'Fixed Pool' : 'Discount Based'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-brand-blue block">
                            + ₹{history.commission.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] text-brand-gray font-bold block mt-0.5">{history.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-brand-gray font-medium">
                      No auctions settled yet. Run group auctions to generate organizer cut.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Area: Earnings Breakdown by Group (Spans 1 col) */}
            <div className="space-y-6">
              
              {/* Quick Commission stats summary */}
              <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-border/60 mb-4">
                  Earnings Summary
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider block">Commission Earned This Month</span>
                    <h4 className="text-2xl font-black text-brand-blue mt-1">₹{commissionThisMonth.toLocaleString('en-IN')}</h4>
                  </div>
                  <div>
                    <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider block">Commission yield / Auction Average</span>
                    <h4 className="text-sm font-extrabold text-brand-dark mt-1">
                      ₹{commissionHistoryList.length > 0 
                        ? Math.round(totalCommissionEarned / commissionHistoryList.length).toLocaleString('en-IN')
                        : '0'
                      }
                    </h4>
                  </div>
                </div>
              </div>

              {/* Commission yield breakdown by groups */}
              <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider pb-2.5 border-b border-brand-border/60 mb-3.5">
                  Earnings Contribution By Group
                </h3>

                <div className="space-y-4">
                  {commissionByGroupList.map(group => {
                    const groupShare = totalCommissionEarned > 0 
                      ? Math.round((group.totalCommission / totalCommissionEarned) * 100) 
                      : 0;

                    return (
                      <div key={group.groupId} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="truncate max-w-[150px]">
                            <span className="font-bold text-brand-dark block truncate">{group.groupName}</span>
                            <span className="text-[8px] text-brand-gray font-bold block mt-0.5">
                              {group.commissionModel === 'fixed' ? 'Fixed Pool' : 'Discount Based'}
                            </span>
                          </div>
                          <span className="font-extrabold text-brand-blue shrink-0">₹{group.totalCommission.toLocaleString('en-IN')}</span>
                        </div>
                        
                        {/* Progress display */}
                        <div className="flex items-center gap-2 text-[9px] text-brand-gray font-bold">
                          <div className="flex-grow h-1.5 bg-brand-bg rounded-full overflow-hidden">
                            <div className="bg-brand-blue h-full rounded-full" style={{ width: `${groupShare}%` }}></div>
                          </div>
                          <span className="shrink-0">{groupShare}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Floating Action Button (FAB) - Visible on mobile only */}
      <button 
        onClick={() => navigate('/create-group')}
        className="md:hidden absolute bottom-22 right-5 w-14 h-14 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-lg active-scale z-50 pointer-events-auto cursor-pointer"
        aria-label="Create New Chit Group"
      >
        <FiPlus className="w-7 h-7" />
      </button>

    </div>
  );
}
