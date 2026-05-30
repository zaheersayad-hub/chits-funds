import React, { useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiArrowLeft, FiCalendar, FiUsers, FiDollarSign, FiAward, FiCheckCircle, FiClock, FiPlusCircle, FiList, FiBookOpen } from 'react-icons/fi';

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, transactions, user } = useContext(ChitContext);

  const [activeTab, setActiveTab] = useState('overview'); // overview | ledger | history

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

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(Number(val))) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  // Calculate statistics
  const totalPot = group.monthlyAmount * group.members.length;
  const paidCount = group.members.filter(m => m.status === 'Paid').length;
  const pendingCount = group.members.length - paidCount;
  const collectedAmount = paidCount * group.payableAmount;
  const progressPercentage = Math.round((group.currentMonth / group.totalMonths) * 100);

  // Get last winner
  const lastWinner = group.auctionHistory && group.auctionHistory.length > 0 
    ? group.auctionHistory[group.auctionHistory.length - 1] 
    : null;

  // Derive Member Ledger metrics dynamically
  const getMemberLedger = (member) => {
    // 1. Total Dividends Received: Sum of dividendPerMember from all completed auctions
    const totalDividends = group.auctionHistory 
      ? group.auctionHistory.reduce((sum, h) => sum + h.dividendPerMember, 0)
      : 0;

    // 2. Actual Amount Paid: Sum of paid amounts from group transactions list for this member name
    const memberTxns = transactions.filter(t => 
      t.groupName === group.name && 
      t.memberName === member.name &&
      t.status === 'Success'
    );
    const actualAmountPaid = memberTxns.reduce((sum, t) => sum + t.amount, 0);

    // 3. Original Monthly Contribution due for completed cycles
    const originalContributionTotal = group.monthlyAmount * group.currentMonth;

    // 4. Pending Dues: If status is Pending, they owe the current group.payableAmount
    const pendingAmount = member.status === 'Pending' ? group.payableAmount : 0;

    return {
      originalContribution: originalContributionTotal,
      totalDividends,
      actualAmountPaid,
      pendingAmount,
      history: memberTxns
    };
  };

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
              <h2 className="text-xl font-extrabold text-brand-dark truncate tracking-tight max-w-[200px] sm:max-w-md">{group.name}</h2>
              <p className="text-[10px] text-brand-gray font-bold tracking-wider uppercase mt-0.5">
                Pot: ₹{formatCurrency(totalPot)} • {group.members.length} Members • {group.commissionModel === 'fixed' ? 'Fixed Pool' : 'Discount Based'} Model
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Action Button: Run Auction */}
          {group.currentMonth <= group.totalMonths && (
            <button
              onClick={() => navigate(`/group/${group.id}/auction`)}
              className="hidden sm:flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-blue text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-brand-blue-hover active-scale transition-colors"
            >
              <FiPlusCircle className="w-4.5 h-4.5" />
              <span>Run Month {group.currentMonth} Auction</span>
            </button>
          )}
        </div>

        {/* Tab Sub-Navigation Menu */}
        <div className="flex gap-2 p-1 bg-white border border-brand-border rounded-xl shadow-2xs max-w-md">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'overview' ? 'bg-brand-blue text-white shadow-2xs' : 'text-brand-gray hover:bg-slate-50'
            }`}
          >
            <FiList className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ledger' ? 'bg-brand-blue text-white shadow-2xs' : 'text-brand-gray hover:bg-slate-50'
            }`}
          >
            <FiBookOpen className="w-4 h-4" />
            Ledger
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history' ? 'bg-brand-blue text-white shadow-2xs' : 'text-brand-gray hover:bg-slate-50'
            }`}
          >
            <FiAward className="w-4 h-4" />
            History ({group.auctionHistory ? group.auctionHistory.length : 0})
          </button>
        </div>

        {/* Dynamic Tab Views */}
        <div className="animate-fade-in">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Panel (2 Columns on desktop) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Banner Gradient Card */}
                <div className={`bg-gradient-to-r ${group.gradient} rounded-2xl p-6 text-white shadow-md animate-scale-in`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <span className="text-[9px] font-black uppercase bg-white/20 px-2.5 py-1 rounded-full tracking-wider">
                        Chit Cycle Month {group.currentMonth}
                      </span>
                      <h3 className="text-2xl font-black mt-3 tracking-tight">{group.name}</h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] opacity-80 block font-bold uppercase tracking-wider">Monthly Pool Value</span>
                      <span className="text-2xl font-black">₹{formatCurrency(totalPot)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/20 text-xs">
                    <div>
                      <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Monthly Base</span>
                      <span className="font-extrabold text-sm mt-0.5 block">₹{formatCurrency(group.monthlyAmount)}</span>
                    </div>
                    <div className="text-center">
                      <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Commission ({group.commissionModel === 'fixed' ? 'Fixed Pool' : 'Discount Based'})</span>
                      <span className="font-extrabold text-sm mt-0.5 block">{group.commissionPercentage}%</span>
                    </div>
                    <div className="text-right">
                      <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Chit Duration</span>
                      <span className="font-extrabold text-sm mt-0.5 block">{group.totalMonths} months</span>
                    </div>
                  </div>
                </div>

                {/* Mobile/Tablet Inline Action: Run Auction (Hidden on Desktop if CTA in header fits, but keep here as fallback) */}
                {group.currentMonth <= group.totalMonths && (
                  <div className="sm:hidden bg-white p-4 rounded-2xl border border-brand-border shadow-2xs flex flex-col gap-3">
                    <p className="text-xs text-brand-gray font-medium">Bidding auction is pending for Month {group.currentMonth}. Run it now to calculate next month dividends.</p>
                    <button
                      onClick={() => navigate(`/group/${group.id}/auction`)}
                      className="w-full py-3 bg-brand-blue text-white font-extrabold text-xs rounded-xl shadow-md active-scale flex items-center justify-center gap-1.5"
                    >
                      <FiPlusCircle className="w-4.5 h-4.5" />
                      <span>Run Month {group.currentMonth} Auction</span>
                    </button>
                  </div>
                )}

                {/* Current Month Collections Card */}
                <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
                  <div className="flex justify-between items-center text-xs font-bold text-brand-dark mb-3">
                    <span>Instalment Collections (Month {group.currentMonth})</span>
                    <span className="text-brand-blue">{paidCount} Paid / {group.members.length} Members</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden flex">
                    <div 
                      className="bg-brand-success h-full rounded-full transition-all duration-500"
                      style={{ width: `${(paidCount / group.members.length) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between text-[11px] font-bold text-brand-gray mt-4 pt-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-brand-success rounded-full"></span>
                      <span>Collected: <span className="text-brand-dark font-extrabold">₹{formatCurrency(collectedAmount)}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                      <span>Pending: <span className="text-brand-dark font-extrabold">₹{formatCurrency(pendingCount * group.payableAmount)}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:ml-auto">
                      <span className="text-brand-gray font-medium">Payable / Member:</span>
                      <span className="text-brand-blue font-extrabold">₹{formatCurrency(group.payableAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Last Winner highlights */}
                <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs">
                  <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-brand-border/60 pb-2.5">
                    <FiAward className="text-brand-blue w-4.5 h-4.5" />
                    Last Bidding Auction Winner
                  </h4>

                  {lastWinner ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-sm font-extrabold text-brand-dark">{lastWinner.winnerName}</span>
                        <span className="text-[10px] text-brand-gray block mt-1">Month {lastWinner.month} Winner • Cleared on {lastWinner.date}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6 text-xs text-brand-dark border-t sm:border-t-0 pt-3 sm:pt-0 border-brand-border/60">
                        <div>
                          <span className="text-[9px] text-brand-gray block uppercase font-bold">Winning Bid</span>
                          <span className="font-extrabold text-brand-blue">₹{formatCurrency(lastWinner.bidAmount)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-brand-gray block uppercase font-bold">Dividend Discount</span>
                          <span className="font-extrabold text-brand-success">₹{formatCurrency(lastWinner.dividendPerMember)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-brand-gray font-medium">
                      No auctions completed yet.
                    </div>
                  )}
                </div>

              </div>

              {/* Right Panel (1 Column on desktop): Member Payments Status checklist */}
              <div className="lg:col-span-1 space-y-4">
                <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider px-1">
                  Active Payment Status
                </h4>

                <div className="bg-white rounded-2xl border border-brand-border divide-y divide-brand-border overflow-hidden shadow-xs">
                  {group.members.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-bg text-brand-dark font-extrabold text-xs flex items-center justify-center border border-brand-border shrink-0 shadow-2xs">
                          {member.avatar}
                        </div>
                        <div className="truncate max-w-[100px] sm:max-w-xs">
                          <p className="text-xs font-bold text-brand-dark truncate">{member.name}</p>
                          <p className="text-[9px] text-brand-gray font-bold mt-0.5">Dues: ₹{formatCurrency(group.payableAmount)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {member.status === 'Paid' ? (
                          <span className="text-[9px] font-black text-brand-success bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 flex items-center gap-0.5">
                            <FiCheckCircle /> Paid
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-0.5">
                              <FiClock /> Pending
                            </span>
                            <button
                              onClick={() => navigate('/payments', { state: { groupId: group.id, memberId: member.id } })}
                              className="text-[9px] font-extrabold text-white bg-brand-blue hover:bg-brand-blue-hover px-2.5 py-1.5 rounded-lg active-scale transition-colors shadow-2xs cursor-pointer"
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
          )}

          {/* TAB 2: MEMBER LEDGER */}
          {activeTab === 'ledger' && (
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs animate-scale-in">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-brand-dark divide-y divide-brand-border">
                  <thead className="bg-slate-50 text-[10px] font-bold text-brand-gray uppercase tracking-wider select-none">
                    <tr>
                      <th className="p-4">Member Name</th>
                      <th className="p-4 text-right">Original Due</th>
                      <th className="p-4 text-right text-brand-success">Dividends Recd</th>
                      <th className="p-4 text-right text-brand-blue">Actual Paid</th>
                      <th className="p-4 text-right text-brand-danger">Pending Dues</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {group.members.map(member => {
                      const ledger = getMemberLedger(member);
                      const isWinner = group.auctionHistory?.some(h => h.winnerName === member.name);

                      return (
                        <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-brand-bg text-brand-dark font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-brand-border">
                                {member.avatar}
                              </div>
                              <div>
                                <span className="font-extrabold block leading-tight">{member.name}</span>
                                {isWinner && (
                                  <span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-100 rounded px-1 py-0.25 font-bold mt-0.5 inline-block">
                                    Awarded Winner
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right font-bold">
                            ₹{formatCurrency(ledger.originalContribution)}
                          </td>
                          <td className="p-4 text-right font-extrabold text-brand-success">
                            - ₹{formatCurrency(ledger.totalDividends)}
                          </td>
                          <td className="p-4 text-right font-black text-brand-blue">
                            ₹{formatCurrency(ledger.actualAmountPaid)}
                          </td>
                          <td className="p-4 text-right font-black text-brand-danger">
                            ₹{formatCurrency(ledger.pendingAmount)}
                          </td>
                          <td className="p-4 text-center">
                            {ledger.pendingAmount > 0 ? (
                              <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                Dues Pending
                              </span>
                            ) : (
                              <span className="text-[8px] font-black uppercase text-brand-success bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                Settle OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AUCTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-scale-in">
              {group.auctionHistory && group.auctionHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.auctionHistory.map(record => (
                    <div 
                      key={record.month} 
                      className="bg-white rounded-2xl border border-brand-border p-5 shadow-2xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Record header line */}
                      <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                        <div>
                          <span className="text-[9px] font-extrabold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                            Month {record.month} Auction
                          </span>
                          <h4 className="text-xs font-black text-brand-dark mt-2">
                            Winner: {record.winnerName}
                          </h4>
                        </div>
                        <span className="text-[9px] text-brand-gray font-bold shrink-0">{record.date}</span>
                      </div>

                      {/* Financial outputs grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-brand-dark py-1">
                        <div>
                          <span className="text-[9px] text-brand-gray block font-semibold uppercase">Winning Bid</span>
                          <span className="font-extrabold text-brand-blue">₹{formatCurrency(record.bidAmount)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-brand-gray block font-semibold uppercase">Bidding Discount</span>
                          <span className="font-extrabold">₹{formatCurrency(record.discount)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-brand-gray block font-semibold uppercase">
                            Organizer Comm ({group.commissionPercentage}% • {group.commissionModel === 'fixed' ? 'Fixed' : 'Discount'})
                          </span>
                          <span className="font-extrabold text-brand-danger">₹{formatCurrency(record.commission)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-brand-gray block font-semibold uppercase">Dividend / Member</span>
                          <span className="font-extrabold text-brand-success">₹{formatCurrency(record.dividendPerMember)}</span>
                        </div>
                      </div>

                      {/* Settle line */}
                      <div className="border-t border-brand-border/60 pt-3 flex justify-between items-center text-[11px]">
                        <span className="text-brand-gray font-medium">Payable next cycle:</span>
                        <span className="text-brand-dark font-black text-sm">₹{formatCurrency(record.payableAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-brand-border p-6 shadow-2xs max-w-md mx-auto">
                  <FiAward className="w-12 h-12 text-brand-gray/40 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-brand-dark">No auction records found</h4>
                  <p className="text-xs text-brand-gray mt-1">Run the Month 1 auction to record the first winning bidder.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
