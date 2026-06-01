import React, { useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { calculateGroupMetrics } from '../utils/calcEngine';
import { FiArrowLeft, FiCalendar, FiUsers, FiDollarSign, FiAward, FiCheckCircle, FiClock, FiPlusCircle, FiList, FiFileText, FiPrinter, FiMessageCircle, FiUser, FiMapPin, FiX } from 'react-icons/fi';

// Date Formatter Helper: e.g. "01-Jun-2026"
const formatDateNice = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, payments, winners, declareWinner, user } = useContext(ChitContext);

  const group = groups.find(g => g.id === id);

  // Active month tab selector (defaults to group's active cycle month)
  const [selectedMonth, setSelectedMonth] = useState(group ? group.currentMonth : 1);
  
  // Winner declaration modal state
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerName, setWinnerName] = useState('');
  const [winnerMonthVal, setWinnerMonthVal] = useState('');
  const [amountReleased, setAmountReleased] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [winnerNotes, setWinnerNotes] = useState('');

  // Selected receipt modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Member Profile modal state
  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);

  if (!group) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-brand-bg text-center">
        <h2 className="text-lg font-bold text-brand-dark">Group Not Found</h2>
        <Link to="/dashboard" className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg">Back to Home</Link>
      </div>
    );
  }

  // Calculate metrics using simplified engine
  const metrics = calculateGroupMetrics(group, payments, winners);

  // Group Pool Target
  const poolSize = metrics.poolSize;

  // Selected month calculations
  const monthPayments = payments.filter(p => p.groupId === group.id && Number(p.month) === Number(selectedMonth));
  const monthWinner = winners.find(w => w.groupId === group.id && Number(w.month) === Number(selectedMonth));

  // Determine paid and pending members for the SELECTED month
  const paidMembers = group.members.filter(m => monthPayments.some(p => p.memberId === m.id));
  const pendingMembers = group.members.filter(m => !monthPayments.some(p => p.memberId === m.id));

  const isSelectedMonthFullyPaid = paidMembers.length === group.totalMembers;

  // Find members eligible to win (have not won in any past month or current month)
  const pastWinnersList = winners.filter(w => w.groupId === group.id).map(w => w.winnerName);
  const eligibleMembers = group.members.filter(m => !pastWinnersList.includes(m.name));

  // Pre-fill default winner name in form
  const handleOpenWinnerModal = () => {
    if (eligibleMembers.length > 0) {
      setWinnerName(eligibleMembers[0].name);
    }
    setWinnerMonthVal(`Month ${selectedMonth}`);
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setAmountReleased(poolSize.toString());
    setWinnerNotes('');
    setShowWinnerModal(true);
  };

  const handleSaveWinner = (e) => {
    e.preventDefault();
    if (!winnerName) {
      alert('Please select a winner');
      return;
    }
    if (!amountReleased.trim() || Number(amountReleased) <= 0) {
      alert('Please enter a valid amount released');
      return;
    }

    declareWinner(group.id, selectedMonth, winnerName, Number(amountReleased), releaseDate);
    setShowWinnerModal(false);
    
    // Auto increment selected month to match the new currentMonth
    setSelectedMonth(group.currentMonth + 1);
  };

  const formatWhatsAppLink = (receipt) => {
    if (!receipt) return '';
    const dateFormatted = formatDateNice(receipt.paymentDate);
    const text = `ChitTrack Receipt\n\nGroup: ${receipt.groupName}\n\nMember: ${receipt.memberName}\n\nAmount Paid: ₹${receipt.amountPaid.toLocaleString('en-IN')}\n\nPayment Mode: ${receipt.paymentMode}${receipt.transactionRef ? `\n\nReference: ${receipt.transactionRef}` : ''}\n\nDate: ${dateFormatted}\n\nStatus: Payment Successful\n\nReceived By: ${user?.name || 'Organizer Name'}\n\nThank you.`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Generate array of month numbers for tabs (from 1 up to currentMonth, max totalMembers)
  const availableMonths = [];
  const maxMonthToShow = Math.min(group.members.length, group.currentMonth);
  for (let i = 1; i <= maxMonthToShow; i++) {
    availableMonths.push(i);
  }

  // Calculate profile metrics for overlay modal
  const getMemberProfileStats = (memberId) => {
    const memberPayments = payments.filter(p => p.groupId === group.id && p.memberId === memberId);
    const totalPaid = memberPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    
    const mName = group.members.find(m => m.id === memberId)?.name;
    const winRecord = winners.find(w => w.groupId === group.id && w.winnerName === mName);
    const hasWon = !!winRecord;
    const wonMonth = winRecord ? winRecord.month : null;
    const wonAmount = winRecord ? winRecord.amountReleased : 0;

    // Unpaid months
    const pendingMonthsList = [];
    const limit = Math.min(group.members.length, group.currentMonth);
    for (let m = 1; m <= limit; m++) {
      const isPaid = memberPayments.some(p => Number(p.month) === m);
      if (!isPaid) {
        pendingMonthsList.push(`Month ${m}`);
      }
    }

    return {
      memberPayments,
      totalPaid,
      hasWon,
      wonMonth,
      wonAmount,
      pendingMonthsList
    };
  };

  const profileStats = selectedMemberProfile ? getMemberProfileStats(selectedMemberProfile.id) : null;

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-brand-border/40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/groups')}
              className="w-9 h-9 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-dark hover:bg-slate-50 active-scale"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-brand-dark truncate tracking-tight max-w-[200px] sm:max-w-md">{group.name}</h2>
              <p className="text-xs text-brand-gray font-bold tracking-wider uppercase mt-0.5">
                Collection Target: ₹{poolSize.toLocaleString('en-IN')} • {group.totalMembers} Members
              </p>
            </div>
          </div>
        </div>

        {/* Group Details Summary Card */}
        <div className={`bg-gradient-to-r ${group.gradient} rounded-2xl p-6 text-white shadow-md`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <span className="text-[9px] font-black uppercase bg-white/20 px-2.5 py-1 rounded-full tracking-wider">
                Group Information
              </span>
              <h3 className="text-2xl font-black mt-3 tracking-tight">{group.name}</h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[9px] opacity-80 block font-bold uppercase tracking-wider">Monthly Target Pool</span>
              <span className="text-2xl font-black">₹{poolSize.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/20 text-xs">
            <div>
              <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Monthly Amount</span>
              <span className="font-extrabold text-sm mt-0.5 block">₹{group.monthlyAmount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Chit Duration</span>
              <span className="font-extrabold text-sm mt-0.5 block">{group.members.length} Months</span>
            </div>
            <div>
              <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Start Date</span>
              <span className="font-extrabold text-sm mt-0.5 block">{group.startDate}</span>
            </div>
            <div className="text-right">
              <span className="opacity-75 block text-[9px] font-bold uppercase tracking-wider">Current Cycle</span>
              <span className="font-extrabold text-sm mt-0.5 block">Month {Math.min(group.members.length, group.currentMonth)}</span>
            </div>
          </div>
        </div>

        {/* Month Selection Tabs */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Chit Cycle Month Register</span>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {availableMonths.map(m => {
              const isSelected = Number(selectedMonth) === Number(m);
              const isGroupActiveMonth = Number(group.currentMonth) === Number(m);
              
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-5 py-2.5 rounded-xl border font-bold text-xs shrink-0 active-scale cursor-pointer ${
                    isSelected 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-2xs' 
                      : 'bg-white text-brand-dark border-brand-border hover:bg-slate-50'
                  }`}
                >
                  Month {m} {isGroupActiveMonth && '• Active'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Month Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Panel: Collections Checklist (Spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Paid / Pending checklist section */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-brand-border/60 pb-3">
                <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Month {selectedMonth} Collections List
                </h4>
                <span className="text-[10px] font-black text-brand-blue bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase">
                  {paidMembers.length} Paid / {group.totalMembers} Members
                </span>
              </div>

              {/* Progress indicator bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-brand-bg rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-success h-full transition-all duration-500" 
                    style={{ width: `${(paidMembers.length / group.totalMembers) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Members Checklist */}
              <div className="divide-y divide-brand-border max-h-[350px] overflow-y-auto no-scrollbar pt-2">
                {group.members.map(member => {
                  const payment = monthPayments.find(p => p.memberId === member.id);
                  const isPaid = !!payment;

                  return (
                    <div 
                      key={member.id} 
                      className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-all rounded px-2"
                    >
                      {/* Clicking on member triggers their profile overlay */}
                      <div 
                        onClick={() => setSelectedMemberProfile(member)}
                        className="flex items-center gap-3 cursor-pointer group flex-grow"
                      >
                        <div className="w-9 h-9 rounded-xl bg-brand-bg text-brand-dark font-black text-xs flex items-center justify-center border border-brand-border group-hover:border-brand-blue group-hover:text-brand-blue transition-colors">
                          {member.avatar}
                        </div>
                        <div>
                          <span className="font-extrabold text-brand-dark block leading-tight group-hover:text-brand-blue transition-colors">{member.name}</span>
                          <span className="text-[9.5px] text-brand-gray font-semibold mt-0.5 block">{member.phone}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isPaid ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-brand-success bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 flex items-center gap-0.5 uppercase">
                              <FiCheckCircle /> Paid
                            </span>
                            <button
                              onClick={() => setSelectedReceipt(payment)}
                              className="p-1 text-brand-blue hover:text-brand-blue-hover hover:bg-blue-50 rounded-lg active-scale cursor-pointer"
                              title="View receipt slip"
                            >
                              <FiFileText className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-0.5 uppercase">
                              <FiClock /> Pending
                            </span>
                            
                            {/* Allow recording dues for any displayed month */}
                            <button
                              onClick={() => navigate('/payments', { state: { groupId: group.id, memberId: member.id, month: selectedMonth } })}
                              className="text-[9px] font-black text-white bg-brand-blue hover:bg-brand-blue-hover px-2.5 py-1.5 rounded-lg active-scale shadow-2xs cursor-pointer"
                            >
                              Record
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payments History log across all months */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2">
                <FiList className="text-brand-blue" />
                All Payments Log
              </h4>
              <div className="divide-y divide-brand-border max-h-[250px] overflow-y-auto no-scrollbar">
                {metrics.groupPayments.length > 0 ? (
                  metrics.groupPayments.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedReceipt(p)}
                      className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-all rounded px-2 cursor-pointer"
                    >
                      <div>
                        <span className="font-extrabold text-brand-dark block leading-tight">{p.memberName}</span>
                        <span className="text-[10px] text-brand-gray mt-1 block">Month {p.month} ({p.paymentMode})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-brand-success block">₹{p.amountPaid.toLocaleString('en-IN')}</span>
                        <span className="text-[9px] text-brand-gray font-bold block mt-0.5">{p.paymentDate}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-brand-gray font-bold">
                    No payment logs recorded yet.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Panel: Winner Card (Spans 1 col) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Winner status block for the selected month */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2.5">
                <FiAward className="text-brand-blue w-4.5 h-4.5" />
                Month {selectedMonth} Winner
              </h4>

              {monthWinner ? (
                <div className="space-y-4 text-xs text-brand-dark">
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center space-y-2">
                    <FiAward className="w-8 h-8 text-amber-600 mx-auto" />
                    <h4 className="font-black text-sm text-brand-dark">{monthWinner.winnerName}</h4>
                    <span className="text-[9px] text-brand-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                      Winner declared
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-brand-border/65 pt-3">
                    <div className="flex justify-between">
                      <span className="text-brand-gray font-bold">Amount Given</span>
                      <span className="font-black text-brand-blue">₹{monthWinner.amountReleased.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-gray font-bold">Release Date</span>
                      <span className="font-extrabold">{formatDateNice(monthWinner.releaseDate)}</span>
                    </div>
                    {monthWinner.notes && (
                      <div className="mt-2 p-2 bg-slate-50 border border-brand-border rounded-lg">
                        <span className="text-[9px] text-brand-gray font-bold uppercase block">Notes</span>
                        <p className="text-[10px] text-brand-dark leading-normal mt-0.5">{monthWinner.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-brand-border/60 rounded-xl p-4 text-center text-xs text-brand-gray font-bold">
                    No winner declared for Month {selectedMonth} yet.
                  </div>

                    <div className="space-y-2.5 pt-2">
                      <p className="text-[10px] text-brand-gray font-medium leading-relaxed">
                        Declare the winner for Month {selectedMonth} to release the pool and advance the cycle. Outstanding dues can still be tracked and collected.
                      </p>
                      <button
                        onClick={handleOpenWinnerModal}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md active-scale flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FiPlusCircle className="w-4.5 h-4.5 stroke-[2.5]" />
                        <span>Declare Winner</span>
                      </button>
                    </div>
                </div>
              )}
            </div>

            {/* Winner History Logs */}
            <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border/60 pb-2">
                <FiAward className="text-brand-blue" />
                Winners History
              </h4>
              <div className="divide-y divide-brand-border max-h-[250px] overflow-y-auto no-scrollbar">
                {metrics.groupWinners.length > 0 ? (
                  metrics.groupWinners.map(w => (
                    <div key={w.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 transition-all rounded px-2">
                      <div>
                        <span className="font-extrabold text-brand-dark block leading-tight">{w.winnerName}</span>
                        <span className="text-[10px] text-brand-gray mt-1 block">Month {w.month} Winner</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-brand-blue">₹{w.amountReleased.toLocaleString('en-IN')}</span>
                        <span className="text-[9px] text-brand-gray font-bold block mt-0.5">{formatDateNice(w.releaseDate)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-brand-gray font-bold">
                    No winners recorded yet.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* MEMBER PROFILE OVERLAY MODAL */}
      {selectedMemberProfile && profileStats && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-brand-blue text-white p-4 flex justify-between items-center shrink-0">
              <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                <span>Member Profile</span>
              </h3>
              <button 
                onClick={() => setSelectedMemberProfile(null)}
                className="text-white hover:opacity-80 p-1"
              >
                <FiX className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
              
              {/* Member Details Header */}
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-brand-blue font-black text-lg flex items-center justify-center shadow-2xs shrink-0">
                  {selectedMemberProfile.avatar}
                </div>
                <div>
                  <h4 className="text-base font-black text-brand-dark leading-tight">{selectedMemberProfile.name}</h4>
                  <p className="text-xs text-brand-gray font-bold mt-1">+91 {selectedMemberProfile.phone}</p>
                  {selectedMemberProfile.address && (
                    <p className="text-[10px] text-brand-gray flex items-center gap-1 mt-1 font-semibold">
                      <FiMapPin className="shrink-0 text-brand-blue" />
                      <span>{selectedMemberProfile.address}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Aggregates Dashboard Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs text-brand-dark">
                <div className="bg-slate-50 border border-brand-border/60 rounded-xl p-3">
                  <span className="text-[9.5px] text-brand-gray block font-bold uppercase">Total Amount Paid</span>
                  <span className="text-sm font-black text-brand-success mt-1 block">₹{profileStats.totalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-50 border border-brand-border/60 rounded-xl p-3">
                  <span className="text-[9.5px] text-brand-gray block font-bold uppercase">Winner Status</span>
                  <span className="text-[11px] font-black text-brand-dark mt-1 block">
                    {profileStats.hasWon 
                      ? `Won Month ${profileStats.wonMonth} (₹${profileStats.wonAmount.toLocaleString('en-IN')})` 
                      : 'Not Won yet'}
                  </span>
                </div>
              </div>

              {/* Pending Months list */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-brand-gray uppercase tracking-wider block">Pending Installment Months</span>
                {profileStats.pendingMonthsList.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profileStats.pendingMonthsList.map(monthLabel => (
                      <span key={monthLabel} className="text-[9px] font-black text-brand-danger bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">
                        {monthLabel}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-brand-success font-black flex items-center gap-1 text-[11px]">
                    <FiCheckCircle /> All installments paid up to Month {group.currentMonth}!
                  </span>
                )}
              </div>

              {/* Payment History Register */}
              <div className="space-y-2">
                <span className="font-bold text-brand-gray uppercase tracking-wider block">Payment & Receipts Ledger</span>
                <div className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden text-xs">
                  {profileStats.memberPayments.length > 0 ? (
                    profileStats.memberPayments.map(p => (
                      <div key={p.id} className="p-3 bg-slate-50/50 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-brand-dark block">Month {p.month} Contribution</span>
                          <span className="text-[9.5px] text-brand-gray block mt-0.5">{p.paymentDate} • {p.paymentMode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-brand-success text-xs">₹{p.amountPaid.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="p-1 text-brand-blue hover:bg-blue-50 rounded"
                            title="Receipt slip"
                          >
                            <FiFileText className="w-4 h-4" />
                          </button>
                          <a
                            href={formatWhatsAppLink(p)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-[#25D366] hover:bg-green-50 rounded"
                            title="WhatsApp"
                          >
                            <FiMessageCircle className="w-4 h-4 fill-[#25D366] text-transparent" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-brand-gray font-bold text-[10px]">
                      No payments made in this group.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-3 border-t border-brand-border flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedMemberProfile(null)}
                className="px-4 py-2 bg-brand-dark text-white rounded-xl text-xs font-bold active-scale cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DECLARE WINNER MODAL */}
      {showWinnerModal && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
            <div className="bg-brand-blue text-white p-4 text-center">
              <h3 className="font-black text-sm uppercase tracking-wider">Declare Month {selectedMonth} Winner</h3>
            </div>
            
            <form onSubmit={handleSaveWinner} className="p-5 space-y-4">
              
              {/* Select Winner member */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider block">Winner Member</label>
                {eligibleMembers.length > 0 ? (
                  <select
                    value={winnerName}
                    onChange={(e) => setWinnerName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue"
                    required
                  >
                    {eligibleMembers.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 text-brand-danger text-xs font-bold rounded-xl">
                    All members have won. Chit cycle is complete!
                  </div>
                )}
              </div>

              {/* Month */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider block">Month</label>
                <input
                  type="text"
                  value={winnerMonthVal}
                  onChange={(e) => setWinnerMonthVal(e.target.value)}
                  placeholder="e.g. Month 3 / June 2026"
                  className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                  required
                />
              </div>

              {/* Amount Released */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider block">Amount Given (₹)</label>
                <input
                  type="number"
                  value={amountReleased}
                  onChange={(e) => setAmountReleased(e.target.value.replace(/\D/g, ''))}
                  placeholder="₹40,000"
                  className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-black text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                  required
                />
              </div>

              {/* Release Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider block">Release Date</label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider block">Notes / Reference (Optional)</label>
                <input
                  type="text"
                  value={winnerNotes}
                  onChange={(e) => setWinnerNotes(e.target.value)}
                  placeholder="e.g. Handed over Cash, UPI ref #998"
                  className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWinnerModal(false)}
                  className="py-3 bg-slate-100 text-brand-dark font-bold text-xs rounded-xl hover:bg-slate-200 active-scale cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 bg-amber-500 text-white font-black text-xs rounded-xl hover:bg-amber-600 active-scale cursor-pointer"
                >
                  Save & Advance Cycle
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* RECEIPT SLIP MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-2 border-brand-dark max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
            {/* Slip Header */}
            <div className="bg-brand-dark text-white p-4 text-center">
              <h3 className="font-black text-sm uppercase tracking-widest">ChitTrack Receipt</h3>
              <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase mt-1">Transaction Success</p>
            </div>

            {/* Slip Body */}
            <div className="p-6 space-y-4 bg-[#FAF9F6]">
              <div className="text-center space-y-1 py-1 border-b border-brand-border/80 border-dashed">
                <span className="text-[10px] font-bold text-brand-gray block uppercase">Receipt ID</span>
                <span className="text-sm font-black text-brand-blue tracking-wider">{selectedReceipt.receiptId}</span>
              </div>

              <div className="space-y-3.5 text-xs text-brand-dark pt-1">
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Chit Group</span>
                  <span className="font-extrabold text-right">{selectedReceipt.groupName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Received From</span>
                  <span className="font-extrabold text-right">{selectedReceipt.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Cycle Month</span>
                  <span className="font-extrabold">Month {selectedReceipt.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Payment Mode</span>
                  <span className="font-extrabold">{selectedReceipt.paymentMode}</span>
                </div>
                {selectedReceipt.transactionRef && (
                  <div className="flex justify-between">
                    <span className="text-brand-gray font-bold">Reference</span>
                    <span className="font-extrabold truncate max-w-[150px]">{selectedReceipt.transactionRef}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Payment Date</span>
                  <span className="font-extrabold">{formatDateNice(selectedReceipt.paymentDate)}</span>
                </div>
                <div className="flex justify-between border-t border-brand-border/80 border-dashed pt-3.5">
                  <span className="text-brand-dark font-black uppercase text-sm">Amount Paid</span>
                  <span className="text-base font-black text-brand-success">₹{selectedReceipt.amountPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-brand-gray font-bold italic uppercase border-t border-brand-border/50">
                Thank you. Recorded digitally via ChitTrack.
              </div>
            </div>

            {/* Slip Actions */}
            <div className="grid grid-cols-2 border-t border-brand-border">
              <a
                href={formatWhatsAppLink(selectedReceipt)}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 bg-[#25D366] text-white font-bold text-xs hover:opacity-90 active-scale flex items-center justify-center gap-1.5 cursor-pointer border-r border-[#25D366]"
              >
                <FiMessageCircle className="w-4 h-4 fill-white text-transparent" />
                <span>WhatsApp receipt</span>
              </a>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="py-3.5 bg-slate-100 text-brand-dark font-bold text-xs hover:bg-slate-200 active-scale flex items-center justify-center cursor-pointer"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
