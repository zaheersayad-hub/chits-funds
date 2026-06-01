import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChitProvider } from './context/ChitContext';
import MobileFrame from './components/MobileFrame';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails';
import Payments from './pages/Payments';
import History from './pages/History';
import Profile from './pages/Profile';

export default function App() {
  return (
    <ChitProvider>
      <BrowserRouter>
        <MobileFrame>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/group/:id" element={<GroupDetails />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            {/* Fallback to Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MobileFrame>
      </BrowserRouter>
    </ChitProvider>
  );
}
