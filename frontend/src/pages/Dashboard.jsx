import React, { useEffect, useState } from 'react';
import { fetchChitGroups, fetchMembers } from '../api';

const Dashboard = () => {
  const [chitCount, setChitCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const chitsRes = await fetchChitGroups();
        setChitCount(chitsRes.data.length);
        const membersRes = await fetchMembers();
        setMemberCount(membersRes.data.length);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: '250px' }}>
          <h3>Total Chit Groups</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {chitCount}
          </p>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '250px' }}>
          <h3>Total Members</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {memberCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;