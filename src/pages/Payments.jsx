import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiArrowLeft, FiCheck, FiDollarSign, FiCalendar, FiEdit3, FiClock, FiSearch, FiCheckCircle } from 'react-icons/fi';

export default function Payments() {
  const use_location = useLocation();
  const navigate = useNavigate();
  const { groups, transactions, markPayment } = useContext(ChitContext);

  const initialGroupId = use_location.state?.groupId || '';
  const initialMemberId = use_location.state?.memberId || '';

  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentState, setPaymentState] = useState('idle'); // idle | processing | success

  const activeGroup = groups.find(g => g.id === selectedGroupId);
  const pendingMembers = activeGroup 
    ? activeGroup.members.filter(m => m.status === 'Pending') 
    : [];

  useEffect(() => {
    if (activeGroup) {
      setPaymentAmount(activeGroup.monthlyAmount.toString());
      if (!selectedMemberId && pendingMembers.length > 0) {
        setSelectedMemberId(pendingMembers[0].id);
      }
    } else {
      setPaymentAmount('');
      setSelectedMemberId('');
    }
  }, [selectedGroupId, activeGroup]);

  useEffect(() => {
    if (initialGroupId) {
      setSelectedGroupId(initialGroupId);
    }
    if (initialMemberId) {
      setSelectedMemberId(initialMemberId);
    }
  }, [initialGroupId, initialMemberId]);

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    if (!selectedGroupId || !selectedMemberId || !paymentAmount) {
      alert('Please fill in all details');
      return;
    }

    setPaymentState('processing');

    // Simulate Payment delay
    setTimeout(() => {
      markPayment(selectedGroupId, selectedMemberId, notes);
      setPaymentState('success');
      
      setTimeout(() => {
        setPaymentState('idle');
        if (use_location.state?.groupId) {
          navigate(`/group/${use_location.state.groupId}`);
        } else {
          setSelectedGroupId('');
          setSelectedMemberId('');
          setNotes('');
        }
      }, 1500);
    }, 2000);
  };

  const filteredTransactions = transactions.filter(t => 
    t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.upi && t.upi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Payments Portal</h2>
              <p className="text-[10px] text-brand-gray font-bold tracking-wider uppercase mt-0.5">Collect & Record Contributions</p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-slide-up">
          
          {/* LEFT PANEL: Payment Execution Form */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider border-b border-brand-border/60 pb-2.5">
              Record Chit Contribution
            </h3>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              
              {/* Group selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Select Chit Group</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue"
                  required
                >
                  <option value="">-- Click to Select Group --</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (₹{g.monthlyAmount.toLocaleString('en-IN')}/mo)</option>
                  ))}
                </select>
              </div>

              {/* Member selection */}
              {selectedGroupId && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Select Pending Member</label>
                  {pendingMembers.length > 0 ? (
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue"
                      required
                    >
                      <option value="">-- Click to Select Member --</option>
                      {pendingMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.name} (+91 {m.phone})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4.5 bg-green-50 border border-green-100 rounded-xl text-brand-success text-xs font-bold flex items-center gap-2">
                      <FiCheckCircle className="w-5 h-5 shrink-0" />
                      <span>All members of this group have paid their dues for the current month!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Amount and Date */}
              {selectedGroupId && selectedMemberId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  
                  {/* Amount field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Contribution Dues (₹)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-brand-dark font-extrabold text-xs">₹</span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-7.5 pr-3 py-3 bg-brand-bg border border-brand-border rounded-xl font-extrabold text-xs text-brand-dark outline-none"
                        required
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Date selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Receipt Date</label>
                    <div className="relative flex items-center">
                      <FiCalendar className="absolute left-3.5 text-brand-gray w-4 h-4" />
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-3 bg-brand-bg border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue"
                        required
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* Notes */}
              {selectedGroupId && selectedMemberId && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Transaction Reference / Method Note</label>
                  <div className="relative flex items-center">
                    <FiEdit3 className="absolute left-3.5 text-brand-gray w-4 h-4" />
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. UPI Ref #4590, Cash collected by Rajesh"
                      className="w-full pl-9 pr-3 py-3 bg-brand-bg border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>
              )}

              {/* Confirm submit button */}
              {selectedGroupId && selectedMemberId && pendingMembers.length > 0 && (
                <button
                  type="submit"
                  className="w-full py-4 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-bold text-xs shadow-md active-scale transition-colors flex items-center justify-center gap-1.5 tap-highlight-transparent cursor-pointer"
                >
                  <FiDollarSign className="w-4 h-4" />
                  Confirm Receipt of ₹{Number(paymentAmount).toLocaleString('en-IN')}
                </button>
              )}

            </form>
          </div>

          {/* RIGHT PANEL: Searchable Recent Transactions list */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5">
              <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Transaction History Logs
              </h3>
              <span className="text-[10px] font-bold text-brand-gray bg-slate-100 px-2 py-0.5 rounded-full">
                {transactions.length} Logs
              </span>
            </div>

            {/* Keyword Search */}
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by name, group, or UPI ID..."
                className="w-full pl-9 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue transition-all"
              />
            </div>

            {/* Scroll list */}
            <div className="divide-y divide-brand-border max-h-[350px] overflow-y-auto no-scrollbar border border-brand-border rounded-xl">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(txn => (
                  <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-extrabold text-xs text-brand-dark block leading-tight">{txn.memberName}</span>
                      <span className="text-[10px] text-brand-gray block mt-1">{txn.groupName}</span>
                      {txn.upi && (
                        <span className="text-[8px] bg-slate-100 text-brand-gray px-1.5 py-0.5 rounded font-mono mt-1.5 inline-block">UPI: {txn.upi}</span>
                      )}
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-brand-success block">
                        + ₹{txn.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-brand-gray font-bold block mt-0.5">{txn.date}</span>
                      <span className="text-[8px] uppercase tracking-wide font-black text-white bg-brand-success px-1.5 py-0.5 rounded-sm block mt-1.5 ml-auto w-max shadow-2xs">
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-brand-gray font-medium">
                  No transaction matches found.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Payment Overlay */}
      {paymentState !== 'idle' && (
        <div className="absolute inset-0 bg-slate-950/80 z-50 flex flex-col items-center justify-center p-6 text-white text-center animate-fade-in">
          {paymentState === 'processing' ? (
            <div className="space-y-4 animate-scale-in">
              <div className="w-14 h-14 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-base font-extrabold">Recording Secure Contribution</h3>
              <p className="text-xs text-slate-300">Synchronizing database log files...</p>
            </div>
          ) : (
            <div className="space-y-3.5 animate-scale-in">
              <div className="w-18 h-18 bg-brand-success rounded-full flex items-center justify-center text-white mx-auto border border-white/20 animate-bounce">
                <FiCheck className="w-11 h-11 stroke-[3]" />
              </div>
              <h3 className="text-base font-extrabold">Receipt Logged Successfully!</h3>
              <p className="text-xs text-slate-300">Portfolios and collections updated.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
