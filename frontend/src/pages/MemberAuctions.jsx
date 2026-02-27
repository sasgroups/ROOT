import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyAuctions } from '../api';

const MemberAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      const res = await fetchMyAuctions();
      setAuctions(res.data);
    } catch (err) {
      setError('Failed to load auctions');
    }
  };

  return (
    <div className="container">
      <h2>Auctions You Can Participate In</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Chit Group</th>
              <th>Month</th>
              <th>Auction Date</th>
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
            {auctions.length === 0 && <tr><td colSpan="5">No auctions available.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberAuctions;