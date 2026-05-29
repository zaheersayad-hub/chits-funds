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

const INITIAL_GROUPS = [
  {
    id: 'g1',
    name: 'Kudumbashree Monthly Chit',
    monthlyAmount: 5000,
    totalMonths: 12,
    currentMonth: 4,
    gradient: 'from-blue-600 to-indigo-700',
    members: [
      { id: 'm1', name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK', status: 'Paid', paymentDate: '2026-05-25' },
      { id: 'm2', name: 'Anita Sharma', phone: '9123456780', upi: 'anita@oksbi', avatar: 'AS', status: 'Paid', paymentDate: '2026-05-24' },
      { id: 'm3', name: 'Sunita Verma', phone: '9234567891', upi: 'sunita@okhdfc', avatar: 'SV', status: 'Pending' },
      { id: 'm4', name: 'Ram Singh', phone: '9345678902', upi: 'ramsingh@paytm', avatar: 'RS', status: 'Pending' },
      { id: 'm5', name: 'Amit Patel', phone: '9456789013', upi: 'amitpatel@axl', avatar: 'AP', status: 'Paid', paymentDate: '2026-05-28' },
      { id: 'm6', name: 'Vikram Rathore', phone: '9567890124', upi: 'vikram@ybl', avatar: 'VR', status: 'Pending' },
      { id: 'm7', name: 'Pooja Choudhary', phone: '9678901235', upi: 'pooja@oksbi', avatar: 'PC', status: 'Paid', paymentDate: '2026-05-27' },
      { id: 'm8', name: 'Dinesh Yadav', phone: '9789012346', upi: 'dinesh@paytm', avatar: 'DY', status: 'Pending' },
      { id: 'm9', name: 'Suresh Gupta', phone: '9890123457', upi: 'suresh@okhdfc', avatar: 'SG', status: 'Paid', paymentDate: '2026-05-26' },
      { id: 'm10', name: 'Kavita Nair', phone: '9901234568', upi: 'kavita@axl', avatar: 'KN', status: 'Pending' },
    ],
    winnerHistory: [
      { month: 1, name: 'Anita Sharma', bidAmount: 48000, date: '2026-02-15', payout: 48000 },
      { month: 2, name: 'Sunita Verma', bidAmount: 47200, date: '2026-03-15', payout: 47200 },
      { month: 3, name: 'Meena Patel', bidAmount: 46500, date: '2026-04-15', payout: 46500 },
    ],
  },
  {
    id: 'g2',
    name: 'Farmers Crop Growth Fund',
    monthlyAmount: 10000,
    totalMonths: 10,
    currentMonth: 2,
    gradient: 'from-emerald-600 to-teal-700',
    members: [
      { id: 'm1', name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK', status: 'Pending' },
      { id: 'm4', name: 'Ram Singh', phone: '9345678902', upi: 'ramsingh@paytm', avatar: 'RS', status: 'Paid', paymentDate: '2026-05-20' },
      { id: 'm5', name: 'Amit Patel', phone: '9456789013', upi: 'amitpatel@axl', avatar: 'AP', status: 'Paid', paymentDate: '2026-05-21' },
      { id: 'm6', name: 'Vikram Rathore', phone: '9567890124', upi: 'vikram@ybl', avatar: 'VR', status: 'Paid', paymentDate: '2026-05-23' },
      { id: 'm8', name: 'Dinesh Yadav', phone: '9789012346', upi: 'dinesh@paytm', avatar: 'DY', status: 'Pending' },
      { id: 'm9', name: 'Suresh Gupta', phone: '9890123457', upi: 'suresh@okhdfc', avatar: 'SG', status: 'Pending' },
      { id: 'm11', name: 'Harpreet Singh', phone: '9012345679', upi: 'harpreet@ybl', avatar: 'HS', status: 'Paid', paymentDate: '2026-05-22' },
      { id: 'm12', name: 'Meena Patel', phone: '9123098765', upi: 'meena@oksbi', avatar: 'MP', status: 'Paid', paymentDate: '2026-05-25' },
    ],
    winnerHistory: [
      { month: 1, name: 'Ram Singh', bidAmount: 76000, date: '2026-04-10', payout: 76000 },
    ],
  },
  {
    id: 'g3',
    name: 'Shopkeepers Merchant Union',
    monthlyAmount: 20000,
    totalMonths: 15,
    currentMonth: 1,
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
    winnerHistory: [],
  }
];

const INITIAL_TRANSACTIONS = [
  { id: 't1', groupName: 'Kudumbashree Monthly Chit', memberName: 'Rajesh Kumar', amount: 5000, date: '2026-05-25', status: 'Success', upi: 'rajesh@ybl' },
  { id: 't2', groupName: 'Kudumbashree Monthly Chit', memberName: 'Anita Sharma', amount: 5000, date: '2026-05-24', status: 'Success', upi: 'anita@oksbi' },
  { id: 't3', groupName: 'Farmers Crop Growth Fund', memberName: 'Ram Singh', amount: 10000, date: '2026-05-20', status: 'Success', upi: 'ramsingh@paytm' },
  { id: 't4', groupName: 'Farmers Crop Growth Fund', memberName: 'Amit Patel', amount: 10000, date: '2026-05-21', status: 'Success', upi: 'amitpatel@axl' },
  { id: 't5', groupName: 'Kudumbashree Monthly Chit', memberName: 'Pooja Choudhary', amount: 5000, date: '2026-05-27', status: 'Success', upi: 'pooja@oksbi' }
];

export const ChitProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chittrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [groups, setGroups] = useState(() => {
    const savedGroups = localStorage.getItem('chittrack_groups');
    return savedGroups ? JSON.parse(savedGroups) : INITIAL_GROUPS;
  });

  const [transactions, setTransactions] = useState(() => {
    const savedTxns = localStorage.getItem('chittrack_transactions');
    return savedTxns ? JSON.parse(savedTxns) : INITIAL_TRANSACTIONS;
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
    // Simulated login with standard user Rajesh Kumar
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
    
    // Map initial selected members
    const groupMembers = newGroupData.members.map((m, idx) => ({
      id: `m_${Date.now()}_${idx}`,
      name: m.name,
      phone: m.phone || '9999999999',
      upi: m.upi || `${m.name.toLowerCase().replace(/\s/g, '')}@ybl`,
      avatar: m.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      status: m.name === 'Rajesh Kumar' ? 'Pending' : (Math.random() > 0.4 ? 'Paid' : 'Pending'),
      paymentDate: m.name === 'Rajesh Kumar' ? null : '2026-05-28'
    }));

    // Ensure the current user is added as first member if not present
    if (!groupMembers.some(m => m.name === user?.name)) {
      groupMembers.unshift({
        id: 'm1',
        name: user?.name || 'Rajesh Kumar',
        phone: user?.phone || '9876543210',
        upi: user?.upi || 'rajesh@ybl',
        avatar: 'RK',
        status: 'Pending',
        paymentDate: null
      });
    }

    const newGroup = {
      id: `g_${Date.now()}`,
      name: newGroupData.name,
      monthlyAmount: Number(newGroupData.monthlyAmount),
      totalMonths: Number(newGroupData.totalMonths),
      currentMonth: 1,
      gradient: randomGradient,
      members: groupMembers,
      winnerHistory: [],
    };

    setGroups(prev => [newGroup, ...prev]);
    return newGroup.id;
  };

  // Payment Operations
  const markPayment = (groupId, memberId, notes = '') => {
    setGroups(prevGroups => {
      return prevGroups.map(group => {
        if (group.id !== groupId) return group;
        
        const updatedMembers = group.members.map(member => {
          if (member.id !== memberId) return member;
          
          // Generate new transaction
          const newTx = {
            id: `t_${Date.now()}`,
            groupName: group.name,
            memberName: member.name,
            amount: group.monthlyAmount,
            date: new Date().toISOString().split('T')[0],
            status: 'Success',
            upi: member.upi
          };
          setTransactions(prevTx => [newTx, ...prevTx]);

          return {
            ...member,
            status: 'Paid',
            paymentDate: newTx.date
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
      markPayment,
      getMockMembersTemplates
    }}>
      {children}
    </ChitContext.Provider>
  );
};
