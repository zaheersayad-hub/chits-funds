import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChitContext } from '../context/ChitContext';
import { FiHome, FiUsers, FiCreditCard, FiUser, FiLogOut, FiLayers } from 'react-icons/fi';
import BottomNav from './BottomNav';

export default function MobileFrame({ children }) {
  const { user, logout, groups } = useContext(ChitContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === '/';

  // Render children directly on login page (no navigation frames)
  if (isLoginPage || !user) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center font-sans antialiased text-brand-dark">
        <div className="w-full max-w-md min-h-screen md:min-h-0 md:h-auto bg-white md:rounded-3xl md:shadow-2xl border-0 md:border border-brand-border overflow-hidden flex flex-col p-2">
          {children}
        </div>
      </div>
    );
  }

  // Count pending payments for the current user to display badges in Sidebar too!
  const pendingCount = groups.reduce((count, group) => {
    const userMember = group.members.find(m => m.name === 'Rajesh Kumar');
    return count + (userMember?.status === 'Pending' ? 1 : 0);
  }, 0);

  const sidebarItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FiHome },
    { to: '/groups', label: 'Chit Groups', icon: FiUsers },
    { to: '/payments', label: 'Payments Portal', icon: FiCreditCard, badge: pendingCount > 0 ? pendingCount : null },
    { to: '/profile', label: 'Profile Settings', icon: FiUser },
  ];

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex font-sans antialiased text-brand-dark">
      
      {/* Desktop Left Sidebar (Visible from `md` screens) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-border h-screen sticky top-0 shrink-0 z-40 shadow-xs">
        
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-brand-border flex items-center gap-3 shrink-0 select-none">
          <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center shadow-md">
            <FiLayers className="w-5.5 h-5.5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-black text-brand-dark text-base tracking-tight leading-tight">ChitTrack</h1>
            <span className="text-[9px] text-brand-gray font-bold tracking-wider uppercase">Group Savings</span>
          </div>
        </div>

        {/* Sidebar Navigation Menu Links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs transition-all active-scale tap-highlight-transparent ${
                    isActive
                      ? 'bg-blue-50 text-brand-blue shadow-xs'
                      : 'text-brand-gray hover:bg-slate-50 hover:text-brand-dark'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-brand-danger text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 min-w-5 text-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-brand-border bg-slate-50 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center shrink-0 border border-white shadow-xs">
              {user.avatar}
            </div>
            <div className="truncate">
              <span className="font-extrabold text-xs text-brand-dark block truncate leading-tight">{user.name}</span>
              <span className="text-[9px] text-brand-gray font-semibold block mt-0.5 truncate">{user.upi}</span>
            </div>
          </div>
          
          <button
            onClick={handleLogoutClick}
            className="w-8 h-8 rounded-lg bg-white border border-brand-border text-brand-gray hover:text-brand-danger hover:border-red-200 flex items-center justify-center shadow-2xs active-scale transition-colors shrink-0"
            title="Log Out"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* Main Responsive Viewport Content Area */}
      <main className="flex-grow flex flex-col min-h-screen relative overflow-hidden">
        
        {/* Render Page View */}
        <div className="flex-grow flex flex-col overflow-y-auto bg-brand-bg relative no-scrollbar">
          {children}
        </div>

        {/* Mobile/Tablet Bottom Navigation Bar (Hidden on `md` screens) */}
        <div className="md:hidden">
          <BottomNav />
        </div>

      </main>

    </div>
  );
}
