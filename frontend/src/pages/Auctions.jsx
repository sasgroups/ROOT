import React, { useState, useEffect } from 'react';
import { fetchAuctions, fetchChitGroups, createAuction } from '../api';
import { Link } from 'react-router-dom';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [chitGroups, setChitGroups] = useState([]);
  const [selectedChit, setSelectedChit] = useState('');
  const [form, setForm] = useState({ chitGroupId: '', monthNumber: '', auctionDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadChitGroups();
  }, []);

  useEffect(() => {
    if (selectedChit) loadAuctions(selectedChit);
  }, [selectedChit]);

  const loadChitGroups = async () => {
    try {
      const { data } = await fetchChitGroups();
      setChitGroups(data);
    } catch (err) {
      setError('Failed to load chit groups');
    }
  };

  const loadAuctions = async (chitId) => {
    try {
      const { data } = await fetchAuctions(chitId);
      setAuctions(data);
    } catch (err) {
      setError('Failed to load auctions');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createAuction(form);
      setSuccess('Auction created');
      setForm({ chitGroupId: '', monthNumber: '', auctionDate: '' });
      if (form.chitGroupId) loadAuctions(form.chitGroupId);
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    }
  };

  return (
    <div className="container">
      <h2>Auctions (Admin)</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Create New Auction</h3>
        <form onSubmit={handleCreate}>
          <select value={form.chitGroupId} onChange={(e) => setForm({ ...form, chitGroupId: e.target.value })} required>
            <option value="">Select Chit Group</option>
            {chitGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
          <input type="number" placeholder="Month Number" value={form.monthNumber} onChange={(e) => setForm({ ...form, monthNumber: e.target.value })} required />
          <input type="date" value={form.auctionDate} onChange={(e) => setForm({ ...form, auctionDate: e.target.value })} required />
          <button type="submit" className="btn btn-primary">Create Auction</button>
        </form>
      </div>

      <div className="card">
        <h3>Filter by Chit Group</h3>
        <select value={selectedChit} onChange={(e) => setSelectedChit(e.target.value)}>
          <option value="">-- Select Chit Group --</option>
          {chitGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
      </div>

      {selectedChit && (
        <div className="card">
          <h3>Auctions for Selected Group</h3>
          <table>
            <thead>
              <tr><th>Month</th><th>Date</th><th>Status</th><th>Winner</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {auctions.map(a => (
                <tr key={a._id}>
                  <td>{a.monthNumber}</td>
                  <td>{new Date(a.auctionDate).toLocaleDateString()}</td>
                  <td>{a.status}</td>
                  <td>{a.winnerMember?.name || '—'}</td>
                  <td><Link to={`/auctions/${a._id}`} className="btn btn-secondary">View</Link></td>
                </tr>
              ))}
              {auctions.length === 0 && <tr><td colSpan="5">No auctions</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Auctions;