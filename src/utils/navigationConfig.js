import { FiHome, FiUsers, FiCreditCard, FiClock, FiUser } from 'react-icons/fi';

export const NAVIGATION_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/groups', label: 'Groups', icon: FiUsers },
  { to: '/payments', label: 'Payments', icon: FiCreditCard },
  { to: '/history', label: 'History', icon: FiClock },
  { to: '/profile', label: 'Profile', icon: FiUser }
];
