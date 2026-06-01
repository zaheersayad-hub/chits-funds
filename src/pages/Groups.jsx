import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { calculateGroupMetrics } from '../utils/calcEngine';
import { FiArrowLeft, FiPlus, FiSearch, FiLayers, FiTrendingUp } from 'react-icons/fi';

export default function Groups() {
  const { groups, payments, winners } = useContext(ChitContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('active'); // active | completed

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Group is completed when currentMonth exceeds members count (totalMonths)
    const isCompleted = group.currentMonth > group.members.length;
    
    if (filter === 'completed') {
      return matchesSearch && isCompleted;
    }
    return matchesSearch && !isCompleted;
  });

  // Calculate sum of total chit values
  const totalSubscribedFunds = groups.reduce((sum, g) => {
    const months = g.members.length;
    return sum + (g.monthlyAmount * g.members.length * months);
  }, 0);

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
              <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Savings Groups</h2>
              <p className="text-xs text-brand-gray font-bold tracking-wider uppercase mt-0.5">Directory of your Chits</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/create-group')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-blue text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-blue-hover active-scale transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" />
            <span>New Group</span>
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          <div className="md:col-span-2 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups by name..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-brand-border rounded-xl font-bold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-white border border-brand-border rounded-xl">
            <button
              onClick={() => setFilter('active')}
              className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                filter === 'active' 
                  ? 'bg-brand-blue text-white shadow-2xs' 
                  : 'text-brand-gray hover:bg-slate-50'
              }`}
            >
              Active ({groups.filter(g => g.currentMonth <= g.members.length).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                filter === 'completed' 
                  ? 'bg-brand-blue text-white shadow-2xs' 
                  : 'text-brand-gray hover:bg-slate-50'
              }`}
            >
              Completed ({groups.filter(g => g.currentMonth > g.members.length).length})
            </button>
          </div>

        </div>

        {/* Portfolio Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-brand-success flex items-center justify-center shrink-0 border border-green-100">
              <FiTrendingUp className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Total Subscribed Chit Value</span>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">₹{totalSubscribedFunds.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          
          <div className="text-xs font-bold text-brand-gray flex items-center gap-1.5 self-start sm:self-center">
            <FiLayers className="text-brand-blue" />
            <span>Tracking {groups.length} groups overall</span>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="space-y-4">
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => {
                const groupMetrics = calculateGroupMetrics(group, payments, winners);
                return (
                  <Link
                    key={group.id}
                    to={`/group/${group.id}`}
                    className="bg-white rounded-2xl border border-brand-border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group active-scale"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 bg-gradient-to-br ${group.gradient} rounded-xl text-white font-extrabold text-sm flex items-center justify-center shadow-2xs`}>
                          {group.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <h4 className="font-extrabold text-xs text-brand-dark group-hover:text-brand-blue transition-colors truncate">
                            {group.name}
                          </h4>
                          <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider block mt-0.5">
                            Start Date: {group.startDate}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-brand-border/60 py-3 text-brand-dark">
                        <div>
                          <span className="text-[9px] text-brand-gray block uppercase font-bold">Monthly amount</span>
                          <span className="font-extrabold">₹{group.monthlyAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-brand-gray block uppercase font-bold">Monthly Pool</span>
                          <span className="font-black text-brand-blue">₹{groupMetrics.poolSize.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-[9.5px] font-black text-brand-blue bg-blue-50/60 px-3 py-1 rounded-full uppercase tracking-wider">
                        Month {group.currentMonth} of {group.members.length}
                      </span>
                      <span className="text-[9px] text-brand-gray font-bold flex items-center gap-0.5 group-hover:text-brand-blue transition-colors">
                        View details <FiArrowLeft className="rotate-180" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-brand-border p-6 shadow-2xs max-w-md mx-auto">
              <FiLayers className="w-12 h-12 text-brand-gray/40 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-brand-dark">No chit groups found</h4>
              <p className="text-xs text-brand-gray mt-1 mb-5">Create a new group to get started.</p>
              <button
                onClick={() => navigate('/create-group')}
                className="px-5 py-3 bg-brand-blue text-white font-bold text-xs rounded-xl shadow-md active-scale hover:bg-brand-blue-hover transition-colors cursor-pointer"
              >
                Create New Group
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
