// pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { fetchChitGroups, fetchMembers } from '../api';
import Spinner from '../components/Spinner';
import { Users, PiggyBank } from 'lucide-react';

const Dashboard = () => {
  const [chitCount, setChitCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [chitsRes, membersRes] = await Promise.all([
          fetchChitGroups(),
          fetchMembers(),
        ]);
        setChitCount(chitsRes.data.length);
        setMemberCount(membersRes.data.length);
      } catch (error) {
        // Error already toasted by interceptor
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 bg-indigo-100 rounded-full mr-4">
            <PiggyBank className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase">Total Chit Groups</p>
            <p className="text-3xl font-bold text-gray-800">{chitCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 bg-green-100 rounded-full mr-4">
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase">Total Members</p>
            <p className="text-3xl font-bold text-gray-800">{memberCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;