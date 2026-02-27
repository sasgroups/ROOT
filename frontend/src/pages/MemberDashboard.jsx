import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyChitGroups, fetchMyAuctions } from '../api';

const MemberDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsRes, auctionsRes] = await Promise.all([
        fetchMyChitGroups(),
        fetchMyAuctions(),
      ]);
      setGroups(groupsRes.data);
      setAuctions(auctionsRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    }
  };

  return (
    <div className="container">
      <h2>Welcome, Member!</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3>Your Chit Groups</h3>
        {groups.length === 0 ? (
          <p>You are not enrolled in any chit group.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Monthly Contribution</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(g => (
                <tr key={g._id}>
                  <td>{g.name}</td>
                  <td>₹{g.monthlyContribution}</td>
                  <td>{g.durationMonths} months</td>
                  <td>{g.status}</td>
                  <td><Link to={`/my-chit-groups`} className="btn btn-secondary">View Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Upcoming Auctions</h3>
        {auctions.length === 0 ? (
          <p>No upcoming auctions.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>Month</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map(a => (
                <tr key={a._id}>
                  <td>{a.chitGroup?.name}</td>
                  <td>{a.monthNumber}</td>
                  <td>{new Date(a.auctionDate).toLocaleDateString()}</td>
                  <td>{a.status}</td>
                  <td>
                    <Link to={`/auctions/member/${a._id}`} className="btn btn-primary">View / Bid</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;