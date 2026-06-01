import React, { createContext, useState, useEffect } from 'react';

export const ChitContext = createContext();

const MOCK_MEMBERS_TEMPLATES = [
  { name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK', address: 'Ward 3, Village Center' },
  { name: 'Anita Sharma', phone: '9123456780', upi: 'anita@oksbi', avatar: 'AS', address: 'Ganesh Nagar Lane 2' },
  { name: 'Sunita Verma', phone: '9234567891', upi: 'sunita@okhdfc', avatar: 'SV', address: 'Main Market Road' },
  { name: 'Ram Singh', phone: '9345678902', upi: 'ramsingh@paytm', avatar: 'RS', address: 'Farmers Colony' },
  { name: 'Amit Patel', phone: '9456789013', upi: 'amitpatel@axl', avatar: 'AP', address: 'Near Old Temple' },
  { name: 'Vikram Rathore', phone: '9567890124', upi: 'vikram@ybl', avatar: 'VR', address: 'Rathore Farmhouse' },
  { name: 'Pooja Choudhary', phone: '9678901235', upi: 'pooja@oksbi', avatar: 'PC', address: 'Panchayat Road' },
  { name: 'Dinesh Yadav', phone: '9789012346', upi: 'dinesh@paytm', avatar: 'DY', address: 'Yadav Vihar' },
  { name: 'Suresh Gupta', phone: '9890123457', upi: 'suresh@okhdfc', avatar: 'SG', address: 'Gupta General Store' },
];

const INITIAL_GROUPS = [
  {
    id: 'g1',
    name: 'Village Friends Chit',
    monthlyAmount: 10000,
    totalMembers: 4,
    currentMonth: 3,
    startDate: '2026-03-01',
    gradient: 'from-blue-600 to-indigo-700',
    members: [
      { id: 'm1', name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK', address: 'Ward 3, Village Center' },
      { id: 'm2', name: 'Anita Sharma', phone: '9123456780', upi: 'anita@oksbi', avatar: 'AS', address: 'Ganesh Nagar Lane 2' },
      { id: 'm3', name: 'Sunita Verma', phone: '9234567891', upi: 'sunita@okhdfc', avatar: 'SV', address: 'Main Market Road' },
      { id: 'm4', name: 'Ram Singh', phone: '9345678902', upi: 'ramsingh@paytm', avatar: 'RS', address: 'Farmers Colony' }
    ]
  },
  {
    id: 'g2',
    name: 'Farmers Savings Union',
    monthlyAmount: 5000,
    totalMembers: 6,
    currentMonth: 2,
    startDate: '2026-05-01',
    gradient: 'from-emerald-600 to-teal-700',
    members: [
      { id: 'm1', name: 'Rajesh Kumar', phone: '9876543210', upi: 'rajesh@ybl', avatar: 'RK', address: 'Ward 3, Village Center' },
      { id: 'm5', name: 'Amit Patel', phone: '9456789013', upi: 'amitpatel@axl', avatar: 'AP', address: 'Near Old Temple' },
      { id: 'm6', name: 'Vikram Rathore', phone: '9567890124', upi: 'vikram@ybl', avatar: 'VR', address: 'Rathore Farmhouse' },
      { id: 'm7', name: 'Pooja Choudhary', phone: '9678901235', upi: 'pooja@oksbi', avatar: 'PC', address: 'Panchayat Road' },
      { id: 'm8', name: 'Dinesh Yadav', phone: '9789012346', upi: 'dinesh@paytm', avatar: 'DY', address: 'Yadav Vihar' },
      { id: 'm9', name: 'Suresh Gupta', phone: '9890123457', upi: 'suresh@okhdfc', avatar: 'SG', address: 'Gupta General Store' }
    ]
  }
];

const INITIAL_PAYMENTS = [
  // Group 1 - Month 1
  { id: 'p1', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm1', memberName: 'Rajesh Kumar', amountPaid: 10000, paymentDate: '2026-03-05', paymentMode: 'UPI', receiptId: 'CT-10101', month: 1 },
  { id: 'p2', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm2', memberName: 'Anita Sharma', amountPaid: 10000, paymentDate: '2026-03-06', paymentMode: 'Cash', receiptId: 'CT-10102', month: 1 },
  { id: 'p3', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm3', memberName: 'Sunita Verma', amountPaid: 10000, paymentDate: '2026-03-07', paymentMode: 'Bank Transfer', receiptId: 'CT-10103', month: 1 },
  { id: 'p4', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm4', memberName: 'Ram Singh', amountPaid: 10000, paymentDate: '2026-03-08', paymentMode: 'UPI', receiptId: 'CT-10104', month: 1 },
  // Group 1 - Month 2
  { id: 'p5', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm1', memberName: 'Rajesh Kumar', amountPaid: 10000, paymentDate: '2026-04-05', paymentMode: 'UPI', receiptId: 'CT-20101', month: 2 },
  { id: 'p6', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm2', memberName: 'Anita Sharma', amountPaid: 10000, paymentDate: '2026-04-06', paymentMode: 'Cash', receiptId: 'CT-20102', month: 2 },
  { id: 'p7', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm3', memberName: 'Sunita Verma', amountPaid: 10000, paymentDate: '2026-04-07', paymentMode: 'Bank Transfer', receiptId: 'CT-20103', month: 2 },
  { id: 'p8', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm4', memberName: 'Ram Singh', amountPaid: 10000, paymentDate: '2026-04-08', paymentMode: 'UPI', receiptId: 'CT-20104', month: 2 },
  // Group 1 - Month 3 (Current)
  { id: 'p9', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm1', memberName: 'Rajesh Kumar', amountPaid: 10000, paymentDate: '2026-05-05', paymentMode: 'UPI', receiptId: 'CT-30101', month: 3 },
  { id: 'p10', groupId: 'g1', groupName: 'Village Friends Chit', memberId: 'm2', memberName: 'Anita Sharma', amountPaid: 10000, paymentDate: '2026-05-06', paymentMode: 'Cash', receiptId: 'CT-30102', month: 3 },

  // Group 2 - Month 1
  { id: 'p11', groupId: 'g2', groupName: 'Farmers Savings Union', memberId: 'm1', memberName: 'Rajesh Kumar', amountPaid: 5000, paymentDate: '2026-05-05', paymentMode: 'UPI', receiptId: 'CT-11101', month: 1 },
  { id: 'p12', groupId: 'g2', groupName: 'Farmers Savings Union', memberId: 'm5', memberName: 'Amit Patel', amountPaid: 5000, paymentDate: '2026-05-06', paymentMode: 'UPI', receiptId: 'CT-11102', month: 1 },
  { id: 'p13', groupId: 'g2', groupName: 'Farmers Savings Union', memberId: 'm6', memberName: 'Vikram Rathore', amountPaid: 5000, paymentDate: '2026-05-06', paymentMode: 'Cash', receiptId: 'CT-11103', month: 1 },
  { id: 'p14', groupId: 'g2', groupName: 'Farmers Savings Union', memberId: 'm7', memberName: 'Pooja Choudhary', amountPaid: 5000, paymentDate: '2026-05-07', paymentMode: 'Cash', receiptId: 'CT-11104', month: 1 },
  { id: 'p15', groupId: 'g2', groupName: 'Farmers Savings Union', memberId: 'm8', memberName: 'Dinesh Yadav', amountPaid: 5000, paymentDate: '2026-05-08', paymentMode: 'Bank Transfer', receiptId: 'CT-11105', month: 1 },
  { id: 'p16', groupId: 'g2', groupName: 'Farmers Savings Union', memberId: 'm9', memberName: 'Suresh Gupta', amountPaid: 5000, paymentDate: '2026-05-09', paymentMode: 'Cash', receiptId: 'CT-11106', month: 1 },
  // Group 2 - Month 2 (Current)
  { id: 'p17', groupId: 'g2', groupName: 'Farmers Savings Union', memberId: 'm1', memberName: 'Rajesh Kumar', amountPaid: 5000, paymentDate: '2026-06-01', paymentMode: 'UPI', receiptId: 'CT-22101', month: 2 },
  { id: 'p18', groupId: 'g2', groupName: 'Farmers Savings Union', memberId: 'm5', memberName: 'Amit Patel', amountPaid: 5000, paymentDate: '2026-06-01', paymentMode: 'UPI', receiptId: 'CT-22102', month: 2 },
];

const INITIAL_WINNERS = [
  // Group 1
  { id: 'w1', groupId: 'g1', groupName: 'Village Friends Chit', month: 1, winnerName: 'Rajesh Kumar', amountReleased: 40000, releaseDate: '2026-03-10' },
  { id: 'w2', groupId: 'g1', groupName: 'Village Friends Chit', month: 2, winnerName: 'Anita Sharma', amountReleased: 40000, releaseDate: '2026-04-10' },
  // Group 2
  { id: 'w3', groupId: 'g2', groupName: 'Farmers Savings Union', month: 1, winnerName: 'Amit Patel', amountReleased: 30000, releaseDate: '2026-05-12' },
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

  const [payments, setPayments] = useState(() => {
    const savedPayments = localStorage.getItem('chittrack_payments');
    return savedPayments ? JSON.parse(savedPayments) : INITIAL_PAYMENTS;
  });

  const [winners, setWinners] = useState(() => {
    const savedWinners = localStorage.getItem('chittrack_winners');
    return savedWinners ? JSON.parse(savedWinners) : INITIAL_WINNERS;
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
    localStorage.setItem('chittrack_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('chittrack_winners', JSON.stringify(winners));
  }, [winners]);

  const login = (phone) => {
    const loggedInUser = {
      name: 'Rajesh Kumar',
      phone: phone || '9876543210',
      upi: 'rajesh@ybl',
      avatar: 'RK',
      address: 'Ward 3, Village Center'
    };
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
  };

  const createGroup = (groupData) => {
    const gradients = [
      'from-blue-600 to-indigo-700',
      'from-emerald-600 to-teal-700',
      'from-orange-500 to-amber-600',
      'from-rose-600 to-pink-700',
      'from-purple-600 to-violet-700'
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const members = groupData.members.map((m, idx) => ({
      id: `m_${Date.now()}_${idx}`,
      name: m.name,
      phone: m.phone || '9999999999',
      address: m.address || 'Local area',
      avatar: m.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
    }));

    // Auto add organizer Rajesh Kumar as the first member if not already added
    if (!members.some(m => m.name === 'Rajesh Kumar')) {
      members.unshift({
        id: 'm1',
        name: 'Rajesh Kumar',
        phone: '9876543210',
        upi: 'rajesh@ybl',
        avatar: 'RK',
        address: 'Ward 3, Village Center'
      });
    }

    const newGroup = {
      id: `g_${Date.now()}`,
      name: groupData.name,
      monthlyAmount: Number(groupData.monthlyAmount),
      totalMembers: members.length,
      currentMonth: 1,
      startDate: groupData.startDate || new Date().toISOString().split('T')[0],
      gradient: randomGradient,
      image: groupData.image || null,
      members: members
    };

    setGroups(prev => [newGroup, ...prev]);
    return newGroup.id;
  };

  const recordPayment = (groupId, memberId, month, amountPaid, paymentMode, paymentDate, transactionRef) => {
    const group = groups.find(g => g.id === groupId);
    const member = group?.members.find(m => m.id === memberId);
    
    if (!group || !member) return null;

    const receiptNum = Math.floor(10000 + Math.random() * 90000);
    const newPayment = {
      id: `p_${Date.now()}`,
      groupId,
      groupName: group.name,
      memberId,
      memberName: member.name,
      amountPaid: Number(amountPaid),
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      paymentMode: paymentMode || 'UPI',
      receiptId: `CT-${receiptNum}`,
      month: Number(month),
      transactionRef: transactionRef || ''
    };

    setPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  const declareWinner = (groupId, month, winnerName, amountReleased, releaseDate) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return null;

    const newWinner = {
      id: `w_${Date.now()}`,
      groupId,
      groupName: group.name,
      month: Number(month),
      winnerName,
      amountReleased: Number(amountReleased),
      releaseDate: releaseDate || new Date().toISOString().split('T')[0]
    };

    setWinners(prev => [newWinner, ...prev]);

    // Advance current month in group
    setGroups(prevGroups => 
      prevGroups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            currentMonth: g.currentMonth + 1
          };
        }
        return g;
      })
    );

    return newWinner;
  };

  const getMockMembersTemplates = () => MOCK_MEMBERS_TEMPLATES;

  return (
    <ChitContext.Provider value={{
      user,
      groups,
      payments,
      winners,
      login,
      logout,
      createGroup,
      recordPayment,
      declareWinner,
      getMockMembersTemplates
    }}>
      {children}
    </ChitContext.Provider>
  );
};
