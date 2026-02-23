import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/">Dashboard</Link>
      <Link to="/members">Members</Link>
      <Link to="/chits">Chits</Link>
      <Link to="/collections">Collections</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;