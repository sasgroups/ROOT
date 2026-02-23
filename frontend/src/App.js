import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Chits from './pages/Chits';
import ChitDetail from './pages/ChitDetail';
import Collections from './pages/Collections';
import Navbar from './components/Navbar';

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      {isAuthenticated() && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/members" element={<PrivateRoute><Members /></PrivateRoute>} />
        <Route path="/chits" element={<PrivateRoute><Chits /></PrivateRoute>} />
        <Route path="/chits/:id" element={<PrivateRoute><ChitDetail /></PrivateRoute>} />
        <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;