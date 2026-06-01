import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiMessageCircle, FiCheck, FiInfo } from 'react-icons/fi';

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

export default function Payments() {
  const use_location = useLocation();
  const navigate = useNavigate();
  const { groups, payments, recordPayment, user } = useContext(ChitContext);

  const initialGroupId = use_location.state?.groupId || '';
  const initialMemberId = use_location.state?.memberId || '';
  const initialMonth = use_location.state?.month ? Number(use_location.state.month) : 0;

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  
  const activeGroup = groups.find(g => g.id === selectedGroupId);
  const membersList = activeGroup ? activeGroup.members : [];

  // Filter pending members for the chosen month of the group
  const pendingMembers = activeGroup 
    ? activeGroup.members.filter(m => {
        const hasPaid = payments.some(p => 
          p.groupId === activeGroup.id && 
          p.memberId === m.id && 
          Number(p.month) === Number(selectedMonth || activeGroup.currentMonth)
        );
        return !hasPaid;
      })
    : [];

  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  
  // Payment states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState(null);

  // Sync state from navigation location
  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    }
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
    }
    if (initialMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [initialGroupId, initialMemberId, initialMonth]);

  // Set default amount when group is selected
  useEffect(() => {
    if (activeGroup) {
      setAmountPaid(activeGroup.monthlyAmount.toString());
      if (!selectedMonth || selectedMonth > activeGroup.members.length) {
        setSelectedMonth(activeGroup.currentMonth);
      }
    } else {
      setAmountPaid('');
      setSelectedMemberId('');
      setSelectedMonth(0);
    }
  }, [selectedGroupId, activeGroup]);

  // Auto-select first pending member when target month changes
  useEffect(() => {
    if (activeGroup && selectedMonth) {
      const isMemberPending = pendingMembers.some(m => m.id === selectedMemberId);
      if (!isMemberPending && pendingMembers.length > 0) {
        setSelectedMemberId(pendingMembers[0].id);
      } else if (pendingMembers.length === 0) {
        setSelectedMemberId('');
      }
    }
  }, [selectedMonth, selectedGroupId, pendingMembers.length]);

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert('Please select a chit group');
      return;
    }
    if (!selectedMemberId) {
      alert('Please select a member');
      return;
    }
    if (!amountPaid || Number(amountPaid) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const receipt = recordPayment(
        selectedGroupId,
        selectedMemberId,
        selectedMonth,
        Number(amountPaid),
        paymentMode,
        paymentDate,
        transactionRef
      );
      setIsSubmitting(false);
      setCreatedReceipt(receipt);
      setTransactionRef(''); // Reset reference field
    }, 1200);
  };

  const handleCloseSuccess = () => {
    setCreatedReceipt(null);
    setSelectedMemberId('');
    if (use_location.state?.groupId) {
      navigate(`/group/${use_location.state.groupId}`);
    } else {
      setSelectedGroupId('');
    }
  };

  const formatWhatsAppLink = (receipt) => {
    if (!receipt) return '';
    const dateFormatted = formatDateNice(receipt.paymentDate);
    const text = `ChitTrack Receipt\n\nGroup: ${receipt.groupName}\n\nMember: ${receipt.memberName}\n\nAmount Paid: ₹${receipt.amountPaid.toLocaleString('en-IN')}\n\nPayment Mode: ${receipt.paymentMode}${receipt.transactionRef ? `\n\nReference: ${receipt.transactionRef}` : ''}\n\nDate: ${dateFormatted}\n\nStatus: Payment Successful\n\nReceived By: ${user?.name || 'Organizer Name'}\n\nThank you.`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const selectedMemberName = membersList.find(m => m.id === selectedMemberId)?.name || 'Select Member';

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-brand-border/40">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-dark hover:bg-slate-50 active-scale"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Record Payment</h2>
              <p className="text-xs text-brand-gray font-bold tracking-wider uppercase mt-0.5">Collect member contributions</p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT: PAYMENT FORM */}
          <form onSubmit={handleSavePayment} className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-6">
            <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider border-b border-brand-border/60 pb-2.5">
              Record Member Contribution
            </h3>

            {/* Select Group (Redesigned custom cards) */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-brand-gray uppercase tracking-wider block">Select Chit Group</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {groups.map(g => {
                  const isSelected = selectedGroupId === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGroupId(g.id)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden active-scale ${
                        isSelected 
                          ? 'border-brand-blue bg-blue-50/20 shadow-md ring-2 ring-brand-blue/30 scale-[1.01]' 
                          : 'border-brand-border bg-white hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      {/* Gradient Accent Bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${g.gradient}`} />
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g.gradient} text-white flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0`}>
                          {g.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <h4 className="font-extrabold text-brand-dark text-xs truncate leading-tight">{g.name}</h4>
                          <span className="text-[9.5px] text-brand-gray font-bold block mt-0.5">
                            ₹{g.monthlyAmount.toLocaleString('en-IN')} • {g.totalMembers} Members
                          </span>
                        </div>
                      </div>

                      {/* Selection Tick Overlay */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-xs animate-scale-in">
                          <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select Target Month (Redesigned pills) */}
            {selectedGroupId && activeGroup && (
              <div className="space-y-2.5 animate-fade-in">
                <label className="text-[10px] font-black text-brand-gray uppercase tracking-wider block">Target Chit Month</label>
                <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                  {Array.from({ length: activeGroup.members.length }, (_, i) => i + 1).map(m => {
                    const isSelected = selectedMonth === m;
                    const isActive = Number(activeGroup.currentMonth) === m;
                    
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMonth(m)}
                        className={`px-4.5 py-2.5 rounded-xl border text-xs font-black shrink-0 transition-all cursor-pointer active-scale flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                            : 'bg-slate-50 text-brand-dark border-brand-border hover:bg-slate-100'
                        }`}
                      >
                        <span>Month {m}</span>
                        {isActive && (
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider leading-none ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-brand-blue/10 text-brand-blue'
                          }`}>
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Select Member (Redesigned avatar cards list) */}
            {selectedGroupId && (
              <div className="space-y-2.5 animate-fade-in">
                <label className="text-[10px] font-black text-brand-gray uppercase tracking-wider block">
                  Select Pending Member (For Month {selectedMonth})
                </label>
                {pendingMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar pt-0.5">
                    {pendingMembers.map(m => {
                      const isSelected = selectedMemberId === m.id;
                      
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMemberId(m.id)}
                          className={`text-left p-3.5 rounded-xl border transition-all duration-155 cursor-pointer flex items-center justify-between active-scale relative ${
                            isSelected
                              ? 'border-brand-blue bg-blue-50/40 ring-1 ring-brand-blue/20 shadow-xs'
                              : 'border-brand-border bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-9.5 h-9.5 rounded-full text-brand-blue bg-blue-50 font-black text-xs flex items-center justify-center shrink-0 border ${
                              isSelected ? 'border-brand-blue' : 'border-brand-border'
                            }`}>
                              {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <span className="font-extrabold text-brand-dark text-xs block leading-tight truncate">{m.name}</span>
                              <span className="text-[9.5px] text-brand-gray font-semibold block mt-0.5 truncate">+91 {m.phone}</span>
                            </div>
                          </div>
                          
                          {/* Selected Tick Indicator */}
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 animate-scale-in">
                              <FiCheck className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 bg-green-50 border border-green-150 text-brand-success text-xs font-bold rounded-2xl flex flex-col items-center justify-center text-center gap-2 py-6 animate-scale-in">
                    <FiCheckCircle className="w-8 h-8 text-brand-success" />
                    <div>
                      <h4 className="font-black text-sm text-brand-dark">Month Completed!</h4>
                      <p className="text-[10px] text-brand-gray font-semibold mt-1">All members have contributed for Month {selectedMonth}.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Amount, Date, Mode inputs */}
            {selectedGroupId && selectedMemberId && (
              <div className="space-y-4 animate-fade-in border-t border-brand-border/60 pt-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount Paid */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-brand-gray uppercase tracking-wider">Amount Paid (₹)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-brand-dark font-black text-xs">₹</span>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-8 pr-3 py-3 bg-brand-bg border border-brand-border rounded-xl font-black text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-brand-gray uppercase tracking-wider">Payment Date</label>
                    <div className="relative flex items-center">
                      <FiCalendar className="absolute left-3.5 text-brand-gray w-4 h-4" />
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-brand-gray uppercase tracking-wider block">Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { mode: 'UPI', label: 'UPI / GPay', desc: 'Instant transfer' },
                      { mode: 'Cash', label: 'Cash', desc: 'Hand to hand' },
                      { mode: 'Bank Transfer', label: 'Bank IMPS', desc: 'Direct ledger' }
                    ].map(item => {
                      const isSelected = paymentMode === item.mode;
                      return (
                        <button
                          key={item.mode}
                          type="button"
                          onClick={() => setPaymentMode(item.mode)}
                          className={`py-3 px-1 border rounded-xl text-center active-scale transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            isSelected 
                              ? 'bg-brand-blue text-white border-brand-blue shadow-xs font-black' 
                              : 'bg-slate-50 text-brand-dark border-brand-border hover:bg-slate-100 font-bold'
                          }`}
                        >
                          <span className="text-xs block leading-tight">{item.label}</span>
                          <span className={`text-[8.5px] block leading-none font-semibold ${
                            isSelected ? 'text-white/80' : 'text-brand-gray'
                          }`}>
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Transaction Reference Number (Optional) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-gray uppercase tracking-wider block">Transaction Reference Number (Optional)</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UPI Ref #7788, TXN-990"
                    className="w-full px-3.5 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
                  />
                </div>

                {/* Save Button */}
                {pendingMembers.length > 0 && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-black text-xs shadow-md active-scale transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <FiDollarSign className="w-4 h-4 stroke-[3]" />
                        <span>Save Payment of ₹{Number(amountPaid).toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                )}

              </div>
            )}
          </form>

          {/* RIGHT: LIVE RECEIPT PREVIEW */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider px-1">
              Live Slip Preview
            </h3>

            <div className="bg-white border-2 border-brand-dark rounded-2xl overflow-hidden shadow-xs max-w-sm mx-auto w-full">
              {/* Slip Header */}
              <div className="bg-brand-dark text-white p-4 text-center">
                <h3 className="font-black text-sm uppercase tracking-widest">ChitTrack Receipt</h3>
                <p className="text-[9px] text-white/70 font-semibold tracking-wider uppercase mt-1">Pending Confirmation</p>
              </div>

              {/* Slip Body */}
              <div className="p-6 space-y-4 bg-[#FAF9F6] text-xs">
                <div className="text-center space-y-1 py-1 border-b border-brand-border/80 border-dashed">
                  <span className="text-[9px] font-bold text-brand-gray block uppercase">Receipt ID</span>
                  <span className="text-xs font-black text-brand-blue tracking-wider">CT-PREVIEW</span>
                </div>

                <div className="space-y-3 text-brand-dark">
                  <div className="flex justify-between">
                    <span className="text-brand-gray font-bold">Chit Group:</span>
                    <span className="font-extrabold text-right">{activeGroup ? activeGroup.name : 'Select Group'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray font-bold">Received From:</span>
                    <span className="font-extrabold text-right">{selectedMemberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray font-bold">Cycle Month:</span>
                    <span className="font-extrabold">Month {selectedMonth || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray font-bold">Payment Mode:</span>
                    <span className="font-extrabold">{paymentMode}</span>
                  </div>
                  {transactionRef && (
                    <div className="flex justify-between">
                      <span className="text-brand-gray font-bold">Reference:</span>
                      <span className="font-extrabold truncate max-w-[150px]">{transactionRef}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-brand-gray font-bold">Payment Date:</span>
                    <span className="font-extrabold">{formatDateNice(paymentDate)}</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-border/80 border-dashed pt-3.5">
                    <span className="text-brand-dark font-black uppercase text-xs">Amount Paid</span>
                    <span className="text-sm font-black text-brand-success">
                      ₹{amountPaid ? Number(amountPaid).toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center pt-3 text-[9px] text-brand-gray font-bold italic uppercase border-t border-brand-border/50">
                  Receipt preview changes live as you type.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SUCCESS RECEIPT DIALOG MODAL */}
      {createdReceipt && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-2 border-brand-dark max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="bg-brand-dark text-white p-4 text-center">
              <h3 className="font-black text-sm uppercase tracking-widest">Receipt Generated!</h3>
              <p className="text-[10px] text-white/70 font-semibold tracking-wider uppercase mt-1">CT-PAYMENT COMPLETE</p>
            </div>

            {/* Slip content */}
            <div className="p-6 space-y-4 bg-[#FAF9F6]">
              <div className="text-center space-y-1 py-1 border-b border-brand-border/80 border-dashed">
                <span className="text-[10px] font-bold text-brand-gray block uppercase">Receipt ID</span>
                <span className="text-sm font-black text-brand-blue tracking-wider">{createdReceipt.receiptId}</span>
              </div>

              <div className="space-y-3.5 text-xs text-brand-dark pt-1">
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Chit Group</span>
                  <span className="font-extrabold text-right">{createdReceipt.groupName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Received From</span>
                  <span className="font-extrabold text-right">{createdReceipt.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Cycle Month</span>
                  <span className="font-extrabold">Month {createdReceipt.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Payment Mode</span>
                  <span className="font-extrabold">{createdReceipt.paymentMode}</span>
                </div>
                {createdReceipt.transactionRef && (
                  <div className="flex justify-between">
                    <span className="text-brand-gray font-bold">Reference</span>
                    <span className="font-extrabold truncate max-w-[150px]">{createdReceipt.transactionRef}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-brand-gray font-bold">Payment Date</span>
                  <span className="font-extrabold">{formatDateNice(createdReceipt.paymentDate)}</span>
                </div>
                <div className="flex justify-between border-t border-brand-border/80 border-dashed pt-3.5">
                  <span className="text-brand-dark font-black uppercase text-sm">Amount Paid</span>
                  <span className="text-base font-black text-brand-success">₹{createdReceipt.amountPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-brand-gray font-bold italic uppercase border-t border-brand-border/50">
                Thank you. Recorded digitally via ChitTrack.
              </div>
            </div>

            {/* Modal actions */}
            <div className="grid grid-cols-2 border-t border-brand-border">
              <a
                href={formatWhatsAppLink(createdReceipt)}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 bg-[#25D366] text-white font-bold text-xs hover:opacity-90 active-scale flex items-center justify-center gap-1.5 cursor-pointer border-r border-[#25D366]"
              >
                <FiMessageCircle className="w-4 h-4 fill-white text-transparent" />
                <span>Send WhatsApp</span>
              </a>
              <button
                onClick={handleCloseSuccess}
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
