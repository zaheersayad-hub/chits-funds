// Simplified Calculation Engine for ChitTrack
// Focuses purely on payment totals, collections, and status tracking for rural chit funds.

/**
 * Calculates collection metrics and member ledger for a single chit group.
 */
export const calculateGroupMetrics = (group, payments = [], winners = []) => {
  const members = group.members || [];
  const totalMembers = members.length;
  const monthlyAmount = group.monthlyAmount || 0;
  const poolSize = monthlyAmount * totalMembers;
  const currentMonth = group.currentMonth || 1;

  // Filter payments and winners for this specific group
  const groupPayments = payments.filter(p => p.groupId === group.id);
  const groupWinners = winners.filter(w => w.groupId === group.id);

  // Payments for the current month cycle
  const currentMonthPayments = groupPayments.filter(p => Number(p.month) === Number(currentMonth));
  const collectedAmount = currentMonthPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  const paidCount = currentMonthPayments.length;
  const pendingCount = Math.max(0, totalMembers - paidCount);
  const pendingAmount = pendingCount * monthlyAmount;

  // Compile member ledger
  const memberLedger = members.map(member => {
    const memberPayments = groupPayments.filter(p => p.memberId === member.id);
    const totalPaid = memberPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    
    const winRecord = groupWinners.find(w => w.winnerName === member.name);
    const wonMonth = winRecord ? winRecord.month : null;
    const isWinner = wonMonth !== null;
    
    // expected contribution up to current active month
    const expectedDues = monthlyAmount * currentMonth;
    const pendingDues = Math.max(0, expectedDues - totalPaid);

    // check if paid for the current month
    const hasPaidCurrentMonth = currentMonthPayments.some(p => p.memberId === member.id);
    const currentMonthPayment = currentMonthPayments.find(p => p.memberId === member.id);

    return {
      memberId: member.id,
      name: member.name,
      phone: member.phone,
      address: member.address,
      avatar: member.avatar,
      totalPaid,
      wonMonth,
      isWinner,
      pendingDues,
      status: hasPaidCurrentMonth ? 'Paid' : 'Pending',
      paymentDate: currentMonthPayment ? currentMonthPayment.paymentDate : null,
      paymentMode: currentMonthPayment ? currentMonthPayment.paymentMode : null,
      receiptId: currentMonthPayment ? currentMonthPayment.receiptId : null
    };
  });

  return {
    totalMembers,
    poolSize,
    collectedAmount,
    pendingAmount,
    paidCount,
    pendingCount,
    memberLedger,
    groupPayments,
    groupWinners
  };
};

/**
 * Calculates global system-wide aggregates for dashboard reporting.
 */
export const calculateGlobalMetrics = (groups = [], payments = [], winners = []) => {
  const totalGroups = groups.length;
  let totalMembers = 0;
  let totalCollectedThisMonth = 0;
  let totalPendingCollections = 0;

  groups.forEach(group => {
    totalMembers += group.members ? group.members.length : 0;
    const metrics = calculateGroupMetrics(group, payments, winners);
    totalCollectedThisMonth += metrics.collectedAmount;
    totalPendingCollections += metrics.pendingAmount;
  });

  // Sort and fetch latest 5 payments globally
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
    .slice(0, 5);

  // Sort and fetch latest 5 winners globally
  const latestWinners = [...winners]
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    .slice(0, 5);

  return {
    totalGroups,
    totalMembers,
    totalCollectedThisMonth,
    totalPendingCollections,
    recentPayments,
    latestWinners
  };
};
