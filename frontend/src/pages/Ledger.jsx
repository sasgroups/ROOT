import React, { useState, useEffect } from 'react';
import { fetchMyLedger } from '../api';

const Ledger = () => {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      const { data } = await fetchMyLedger();
      setEntries(data);
    } catch (err) {
      setError('Failed to load ledger');
    }
  };

  return (
    <div className="container">
      <h2>My Ledger</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <table>
          <thead>
            <tr><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr key={idx}>
                <td>{new Date(e.transactionDate).toLocaleDateString()}</td>
                <td>{e.description}</td>
                <td>₹{e.debit}</td>
                <td>₹{e.credit}</td>
                <td>₹{e.balance}</td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan="5">No transactions</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ledger;