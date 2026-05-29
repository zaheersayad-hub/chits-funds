import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiArrowLeft, FiPlus, FiSearch, FiLayers, FiCalendar, FiTrendingUp } from 'react-icons/fi';

export default function Groups() {
  const { groups } = useContext(ChitContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('active'); // active | completed

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'completed') {
      return matchesSearch && group.currentMonth > group.totalMonths;
    }
    return matchesSearch && group.currentMonth <= group.totalMonths;
  });

  // Calculations
  const totalSubscribedFunds = groups.reduce((sum, g) => sum + (g.monthlyAmount * g.members.length * g.totalMonths), 0);

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
              <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Savings Groups</h2>
              <p className="text-[10px] text-brand-gray font-bold tracking-wider uppercase mt-0.5">Directory of your Chits</p>
            </div>
          </div>
          
          {/* Create CTA in header */}
          <button
            onClick={() => navigate('/create-group')}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-brand-blue text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-blue-hover active-scale transition-all"
          >
            <FiPlus className="w-4.5 h-4.5" />
            <span>New Group</span>
          </button>
        </div>

        {/* Dynamic Layout Filters & Search Row (Desktop displays them side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Search bar (Takes 2 columns on medium+ screens) */}
          <div className="md:col-span-2 relative animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray w-4.5 h-4.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups by name..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-brand-border rounded-xl font-semibold text-xs text-brand-dark outline-none focus:border-brand-blue shadow-2xs transition-all"
            />
          </div>

          {/* Active/Completed filter tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white border border-brand-border rounded-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => setFilter('active')}
              className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                filter === 'active' 
                  ? 'bg-brand-blue text-white shadow-2xs' 
                  : 'text-brand-gray hover:bg-slate-50'
              }`}
            >
              Active ({groups.filter(g => g.currentMonth <= g.totalMonths).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                filter === 'completed' 
                  ? 'bg-brand-blue text-white shadow-2xs' 
                  : 'text-brand-gray hover:bg-slate-50'
              }`}
            >
              Completed ({groups.filter(g => g.currentMonth > g.totalMonths).length})
            </button>
          </div>

        </div>

        {/* Portfolio Summary Card (Full width, elegant styling) */}
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-brand-success flex items-center justify-center shrink-0 border border-green-100">
              <FiTrendingUp className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Total Portfolio Value (All Subscribed Chits)</span>
              <h3 className="text-xl font-black text-brand-dark tracking-tight">₹{totalSubscribedFunds.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          
          <div className="text-xs font-semibold text-brand-gray flex items-center gap-1.5 self-start sm:self-center">
            <FiLayers className="text-brand-blue" />
            <span>Tracking {groups.length} groups overall</span>
          </div>
        </div>

        {/* Groups List: GRID LAYOUT (1 col mobile, 2 tablet, 3 desktop) */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => (
                <Link
                  key={group.id}
                  to={`/group/${group.id}`}
                  className="bg-white rounded-2xl border border-brand-border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group active-scale"
                >
                  <div className="space-y-4">
                    {/* Header line */}
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 bg-gradient-to-br ${group.gradient} rounded-xl text-white font-extrabold text-sm flex items-center justify-center shadow-2xs`}>
                        {group.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <h4 className="font-extrabold text-xs text-brand-dark group-hover:text-brand-blue transition-colors truncate">
                          {group.name}
                        </h4>
                        <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider block mt-0.5">
                          ID: {group.id}
                        </span>
                      </div>
                    </div>

                    {/* Meta values */}
                    <div className="grid grid-cols-2 gap-2 text-xs border-y border-brand-border/60 py-3 text-brand-dark">
                      <div>
                        <span className="text-[9px] text-brand-gray block uppercase font-semibold">Monthly amount</span>
                        <span className="font-extrabold">₹{group.monthlyAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-brand-gray block uppercase font-semibold">Members</span>
                        <span className="font-bold">{group.members.length} Registered</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer status line */}
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-[9.5px] font-black text-brand-blue bg-blue-50/60 px-3 py-1 rounded-full uppercase tracking-wider">
                      Month {group.currentMonth} of {group.totalMonths}
                    </span>
                    <span className="text-[9px] text-brand-gray font-bold flex items-center gap-0.5 group-hover:text-brand-blue transition-colors">
                      View details <FiArrowLeft className="rotate-180" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-brand-border p-6 shadow-2xs max-w-md mx-auto">
              <FiLayers className="w-12 h-12 text-brand-gray/40 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-brand-dark">No chit groups found</h4>
              <p className="text-xs text-brand-gray mt-1 mb-5">Try adjusting your filters or create a new group to get started.</p>
              <button
                onClick={() => navigate('/create-group')}
                className="px-5 py-3 bg-brand-blue text-white font-bold text-xs rounded-xl shadow-md active-scale hover:bg-brand-blue-hover transition-colors"
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
