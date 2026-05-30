import React, { createContext, useState, useEffect } from 'react';

export const ChitContext = createContext();

const MOCK_MEMBERS_TEMPLATES = [
  { name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK' },
  { name: 'Anita Sharma', phone: '9123456780', upi: 'anita@oksbi', avatar: 'AS' },
  { name: 'Sunita Verma', phone: '9234567891', upi: 'sunita@okhdfc', avatar: 'SV' },
  { name: 'Ram Singh', phone: '9345678902', upi: 'ramsingh@paytm', avatar: 'RS' },
  { name: 'Amit Patel', phone: '9456789013', upi: 'amitpatel@axl', avatar: 'AP' },
  { name: 'Vikram Rathore', phone: '9567890124', upi: 'vikram@ybl', avatar: 'VR' },
  { name: 'Pooja Choudhary', phone: '9678901235', upi: 'pooja@oksbi', avatar: 'PC' },
  { name: 'Dinesh Yadav', phone: '9789012346', upi: 'dinesh@paytm', avatar: 'DY' },
  { name: 'Suresh Gupta', phone: '9890123457', upi: 'suresh@okhdfc', avatar: 'SG' },
  { name: 'Kavita Nair', phone: '9901234568', upi: 'kavita@axl', avatar: 'KN' },
  { name: 'Harpreet Singh', phone: '9012345679', upi: 'harpreet@ybl', avatar: 'HS' },
  { name: 'Meena Patel', phone: '9123098765', upi: 'meena@oksbi', avatar: 'MP' },
];

// Initial Prepopulated Groups with dynamic auction and commission states
const INITIAL_GROUPS = [
  {
    id: 'g1',
    name: 'Kudumbashree Monthly Chit',
    monthlyAmount: 5000,
    totalMonths: 12,
    currentMonth: 4,
    commissionPercentage: 5, // 5% organizer commission
    commissionModel: 'discount',
    payableAmount: 4667.5, // Current month's payable amount (₹5,000 - ₹332.5 dividend from month 3)
    gradient: 'from-blue-600 to-indigo-700',
    members: [
      { id: 'm1', name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK', status: 'Paid', paymentDate: '2026-05-25', paidAmount: 4667.5 },
      { id: 'm2', name: 'Anita Sharma', phone: '9123456780', upi: 'anita@oksbi', avatar: 'AS', status: 'Paid', paymentDate: '2026-05-24', paidAmount: 4667.5 },
      { id: 'm3', name: 'Sunita Verma', phone: '9234567891', upi: 'sunita@okhdfc', avatar: 'SV', status: 'Pending' },
      { id: 'm4', name: 'Ram Singh', phone: '9345678902', upi: 'ramsingh@paytm', avatar: 'RS', status: 'Pending' },
      { id: 'm5', name: 'Amit Patel', phone: '9456789013', upi: 'amitpatel@axl', avatar: 'AP', status: 'Paid', paymentDate: '2026-05-28', paidAmount: 4667.5 },
      { id: 'm6', name: 'Vikram Rathore', phone: '9567890124', upi: 'vikram@ybl', avatar: 'VR', status: 'Pending' },
      { id: 'm7', name: 'Pooja Choudhary', phone: '9678901235', upi: 'pooja@oksbi', avatar: 'PC', status: 'Paid', paymentDate: '2026-05-27', paidAmount: 4667.5 },
      { id: 'm8', name: 'Dinesh Yadav', phone: '9789012346', upi: 'dinesh@paytm', avatar: 'DY', status: 'Pending' },
      { id: 'm9', name: 'Suresh Gupta', phone: '9890123457', upi: 'suresh@okhdfc', avatar: 'SG', status: 'Paid', paymentDate: '2026-05-26', paidAmount: 4667.5 },
      { id: 'm10', name: 'Kavita Nair', phone: '9901234568', upi: 'kavita@axl', avatar: 'KN', status: 'Pending' },
    ],
    auctionHistory: [
      { month: 1, winnerName: 'Anita Sharma', bidAmount: 48000, discount: 2000, commission: 100, dividendPool: 1900, dividendPerMember: 190, payableAmount: 4810, date: '2026-02-15' },
      { month: 2, winnerName: 'Sunita Verma', bidAmount: 47200, discount: 2800, commission: 140, dividendPool: 2660, dividendPerMember: 266, payableAmount: 4734, date: '2026-03-15' },
      { month: 3, winnerName: 'Meena Patel', bidAmount: 46500, discount: 3500, commission: 175, dividendPool: 3325, dividendPerMember: 332.5, payableAmount: 4667.5, date: '2026-04-15' },
    ],
  },
  {
    id: 'g2',
    name: 'Farmers Crop Growth Fund',
    monthlyAmount: 10000,
    totalMonths: 10,
    currentMonth: 2,
    commissionPercentage: 3, // 3% organizer commission
    commissionModel: 'discount',
    payableAmount: 9515, // (₹10,000 - ₹485 dividend from Month 1)
    gradient: 'from-emerald-600 to-teal-700',
    members: [
      { id: 'm1', name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK', status: 'Pending' },
      { id: 'm4', name: 'Ram Singh', phone: '9345678902', upi: 'ramsingh@paytm', avatar: 'RS', status: 'Paid', paymentDate: '2026-05-20', paidAmount: 9515 },
      { id: 'm5', name: 'Amit Patel', phone: '9456789013', upi: 'amitpatel@axl', avatar: 'AP', status: 'Paid', paymentDate: '2026-05-21', paidAmount: 9515 },
      { id: 'm6', name: 'Vikram Rathore', phone: '9567890124', upi: 'vikram@ybl', avatar: 'VR', status: 'Paid', paymentDate: '2026-05-23', paidAmount: 9515 },
      { id: 'm8', name: 'Dinesh Yadav', phone: '9789012346', upi: 'dinesh@paytm', avatar: 'DY', status: 'Pending' },
      { id: 'm9', name: 'Suresh Gupta', phone: '9890123457', upi: 'suresh@okhdfc', avatar: 'SG', status: 'Pending' },
      { id: 'm11', name: 'Harpreet Singh', phone: '9012345679', upi: 'harpreet@ybl', avatar: 'HS', status: 'Paid', paymentDate: '2026-05-22', paidAmount: 9515 },
      { id: 'm12', name: 'Meena Patel', phone: '9123098765', upi: 'meena@oksbi', avatar: 'MP', status: 'Paid', paymentDate: '2026-05-25', paidAmount: 9515 },
    ],
    auctionHistory: [
      { month: 1, winnerName: 'Ram Singh', bidAmount: 76000, discount: 4000, commission: 120, dividendPool: 3880, dividendPerMember: 485, payableAmount: 9515, date: '2026-04-10' },
    ],
  },
  {
    id: 'g3',
    name: 'Shopkeepers Merchant Union',
    monthlyAmount: 20000,
    totalMonths: 15,
    currentMonth: 1,
    commissionPercentage: 5,
    commissionModel: 'fixed',
    payableAmount: 20000, // Month 1, no dividend discount yet
    gradient: 'from-orange-500 to-amber-600',
    members: [
      { id: 'm1', name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK', status: 'Pending' },
      { id: 'm2', name: 'Anita Sharma', phone: '9123456780', upi: 'anita@oksbi', avatar: 'AS', status: 'Pending' },
      { id: 'm5', name: 'Amit Patel', phone: '9456789013', upi: 'amitpatel@axl', avatar: 'AP', status: 'Pending' },
      { id: 'm6', name: 'Vikram Rathore', phone: '9567890124', upi: 'vikram@ybl', avatar: 'VR', status: 'Pending' },
      { id: 'm7', name: 'Pooja Choudhary', phone: '9678901235', upi: 'pooja@oksbi', avatar: 'PC', status: 'Pending' },
      { id: 'm8', name: 'Dinesh Yadav', phone: '9789012346', upi: 'dinesh@paytm', avatar: 'DY', status: 'Pending' },
      { id: 'm10', name: 'Kavita Nair', phone: '9901234568', upi: 'kavita@axl', avatar: 'KN', status: 'Pending' },
      { id: 'm11', name: 'Harpreet Singh', phone: '9012345679', upi: 'harpreet@ybl', avatar: 'HS', status: 'Pending' },
    ],
    auctionHistory: [],
  }
];

// Initial Transactions log
const INITIAL_TRANSACTIONS = [
  { id: 't1', groupName: 'Kudumbashree Monthly Chit', memberName: 'Rajesh Kumar', amount: 4667.5, date: '2026-05-25', status: 'Success', upi: 'rajesh@ybl' },
  { id: 't2', groupName: 'Kudumbashree Monthly Chit', memberName: 'Anita Sharma', amount: 4667.5, date: '2026-05-24', status: 'Success', upi: 'anita@oksbi' },
  { id: 't3', groupName: 'Farmers Crop Growth Fund', memberName: 'Ram Singh', amount: 9515, date: '2026-05-20', status: 'Success', upi: 'ramsingh@paytm' },
  { id: 't4', groupName: 'Farmers Crop Growth Fund', memberName: 'Amit Patel', amount: 9515, date: '2026-05-21', status: 'Success', upi: 'amitpatel@axl' },
  { id: 't5', groupName: 'Kudumbashree Monthly Chit', memberName: 'Pooja Choudhary', amount: 4667.5, date: '2026-05-27', status: 'Success', upi: 'pooja@oksbi' }
];

export const ChitProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chittrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [groups, setGroups] = useState(() => {
    try {
      const savedGroups = localStorage.getItem('chittrack_groups');
      if (savedGroups) {
        const parsed = JSON.parse(savedGroups);
        return parsed.map(g => {
          const mCount = g.members ? g.members.length : 10;
          const commPct = g.commissionPercentage || 5;
          const commModel = g.commissionModel || 'discount';
          const hist = g.auctionHistory || g.winnerHistory || [];
          
          // Migrate old history entries to ensure they contain all calculations
          const migratedHistory = hist.map(h => {
            const bid = h.bidAmount || 0;
            const pool = g.monthlyAmount * mCount;
            const discount = h.discount !== undefined ? h.discount : Math.max(0, pool - bid);
            const commission = h.commission !== undefined ? h.commission : (commModel === 'fixed' ? pool * (commPct / 100) : discount * (commPct / 100));
            const dividendPool = h.dividendPool !== undefined ? h.dividendPool : Math.max(0, discount - commission);
            const dividendPerMember = h.dividendPerMember !== undefined ? h.dividendPerMember : dividendPool / mCount;
            const payable = h.payableAmount !== undefined ? h.payableAmount : g.monthlyAmount - dividendPerMember;
            
            return {
              month: h.month,
              winnerName: h.winnerName || h.name || 'Unknown Winner',
              bidAmount: bid,
              discount,
              commission,
              dividendPool,
              dividendPerMember,
              payableAmount: payable,
              date: h.date || new Date().toISOString().split('T')[0]
            };
          });

          return {
            ...g,
            commissionPercentage: commPct,
            commissionModel: commModel,
            payableAmount: g.payableAmount !== undefined ? g.payableAmount : g.monthlyAmount,
            gradient: g.gradient || 'from-blue-600 to-indigo-700',
            auctionHistory: migratedHistory,
            members: g.members ? g.members.map(m => ({
              ...m,
              paidAmount: m.paidAmount || 0,
              status: m.status || 'Pending'
            })) : []
          };
        });
      }
      return INITIAL_GROUPS;
    } catch (e) {
      return INITIAL_GROUPS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const savedTxns = localStorage.getItem('chittrack_transactions');
      return savedTxns ? JSON.parse(savedTxns) : INITIAL_TRANSACTIONS;
    } catch (e) {
      return INITIAL_TRANSACTIONS;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('chittrack_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chittrack_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('chittrack_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('chittrack_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Auth Operations
  const login = (phone) => {
    const loggedInUser = {
      name: 'Rajesh Kumar',
      phone: phone || '9876543210',
      upi: 'rajesh@ybl',
      avatar: 'RK'
    };
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
  };

  // Group Operations
  const createGroup = (newGroupData) => {
    const gradients = [
      'from-blue-600 to-indigo-700',
      'from-emerald-600 to-teal-700',
      'from-orange-500 to-amber-600',
      'from-rose-600 to-pink-700',
      'from-purple-600 to-violet-700'
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    
    const groupMembers = newGroupData.members.map((m, idx) => ({
      id: `m_${Date.now()}_${idx}`,
      name: m.name,
      phone: m.phone || '9999999999',
      upi: m.upi || `${m.name.toLowerCase().replace(/\s/g, '')}@ybl`,
      avatar: m.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      status: 'Pending',
      paymentDate: null,
      paidAmount: 0
    }));

    if (!groupMembers.some(m => m.name === user?.name)) {
      groupMembers.unshift({
        id: 'm1',
        name: user?.name || 'Rajesh Kumar',
        phone: user?.phone || '9876543210',
        upi: user?.upi || 'rajesh@ybl',
        avatar: 'RK',
        status: 'Pending',
        paymentDate: null,
        paidAmount: 0
      });
    }

    const newGroup = {
      id: `g_${Date.now()}`,
      name: newGroupData.name,
      monthlyAmount: Number(newGroupData.monthlyAmount),
      totalMonths: Number(newGroupData.totalMonths),
      currentMonth: 1,
      commissionPercentage: Number(newGroupData.commissionPercentage || 5),
      commissionModel: newGroupData.commissionModel || 'discount',
      payableAmount: Number(newGroupData.monthlyAmount), // Month 1 base payable
      gradient: randomGradient,
      members: groupMembers,
      auctionHistory: [],
    };

    setGroups(prev => [newGroup, ...prev]);
    return newGroup.id;
  };

  // Settle Month N Bidding Auction
  const submitAuctionBid = (groupId, winnerName, bidAmount) => {
    setGroups(prevGroups => {
      return prevGroups.map(group => {
        if (group.id !== groupId) return group;

        const totalMembers = group.members.length;
        const monthlyAmount = group.monthlyAmount;
        const monthlyPool = monthlyAmount * totalMembers;
        
        const winningBidVal = Number(bidAmount);
        const discountVal = monthlyPool - winningBidVal;
        
        const commModel = group.commissionModel || 'discount';
        const commissionVal = commModel === 'fixed'
          ? monthlyPool * (group.commissionPercentage / 100)
          : discountVal * (group.commissionPercentage / 100);

        const dividendPoolVal = Math.max(0, discountVal - commissionVal);
        const dividendPerMemberVal = dividendPoolVal / totalMembers;
        const nextMonthPayableVal = Math.max(0, monthlyAmount - dividendPerMemberVal);

        // Create new auction history entry
        const newAuctionRecord = {
          month: group.currentMonth,
          winnerName: winnerName,
          bidAmount: winningBidVal,
          discount: discountVal,
          commission: commissionVal,
          dividendPool: dividendPoolVal,
          dividendPerMember: dividendPerMemberVal,
          payableAmount: nextMonthPayableVal,
          date: new Date().toISOString().split('T')[0]
        };

        // Reset members payment status for next month
        const updatedMembers = group.members.map(member => ({
          ...member,
          status: 'Pending',
          paymentDate: null,
          paidAmount: 0
        }));

        return {
          ...group,
          currentMonth: group.currentMonth + 1,
          payableAmount: nextMonthPayableVal,
          members: updatedMembers,
          auctionHistory: [...(group.auctionHistory || []), newAuctionRecord]
        };
      });
    });
  };

  // Payment Operations
  const markPayment = (groupId, memberId, notes = '') => {
    setGroups(prevGroups => {
      return prevGroups.map(group => {
        if (group.id !== groupId) return group;
        
        const updatedMembers = group.members.map(member => {
          if (member.id !== memberId) return member;
          
          const newTx = {
            id: `t_${Date.now()}`,
            groupName: group.name,
            memberName: member.name,
            amount: group.payableAmount, // Paid amount matches current cycle payable
            date: new Date().toISOString().split('T')[0],
            status: 'Success',
            upi: member.upi
          };
          setTransactions(prevTx => [newTx, ...prevTx]);

          return {
            ...member,
            status: 'Paid',
            paymentDate: newTx.date,
            paidAmount: group.payableAmount
          };
        });

        return {
          ...group,
          members: updatedMembers
        };
      });
    });
  };

  const getMockMembersTemplates = () => MOCK_MEMBERS_TEMPLATES;

  return (
    <ChitContext.Provider value={{
      user,
      groups,
      transactions,
      login,
      logout,
      createGroup,
      submitAuctionBid,
      markPayment,
      getMockMembersTemplates
    }}>
      {children}
    </ChitContext.Provider>
  );
};
