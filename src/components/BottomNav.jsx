import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiCreditCard, FiClock } from 'react-icons/fi';
import { ChitContext } from '../context/ChitContext';

export default function BottomNav() {
  const { groups, payments } = useContext(ChitContext);

  // Count pending payments for the current user (Rajesh Kumar)
  const pendingCount = groups.reduce((count, group) => {
    const member = group.members.find(m => m.name === 'Rajesh Kumar');
    if (!member) return count;
    
    const isPaid = payments.some(p => 
      p.groupId === group.id && 
      p.memberId === member.id && 
      Number(p.month) === Number(group.currentMonth)
    );
    
    return count + (isPaid ? 0 : 1);
  }, 0);

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: FiHome },
    { to: '/groups', label: 'Groups', icon: FiUsers },
    { to: '/payments', label: 'Payments', icon: FiCreditCard, badge: pendingCount > 0 ? pendingCount : null },
    { to: '/history', label: 'History', icon: FiClock },
  ];

  return (
    <div className="h-18 bg-white border-t border-brand-border flex items-center justify-around px-4 select-none shrink-0 z-40 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 w-16 relative transition-all duration-200 tap-highlight-transparent active-scale ${
                isActive ? 'text-brand-blue font-semibold scale-105' : 'text-brand-gray font-medium'
              }`
            }
          >
            {/* Active Indicator Top Dot */}
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 w-4 h-0.75 bg-brand-blue rounded-full"></span>
                )}
                <div className="relative">
                  <Icon className="w-5.5 h-5.5 mb-1" />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 bg-brand-danger text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white flex items-center justify-center min-w-4.5 min-h-4.5">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
