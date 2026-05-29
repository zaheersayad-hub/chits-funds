import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiPlus, FiAlertCircle, FiTrendingUp, FiLayers, FiCalendar, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function Dashboard() {
  const { user, groups } = useContext(ChitContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-brand-bg text-center">
        <FiAlertCircle className="w-12 h-12 text-brand-blue mb-2" />
        <h2 className="text-lg font-bold">Not Logged In</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg">Go to Login</button>
      </div>
    );
  }

  // Calculations
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

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      
      {/* Dashboard container with max width limit for neat grid display on ultra-wides */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:py-8 space-y-6">
        
        {/* Top Hello & Header */}
        <div className="flex items-center justify-between pb-2 border-b border-brand-border/40 animate-fade-in">
          <div className="flex items-center gap-3.5">
            {/* Small avatar for mobile header; hidden on desktop as we have the sidebar */}
            <div className="md:hidden w-11 h-11 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-white">
              {user.avatar}
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Group Savings Overview</p>
              <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">
                Hello, {user.name.split(' ')[0]} 👋
              </h2>
            </div>
          </div>

          {/* Desktop quick create button header */}
          <button 
            onClick={() => navigate('/create-group')}
            className="hidden md:flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-blue text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-blue-hover active-scale transition-all"
          >
            <FiPlus className="w-4.5 h-4.5" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT AREA: Monthly Collection Progress & Groups List (Spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Monthly Collection Progress Card */}
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

              {/* Card Footer actions */}
              <div className="mt-5 pt-4 border-t border-brand-border flex items-center justify-between text-xs font-bold text-brand-blue">
                <span className="text-brand-gray font-medium">All group savings collections are online</span>
                <Link to="/payments" className="flex items-center gap-1 hover:underline">
                  View Transactions <FiArrowRight />
                </Link>
              </div>
            </div>

            {/* Active Chit Groups Section */}
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Active Chit Groups</h3>
                <Link to="/groups" className="text-xs font-bold text-brand-blue hover:underline">
                  View All Groups
                </Link>
              </div>

              {/* Active Groups Responsive grid layout: 2 columns on desktop/tablet, 1 on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group, idx) => {
                  const progress = Math.round((group.currentMonth / group.totalMonths) * 100);
                  const userMember = group.members.find(m => m.name === user.name);
                  const isUserPending = userMember?.status === 'Pending';
                  const lastWinner = group.winnerHistory[group.winnerHistory.length - 1];

                  return (
                    <div 
                      key={group.id}
                      className="bg-white rounded-2xl shadow-2xs border border-brand-border overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Group mini gradient header */}
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

                        {/* Card body content */}
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

                          {/* Cycle Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-brand-gray">
                              <span>Cycle Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden">
                              <div className="bg-brand-blue h-full rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>

                          {/* Last Winner box */}
                          {lastWinner && (
                            <div className="bg-slate-50 border border-brand-border rounded-xl px-3 py-2 text-[10px] text-brand-dark flex items-center justify-between">
                              <div>
                                <span className="text-brand-gray block">Last Winner (M{lastWinner.month})</span>
                                <span className="font-bold">{lastWinner.name}</span>
                              </div>
                              <span className="font-extrabold text-brand-blue">₹{lastWinner.bidAmount.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
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
                            Pay ₹{group.monthlyAmount.toLocaleString('en-IN')}
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

          {/* RIGHT AREA: Quick Stats Panel & Desktop Actions Sidebar (Spans 1 col) */}
          <div className="space-y-6">
            
            {/* Quick Stats Grid Card */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider pb-2 border-b border-brand-border/60">
                Quick Portfolio
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                
                {/* Chit Groups Link */}
                <Link to="/groups" className="bg-brand-bg rounded-xl p-4 flex items-center gap-3.5 hover:bg-slate-100 transition-colors active-scale">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 border border-blue-100">
                    <FiLayers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider">Chit Groups</span>
                    <h4 className="text-sm font-extrabold text-brand-dark mt-0.5">{totalActiveGroups} Active</h4>
                  </div>
                </Link>

                {/* Pending Dues Link */}
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

            {/* Desktop-only Info / Help Banner Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 text-white shadow-md border border-slate-800 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span className="text-[9px] font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-full tracking-wider uppercase inline-block">
                Trust & Security
              </span>
              <h4 className="text-sm font-extrabold mt-3">Government Registered Chits</h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                All chit group operations, auction records, and payables conform to standard chit fund regulatory frameworks. Security deposits are linked dynamically with your banks.
              </p>
              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-indigo-300">
                <span>Verification ID verified</span>
                <Link to="/profile" className="hover:underline flex items-center gap-0.5">Learn more <FiArrowRight /></Link>
              </div>
            </div>

          </div>

        </div>

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
