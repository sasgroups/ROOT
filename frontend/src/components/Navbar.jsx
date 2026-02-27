// components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const adminLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/members', label: 'Members' },
    { to: '/chits', label: 'Chits' },
    { to: '/subscriptions', label: 'Subscriptions' },
    { to: '/auctions', label: 'Auctions' },
    { to: '/collections', label: 'Collections' },
  ];

  const memberLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/my-chit-groups', label: 'My Chit Groups' },
    { to: '/my-auctions', label: 'Auctions' },
    { to: '/my-ledger', label: 'My Ledger' },
  ];

  const links = user.role === 'admin' ? adminLinks : memberLinks;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link to="/" className="text-xl font-bold text-indigo-600">
            ChitFund Manager
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              <LogOut size={18} className="mr-1" /> Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium"
            >
              <LogOut size={18} className="mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;