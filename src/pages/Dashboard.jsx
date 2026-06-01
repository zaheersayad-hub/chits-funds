import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { calculateGlobalMetrics, calculateGroupMetrics } from '../utils/calcEngine';
import { FiPlus, FiUsers, FiDollarSign, FiAward, FiClock, FiActivity, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function Dashboard() {
  const { user, groups, payments, winners } = useContext(ChitContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-brand-bg text-center">
        <h2 className="text-lg font-bold text-brand-dark">Not Logged In</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2.5 bg-brand-blue text-white rounded-xl font-bold">Go to Login</button>
      </div>
    );
  }

  // Calculate metrics using the simplified engine
  const metrics = calculateGlobalMetrics(groups, payments, winners);

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 space-y-6">
        
        {/* Welcome Section */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-brand-border/60">
          <div>
            <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">Chit Collection Register</p>
            <h2 className="text-xl font-black text-brand-dark tracking-tight">Hello, {user.name} 👋</h2>
          </div>
          <button 
            onClick={() => navigate('/create-group')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-blue text-white font-bold text-xs rounded-xl shadow-md active-scale transition-colors cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" />
            <span>New Group</span>
          </button>
        </div>

        {/* Global Collections Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs flex flex-col justify-between">
            <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Total Groups</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-lg font-black text-brand-dark">{metrics.totalGroups} Active</h3>
              <FiActivity className="w-4 h-4 text-brand-blue" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs flex flex-col justify-between">
            <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Total Members</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-lg font-black text-brand-dark">{metrics.totalMembers} Registered</h3>
              <FiUsers className="w-4 h-4 text-brand-blue" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs flex flex-col justify-between">
            <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Collected This Month</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-lg font-black text-brand-success">₹{metrics.totalCollectedThisMonth.toLocaleString('en-IN')}</h3>
              <FiCheckCircle className="w-4 h-4 text-brand-success" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs flex flex-col justify-between">
            <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Pending Collections</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-lg font-black text-brand-danger">₹{metrics.totalPendingCollections.toLocaleString('en-IN')}</h3>
              <FiClock className="w-4 h-4 text-brand-danger" />
            </div>
          </div>

        </div>

        {/* Group Cards Listing */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider">My Chit Groups</h3>
            <Link to="/groups" className="text-xs font-bold text-brand-blue hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map(group => {
              const groupMetrics = calculateGroupMetrics(group, payments, winners);
              const progress = Math.round((groupMetrics.paidCount / group.totalMembers) * 100) || 0;
              
              // Find monthly winner for currentMonth
              const winnerRecord = winners.find(w => w.groupId === group.id && w.month === group.currentMonth);

              return (
                <div 
                  key={group.id} 
                  className="bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Top Bar */}
                  <div className={`bg-gradient-to-r ${group.gradient} p-4 text-white flex items-center justify-between`}>
                    <div>
                      <h4 className="font-extrabold text-sm tracking-tight">{group.name}</h4>
                      <p className="text-[10px] text-white/90 font-bold uppercase tracking-wider mt-0.5">
                        Monthly Pool: ₹{groupMetrics.poolSize.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-[10px] font-black bg-white/20 px-2.5 py-1 rounded-full uppercase">
                      Month {group.currentMonth}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-xs text-brand-dark">
                      <div>
                        <span className="text-[9px] text-brand-gray font-bold uppercase block">Monthly Amount</span>
                        <span className="font-extrabold">₹{group.monthlyAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-center sm:text-left">
                        <span className="text-[9px] text-brand-gray font-bold uppercase block">Collected</span>
                        <span className="font-extrabold text-brand-success">₹{groupMetrics.collectedAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-brand-gray font-bold uppercase block">Pending</span>
                        <span className="font-extrabold text-brand-danger">₹{groupMetrics.pendingAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-brand-gray">
                        <span>Month Collection Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-brand-bg rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-success h-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Winner Status Banner */}
                    <div className="bg-slate-50 border border-brand-border/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-brand-dark">
                      <div>
                        <span className="text-[8.5px] text-brand-gray font-bold uppercase block">Winner of Month {group.currentMonth}</span>
                        <span className="font-extrabold mt-0.5 block">
                          {winnerRecord ? winnerRecord.winnerName : 'Pending Declaration'}
                        </span>
                      </div>
                      {winnerRecord ? (
                        <span className="text-[9px] font-black text-brand-success bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase">
                          Paid
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase animate-pulse">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-4 pb-4 pt-0 flex gap-2">
                    <button
                      onClick={() => navigate(`/group/${group.id}`)}
                      className="flex-1 py-2.5 border border-brand-border hover:bg-slate-50 text-brand-blue rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      View Details
                    </button>
                    {groupMetrics.pendingCount > 0 ? (
                      <button
                        onClick={() => navigate(`/payments`, { state: { groupId: group.id } })}
                        className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-brand-blue-hover active-scale transition-all cursor-pointer text-center"
                      >
                        Record Dues
                      </button>
                    ) : !winnerRecord ? (
                      <button
                        onClick={() => navigate(`/group/${group.id}`)}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold active-scale transition-all cursor-pointer text-center"
                      >
                        Declare Winner
                      </button>
                    ) : (
                      <span className="flex-1 py-2.5 bg-green-50 border border-green-100 text-brand-success rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1">
                        <FiCheckCircle /> Cycle Settled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Recent Payments list */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2">
              <FiActivity className="text-brand-blue" />
              Recent Payments
            </h3>
            <div className="divide-y divide-brand-border max-h-[300px] overflow-y-auto no-scrollbar">
              {metrics.recentPayments.length > 0 ? (
                metrics.recentPayments.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-all rounded px-2">
                    <div>
                      <span className="font-extrabold text-brand-dark block leading-tight">{p.memberName}</span>
                      <span className="text-[10px] text-brand-gray mt-1 block">
                        {p.groupName} • Month {p.month} ({p.paymentMode})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-brand-success">₹{p.amountPaid.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-brand-gray font-semibold block mt-0.5">{p.paymentDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-brand-gray font-bold">
                  No payment activity recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Latest Winners list */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2">
              <FiAward className="text-brand-blue" />
              Latest Winners
            </h3>
            <div className="divide-y divide-brand-border max-h-[300px] overflow-y-auto no-scrollbar">
              {metrics.latestWinners.length > 0 ? (
                metrics.latestWinners.map(w => (
                  <div key={w.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-all rounded px-2">
                    <div>
                      <span className="font-extrabold text-brand-dark block leading-tight">{w.winnerName}</span>
                      <span className="text-[10px] text-brand-gray mt-1 block">
                        {w.groupName} • Month {w.month} Winner
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-brand-blue">₹{w.amountReleased.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-brand-gray font-semibold block mt-0.5">{w.releaseDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-brand-gray font-bold">
                  No winners declared yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
