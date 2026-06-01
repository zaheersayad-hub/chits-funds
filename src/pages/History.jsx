import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiAward, FiFileText, FiDollarSign, FiSearch, FiPrinter, FiDownload, FiClock, FiCheckCircle } from 'react-icons/fi';

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

export default function History() {
  const { payments, winners, groups, user } = useContext(ChitContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('collections'); // collections | payments | winners | pending
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');

  // 1. Monthly Collection Report calculations
  // Expand each group into a list of its months and calculate monthly status
  const collectionsReportData = [];
  groups.forEach(group => {
    const limit = Math.min(group.members.length, group.currentMonth);
    for (let month = 1; month <= limit; month++) {
      const monthPayments = payments.filter(p => p.groupId === group.id && Number(p.month) === month);
      const collected = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const target = group.monthlyAmount * group.members.length;
      const pending = Math.max(0, target - collected);
      const progress = target > 0 ? Math.round((collected / target) * 100) : 0;
      
      const winner = winners.find(w => w.groupId === group.id && Number(w.month) === month)?.winnerName || 'Not Declared';

      collectionsReportData.push({
        groupId: group.id,
        groupName: group.name,
        month: month,
        target: target,
        collected: collected,
        pending: pending,
        progress: progress,
        winner: winner
      });
    }
  });

  // 2. Payments Report filter
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.groupName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.receiptId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroupFilter ? p.groupId === selectedGroupFilter : true;
    return matchesSearch && matchesGroup;
  });

  // 3. Winner Report Data
  const winnerReportData = winners;

  // 4. Pending Members Report calculations (for the current month of each group)
  const pendingMembersReportData = [];
  groups.forEach(group => {
    // Find who has not paid for the active group.currentMonth
    const currentMonthPayments = payments.filter(p => p.groupId === group.id && Number(p.month) === Number(group.currentMonth));
    const pendingMembers = group.members.filter(m => !currentMonthPayments.some(p => p.memberId === m.id));

    pendingMembers.forEach(m => {
      pendingMembersReportData.push({
        groupId: group.id,
        groupName: group.name,
        month: group.currentMonth,
        memberName: m.name,
        phone: m.phone,
        address: m.address || 'Local area',
        dues: group.monthlyAmount
      });
    });
  });

  // CSV Export Utility
  const handleExportExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = 'report.csv';

    if (activeTab === 'collections') {
      csvContent += 'Group Name,Month,Target Pool (INR),Collected (INR),Pending (INR),Progress %,Winner\n';
      collectionsReportData.forEach(row => {
        csvContent += `"${row.groupName}",Month ${row.month},${row.target},${row.collected},${row.pending},${row.progress}%,"${row.winner}"\n`;
      });
      filename = 'Monthly_Collection_Report.csv';
    } 
    else if (activeTab === 'payments') {
      csvContent += 'Receipt ID,Date,Group Name,Member Name,Amount Paid (INR),Mode,Reference\n';
      filteredPayments.forEach(row => {
        csvContent += `"${row.receiptId}",${row.paymentDate},"${row.groupName}","${row.memberName}",${row.amountPaid},"${row.paymentMode}","${row.transactionRef || ''}"\n`;
      });
      filename = 'Payment_Report.csv';
    } 
    else if (activeTab === 'winners') {
      csvContent += 'Group Name,Month Cycle,Winner Name,Amount Released (INR),Release Date\n';
      winnerReportData.forEach(row => {
        csvContent += `"${row.groupName}",Month ${row.month},"${row.winnerName}",${row.amountReleased},${row.releaseDate}\n`;
      });
      filename = 'Winner_Report.csv';
    } 
    else if (activeTab === 'pending') {
      csvContent += 'Group Name,Month,Pending Member Name,Phone,Address,Dues (INR)\n';
      pendingMembersReportData.forEach(row => {
        csvContent += `"${row.groupName}",Month ${row.month},"${row.memberName}","${row.phone}","${row.address}",${row.dues}\n`;
      });
      filename = 'Pending_Members_Report.csv';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export Utility (triggers a clean HTML printable view)
  const handleExportPDF = () => {
    let reportTitle = '';
    let tableHeaderHTML = '';
    let tableBodyHTML = '';

    if (activeTab === 'collections') {
      reportTitle = 'Monthly Collection Report';
      tableHeaderHTML = `
        <tr>
          <th>Group Name</th>
          <th>Month</th>
          <th>Target Pool</th>
          <th>Collected</th>
          <th>Pending</th>
          <th>Progress</th>
          <th>Winner</th>
        </tr>
      `;
      tableBodyHTML = collectionsReportData.map(row => `
        <tr>
          <td>${row.groupName}</td>
          <td>Month ${row.month}</td>
          <td>₹${row.target.toLocaleString('en-IN')}</td>
          <td>₹${row.collected.toLocaleString('en-IN')}</td>
          <td>₹${row.pending.toLocaleString('en-IN')}</td>
          <td>${row.progress}%</td>
          <td>${row.winner}</td>
        </tr>
      `).join('');
    } 
    else if (activeTab === 'payments') {
      reportTitle = 'Payment Report';
      tableHeaderHTML = `
        <tr>
          <th>Receipt ID</th>
          <th>Date</th>
          <th>Group Name</th>
          <th>Member Name</th>
          <th>Amount Paid</th>
          <th>Mode</th>
          <th>Reference</th>
        </tr>
      `;
      tableBodyHTML = filteredPayments.map(row => `
        <tr>
          <td>${row.receiptId}</td>
          <td>${formatDateNice(row.paymentDate)}</td>
          <td>${row.groupName}</td>
          <td>${row.memberName}</td>
          <td>₹${row.amountPaid.toLocaleString('en-IN')}</td>
          <td>${row.paymentMode}</td>
          <td>${row.transactionRef || '-'}</td>
        </tr>
      `).join('');
    } 
    else if (activeTab === 'winners') {
      reportTitle = 'Winner Report';
      tableHeaderHTML = `
        <tr>
          <th>Group Name</th>
          <th>Month Cycle</th>
          <th>Winner Name</th>
          <th>Amount Released</th>
          <th>Release Date</th>
        </tr>
      `;
      tableBodyHTML = winnerReportData.map(row => `
        <tr>
          <td>${row.groupName}</td>
          <td>Month ${row.month}</td>
          <td>${row.winnerName}</td>
          <td>₹${row.amountReleased.toLocaleString('en-IN')}</td>
          <td>${formatDateNice(row.releaseDate)}</td>
        </tr>
      `).join('');
    } 
    else if (activeTab === 'pending') {
      reportTitle = 'Pending Members Report';
      tableHeaderHTML = `
        <tr>
          <th>Group Name</th>
          <th>Active Month</th>
          <th>Pending Member</th>
          <th>Phone</th>
          <th>Address</th>
          <th>Dues</th>
        </tr>
      `;
      tableBodyHTML = pendingMembersReportData.map(row => `
        <tr>
          <td>${row.groupName}</td>
          <td>Month ${row.month}</td>
          <td>${row.memberName}</td>
          <td>${row.phone}</td>
          <td>${row.address}</td>
          <td>₹${row.dues.toLocaleString('en-IN')}</td>
        </tr>
      `).join('');
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 5px; }
            p { font-size: 11px; color: #64748b; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 9px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <h1>ChitTrack - ${reportTitle}</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-IN')} | Generated by: ${user?.name || 'Chit Organizer'}</p>
          <table>
            <thead>
              ${tableHeaderHTML}
            </thead>
            <tbody>
              ${tableBodyHTML}
            </tbody>
          </table>
          <div class="footer">
            Thank you. Recorded digitally via ChitTrack.
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 bg-brand-bg relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-3 border-b border-brand-border/40">
          <div>
            <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Reports & Register</h2>
            <p className="text-xs text-brand-gray font-bold uppercase tracking-wider mt-0.5">Transparency ledger logs</p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 border border-brand-border bg-white text-brand-dark hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center gap-1.5 active-scale cursor-pointer"
            >
              <FiPrinter className="w-4 h-4 text-brand-blue" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-brand-blue text-white hover:bg-brand-blue-hover font-bold text-xs rounded-xl flex items-center gap-1.5 active-scale cursor-pointer"
            >
              <FiDownload className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Big Navigation Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'collections', label: 'Collections', desc: 'Monthly targets & pool progress', icon: FiDollarSign },
            { id: 'payments', label: 'Payments', desc: 'Detailed payment registers', icon: FiFileText },
            { id: 'winners', label: 'Winners', desc: 'Log of monthly releases', icon: FiAward },
            { id: 'pending', label: 'Pending Dues', desc: 'Members outstanding list', icon: FiClock }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                  setSelectedGroupFilter('');
                }}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                    : 'bg-white text-brand-dark border-brand-border hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-6 h-6 mb-3 ${isSelected ? 'text-white' : 'text-brand-blue'}`} />
                <div>
                  <span className="text-xs font-black block leading-none">{tab.label}</span>
                  <span className={`text-[9.5px] mt-1 block leading-tight ${isSelected ? 'text-white/80' : 'text-brand-gray font-medium'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search & Filters block (if applicable) */}
        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray w-4.5 h-4.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member, group or receipt..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
              />
            </div>
            
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs"
            >
              <option value="">All Chit Groups</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Reports Tables */}
        <div className="space-y-4">
          
          {/* REPORT 1: MONTHLY COLLECTIONS */}
          {activeTab === 'collections' && (
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-brand-dark divide-y divide-brand-border">
                  <thead className="bg-slate-50 text-[10px] font-bold text-brand-gray uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Group Name</th>
                      <th className="p-4">Month Cycle</th>
                      <th className="p-4 text-right">Target Pool</th>
                      <th className="p-4 text-right text-brand-success">Collected</th>
                      <th className="p-4 text-right text-brand-danger">Pending Dues</th>
                      <th className="p-4 text-center">Progress</th>
                      <th className="p-4 text-right">Winner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border font-semibold">
                    {collectionsReportData.length > 0 ? (
                      collectionsReportData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-extrabold">{row.groupName}</td>
                          <td className="p-4">Month {row.month}</td>
                          <td className="p-4 text-right">₹{row.target.toLocaleString('en-IN')}</td>
                          <td className="p-4 text-right text-brand-success">₹{row.collected.toLocaleString('en-IN')}</td>
                          <td className="p-4 text-right text-brand-danger">₹{row.pending.toLocaleString('en-IN')}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black ${
                              row.progress === 100 
                                ? 'bg-green-50 text-brand-success border border-green-100' 
                                : 'bg-amber-50 text-amber-500 border border-amber-100'
                            }`}>
                              {row.progress}%
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold text-brand-blue">{row.winner}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-brand-gray font-bold">
                          No collection registers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT 2: PAYMENTS LOG */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-brand-dark divide-y divide-brand-border">
                  <thead className="bg-slate-50 text-[10px] font-bold text-brand-gray uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Receipt ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Group Name</th>
                      <th className="p-4">Member</th>
                      <th className="p-4 text-right">Amount Paid</th>
                      <th className="p-4">Mode</th>
                      <th className="p-4">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border font-semibold">
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-extrabold text-brand-blue">{p.receiptId}</td>
                          <td className="p-4">{formatDateNice(p.paymentDate)}</td>
                          <td className="p-4">{p.groupName}</td>
                          <td className="p-4 font-bold">{p.memberName}</td>
                          <td className="p-4 text-right text-brand-success font-black">₹{p.amountPaid.toLocaleString('en-IN')}</td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-brand-gray px-1.5 py-0.5 rounded text-[9.5px]">
                              {p.paymentMode}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-brand-gray">{p.transactionRef || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-brand-gray font-bold">
                          No payment entries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT 3: WINNERS LOG */}
          {activeTab === 'winners' && (
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-brand-dark divide-y divide-brand-border">
                  <thead className="bg-slate-50 text-[10px] font-bold text-brand-gray uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Group Name</th>
                      <th className="p-4">Month Cycle</th>
                      <th className="p-4">Winner Name</th>
                      <th className="p-4 text-right">Amount Given</th>
                      <th className="p-4">Release Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border font-semibold">
                    {winnerReportData.length > 0 ? (
                      winnerReportData.map(w => (
                        <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-extrabold">{w.groupName}</td>
                          <td className="p-4 font-bold">Month {w.month}</td>
                          <td className="p-4 text-brand-dark font-black">{w.winnerName}</td>
                          <td className="p-4 text-right text-brand-blue font-black">₹{w.amountReleased.toLocaleString('en-IN')}</td>
                          <td className="p-4">{formatDateNice(w.releaseDate)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-brand-gray font-bold">
                          No winner records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT 4: PENDING DUES */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-2xs">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs text-brand-dark divide-y divide-brand-border">
                  <thead className="bg-slate-50 text-[10px] font-bold text-brand-gray uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Group Name</th>
                      <th className="p-4">Active Month</th>
                      <th className="p-4">Pending Member</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Address</th>
                      <th className="p-4 text-right">Dues Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border font-semibold">
                    {pendingMembersReportData.length > 0 ? (
                      pendingMembersReportData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-extrabold">{row.groupName}</td>
                          <td className="p-4">Month {row.month}</td>
                          <td className="p-4 text-brand-dark font-bold">{row.memberName}</td>
                          <td className="p-4 text-brand-gray font-mono">{row.phone}</td>
                          <td className="p-4 text-brand-gray truncate max-w-[120px]">{row.address}</td>
                          <td className="p-4 text-right text-brand-danger font-black">₹{row.dues.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-brand-success font-black flex items-center justify-center gap-1">
                          <FiCheckCircle /> Great! No pending member dues for the active months!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
