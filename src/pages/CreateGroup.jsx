import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiArrowLeft, FiPlus, FiTrash2, FiUsers, FiDollarSign, FiCalendar, FiCheck } from 'react-icons/fi';

export default function CreateGroup() {
  const { createGroup, getMockMembersTemplates, user } = useContext(ChitContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('5000');
  const [totalMonths, setTotalMonths] = useState('12');
  const [selectedGradient, setSelectedGradient] = useState('from-blue-600 to-indigo-700');
  const [addedMembers, setAddedMembers] = useState(
    user ? [{ name: user.name, phone: user.phone, upi: user.upi }] : []
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const mockContacts = getMockMembersTemplates().filter(contact => 
    contact.name !== user?.name && 
    !addedMembers.some(m => m.name === contact.name)
  );

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const handleQuickAmount = (amount) => {
    setMonthlyAmount(amount.toString());
  };

  const handleQuickMonths = (months) => {
    setTotalMonths(months.toString());
  };

  const handleAddMember = (contact) => {
    setAddedMembers(prev => [...prev, contact]);
    setSearchQuery('');
  };

  const handleRemoveMember = (name) => {
    if (name === user?.name) return; // Keep user
    setAddedMembers(prev => prev.filter(m => m.name !== name));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!groupName.trim()) {
        alert('Please enter a group name');
        return;
      }
      if (Number(monthlyAmount) <= 0) {
        alert('Please enter a valid monthly contribution');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (Number(totalMonths) <= 1) {
        alert('Chit duration must be at least 2 months');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newGroupId = createGroup({
        name: groupName,
        monthlyAmount: Number(monthlyAmount),
        totalMonths: Number(totalMonths),
        members: addedMembers
      });
      setIsSubmitting(false);
      setSuccess(true);
      
      // Auto redirect after showing success screen
      setTimeout(() => {
        navigate(`/group/${newGroupId}`);
      }, 1500);
    }, 1500);
  };

  const gradientOptions = [
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-orange-500 to-amber-600',
    'from-rose-600 to-pink-700',
    'from-purple-600 to-violet-700',
  ];

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:py-8">
        
        {/* Top Header Card */}
        <div className="max-w-2xl mx-auto bg-white border border-brand-border rounded-t-2xl px-6 py-5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={step === 1 ? () => navigate('/dashboard') : handlePrevStep}
              className="w-9 h-9 rounded-full bg-brand-bg flex items-center justify-center text-brand-dark hover:bg-slate-100 active-scale"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-extrabold text-brand-dark">Create Chit Group</h2>
              <p className="text-[10px] text-brand-gray font-semibold uppercase tracking-wider mt-0.5">Setup Group Parameters</p>
            </div>
          </div>
          
          <span className="text-xs font-black text-brand-blue bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-100">
            Step {step} of 3
          </span>
        </div>

        {/* Stepper Progress bar */}
        <div className="max-w-2xl mx-auto h-1.5 bg-brand-border overflow-hidden">
          <div 
            className="bg-brand-blue h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Wizard Form Area */}
        <div className="max-w-2xl mx-auto bg-white border-x border-b border-brand-border rounded-b-2xl p-6 shadow-xs min-h-[420px] flex flex-col justify-between">
          
          {success ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 animate-scale-in">
              <div className="w-18 h-18 bg-green-50 rounded-full flex items-center justify-center text-brand-success mb-4 border border-brand-success/30 animate-bounce">
                <FiCheck className="w-11 h-11 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black text-brand-dark">Chit Group Created!</h3>
              <p className="text-xs text-brand-gray mt-2 px-6">
                "{groupName}" has been successfully added to your active portfolios. Redirecting to group details...
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-between gap-6">
              
              <div className="space-y-5">
                {/* STEP 1: BASIC DETAILS */}
                {step === 1 && (
                  <div className="space-y-5 animate-slide-up">
                    
                    {/* Gradient theme selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Group Theme Colors</label>
                      <div className="grid grid-cols-5 gap-2">
                        {gradientOptions.map(grad => (
                          <button
                            key={grad}
                            type="button"
                            onClick={() => setSelectedGradient(grad)}
                            className={`h-11 rounded-xl bg-gradient-to-r ${grad} relative flex items-center justify-center border-2 transition-all cursor-pointer ${
                              selectedGradient === grad ? 'border-brand-blue scale-105 shadow-md' : 'border-transparent opacity-80'
                            }`}
                          >
                            {selectedGradient === grad && (
                              <div className="bg-white text-brand-blue rounded-full p-0.5 shadow-2xs">
                                <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {/* Live View Preview Banner */}
                      <div className={`w-full h-20 bg-gradient-to-r ${selectedGradient} rounded-xl mt-3.5 flex items-center px-5 shadow-xs text-white`}>
                        <div>
                          <h4 className="font-extrabold text-sm tracking-tight">{groupName || 'My New Savings Group'}</h4>
                          <p className="text-xs opacity-90 mt-0.5">₹{Number(monthlyAmount).toLocaleString('en-IN')} / month contribution</p>
                        </div>
                      </div>
                    </div>

                    {/* Group Name input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Group Name</label>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. Friends Business Club, Kudumbashree Unit 4"
                        className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs transition-all"
                        required
                      />
                    </div>

                    {/* Monthly contribution input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Monthly Contribution (₹)</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-brand-dark font-extrabold text-xs">₹</span>
                        <input
                          type="number"
                          value={monthlyAmount}
                          onChange={(e) => setMonthlyAmount(e.target.value.replace(/\D/g, ''))}
                          placeholder="Contribution per member"
                          className="w-full pl-8 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-extrabold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs transition-all"
                          required
                        />
                      </div>

                      {/* Quick select shortcuts */}
                      <div className="flex gap-2 pt-1 overflow-x-auto no-scrollbar">
                        {[2000, 5000, 10000, 20000].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handleQuickAmount(amt)}
                            className={`px-4 py-2 border rounded-full text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                              monthlyAmount === amt.toString()
                                ? 'bg-brand-blue text-white border-brand-blue shadow-2xs'
                                : 'bg-white text-brand-dark border-brand-border hover:bg-slate-50'
                            }`}
                          >
                            ₹{amt.toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* STEP 2: DURATION & MEMBERS */}
                {step === 2 && (
                  <div className="space-y-5 animate-slide-up">
                    
                    {/* Duration input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Chit Duration (Months)</label>
                      <div className="relative flex items-center">
                        <FiCalendar className="absolute left-4 text-brand-gray w-4.5 h-4.5" />
                        <input
                          type="number"
                          value={totalMonths}
                          onChange={(e) => setTotalMonths(e.target.value.replace(/\D/g, ''))}
                          placeholder="Duration e.g. 10, 12, 20"
                          className="w-full pl-11 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-extrabold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs transition-all"
                          required
                        />
                      </div>

                      {/* Duration shortcuts */}
                      <div className="flex gap-2 pt-1">
                        {[10, 12, 15, 20].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => handleQuickMonths(m)}
                            className={`px-4 py-2 border rounded-full text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                              totalMonths === m.toString()
                                ? 'bg-brand-blue text-white border-brand-blue shadow-2xs'
                                : 'bg-white text-brand-dark border-brand-border hover:bg-slate-50'
                            }`}
                          >
                            {m} Months
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Member additions */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Add Members</label>
                        <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-2xs">
                          {addedMembers.length} Added (Goal: {totalMonths})
                        </span>
                      </div>

                      {/* Added members bubbles */}
                      <div className="flex gap-2 overflow-x-auto py-1.5 no-scrollbar min-h-12 border-b border-brand-border/60">
                        {addedMembers.map(m => (
                          <div key={m.name} className="relative shrink-0 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-bold text-xs flex items-center justify-center shadow-2xs">
                              {m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[9px] text-brand-dark font-semibold mt-1 truncate max-w-12">{m.name.split(' ')[0]}</span>
                            {m.name !== user?.name && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.name)}
                                className="absolute -top-1 -right-1 bg-brand-danger text-white rounded-full p-0.5 shadow-2xs cursor-pointer"
                              >
                                <FiTrash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Search inputs */}
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search contacts by name or phone..."
                          className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs transition-all"
                        />
                      </div>

                      {/* Filtered contacts directory */}
                      <div className="bg-brand-bg rounded-xl border border-brand-border max-h-40 overflow-y-auto divide-y divide-brand-border/60 no-scrollbar">
                        {filteredContacts.length > 0 ? (
                          filteredContacts.map(contact => (
                            <div 
                              key={contact.name} 
                              onClick={() => handleAddMember(contact)}
                              className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8.5 h-8.5 rounded-full bg-white border border-brand-border text-brand-gray font-bold text-xs flex items-center justify-center">
                                  {contact.avatar}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-brand-dark">{contact.name}</p>
                                  <p className="text-[10px] text-brand-gray font-medium">+91 {contact.phone}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="w-7 h-7 rounded-full bg-white border border-brand-border text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors"
                              >
                                <FiPlus className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-brand-gray font-medium">
                            No contacts match search query
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* STEP 3: CONFIRMATION SUMMARY */}
                {step === 3 && (
                  <div className="space-y-5 animate-slide-up">
                    
                    <div className="bg-brand-bg rounded-2xl border border-brand-border p-5 space-y-4 shadow-2xs">
                      <h4 className="text-center font-extrabold text-xs text-brand-gray uppercase tracking-wider border-b border-brand-border/60 pb-2">Group Setup Review</h4>
                      
                      {/* Gradient preview */}
                      <div className={`w-full h-16 bg-gradient-to-r ${selectedGradient} rounded-xl flex items-center px-4 text-white shadow-2xs`}>
                        <div>
                          <h4 className="font-extrabold text-xs tracking-tight">{groupName}</h4>
                          <p className="text-[10px] opacity-90 mt-0.5">₹{Number(monthlyAmount).toLocaleString('en-IN')} / month</p>
                        </div>
                      </div>

                      {/* Summary fields */}
                      <div className="divide-y divide-brand-border text-xs text-brand-dark pt-1">
                        <div className="py-2.5 flex justify-between">
                          <span className="text-brand-gray font-medium">Monthly Pot Value</span>
                          <span className="font-black text-brand-blue">
                            ₹{(Number(monthlyAmount) * addedMembers.length).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span className="text-brand-gray font-medium">Chit Cycle Duration</span>
                          <span className="font-extrabold">{totalMonths} Months</span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span className="text-brand-gray font-medium">Registered Members</span>
                          <span className="font-bold">{addedMembers.length} Members</span>
                        </div>
                      </div>
                    </div>

                    {/* Member directory details */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">Registered Member Details</label>
                      <div className="bg-white rounded-xl border border-brand-border divide-y divide-brand-border max-h-36 overflow-y-auto no-scrollbar shadow-2xs">
                        {addedMembers.map((m, idx) => (
                          <div key={m.name} className="p-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-brand-gray w-4">{idx + 1}.</span>
                              <div>
                                <span className="font-bold text-brand-dark block leading-tight">{m.name}</span>
                                <span className="text-[9px] text-brand-gray font-medium mt-0.5">{m.phone}</span>
                              </div>
                            </div>
                            <span className="text-[9px] text-brand-blue font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">UPI Linked</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Next/Submit Control Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={step === 3 ? handleSubmit : handleNextStep}
                  className="w-full py-3.5 bg-brand-blue text-white rounded-xl font-bold text-xs shadow-md hover:bg-brand-blue-hover active-scale transition-all flex items-center justify-center gap-2 tap-highlight-transparent cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : step === 3 ? (
                    <>
                      <span>Submit & Open Group</span>
                      <FiCheck className="w-4 h-4 stroke-[2.5]" />
                    </>
                  ) : (
                    <span>Proceed to Next Step</span>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
