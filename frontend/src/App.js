import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Public pages
import Login from './pages/Login';

// Admin pages
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Chits from './pages/Chits';
import ChitDetail from './pages/ChitDetail';
import Subscriptions from './pages/Subscriptions';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import Collections from './pages/Collections';

// Member pages
import MemberDashboard from './pages/MemberDashboard';
import MemberChitGroups from './pages/MemberChitGroups';
import MemberAuctions from './pages/MemberAuctions';
import Ledger from './pages/Ledger';

const App = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Router>
      <Toaster position="top-right" />
      {localStorage.getItem('token') && <Navbar />}
      <main className="container mx-auto px-4 py-6">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Root – role‑based redirect */}
          <Route path="/" element={
            <PrivateRoute>
              {user.role === 'admin' ? <Dashboard /> : <MemberDashboard />}
            </PrivateRoute>
          } />

          {/* Admin only */}
          <Route path="/members" element={<PrivateRoute allowedRoles={['admin']}><Members /></PrivateRoute>} />
          <Route path="/chits" element={<PrivateRoute allowedRoles={['admin']}><Chits /></PrivateRoute>} />
          <Route path="/chits/:id" element={<PrivateRoute allowedRoles={['admin']}><ChitDetail /></PrivateRoute>} />
          <Route path="/subscriptions" element={<PrivateRoute allowedRoles={['admin']}><Subscriptions /></PrivateRoute>} />
          <Route path="/auctions" element={<PrivateRoute allowedRoles={['admin']}><Auctions /></PrivateRoute>} />
          <Route path="/auctions/:id" element={<PrivateRoute allowedRoles={['admin']}><AuctionDetail /></PrivateRoute>} />
          <Route path="/collections" element={<PrivateRoute allowedRoles={['admin']}><Collections /></PrivateRoute>} />

          {/* Member only */}
          <Route path="/my-chit-groups" element={<PrivateRoute allowedRoles={['member']}><MemberChitGroups /></PrivateRoute>} />
          <Route path="/my-auctions" element={<PrivateRoute allowedRoles={['member']}><MemberAuctions /></PrivateRoute>} />
          <Route path="/my-ledger" element={<PrivateRoute allowedRoles={['member']}><Ledger /></PrivateRoute>} />
          <Route path="/auctions/member/:id" element={<PrivateRoute allowedRoles={['member']}><AuctionDetail /></PrivateRoute>} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;