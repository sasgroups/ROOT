import React, { useState, useEffect } from 'react';
import { fetchChitGroups, fetchPaymentsByChit, recordPayment, fetchChitGroupDetails } from '../api';

const Collections = () => {
  const [chits, setChits] = useState([]);
  const [selectedChit, setSelectedChit] = useState('');
  const [chitMembers, setChitMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ chitMemberId: '', month: '', amount: '', remarks: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchChitGroups().then(res => setChits(res.data)).catch(err => setError('Failed to load chit groups'));
  }, []);

  useEffect(() => {
    if (selectedChit) {
      loadChitDetails(selectedChit);
      loadPayments(selectedChit);
    } else {
      setChitMembers([]);
      setPayments([]);
    }
  }, [selectedChit]);

  const loadChitDetails = async (chitId) => {
    try {
      const res = await fetchChitGroupDetails(chitId);
      setChitMembers(res.data.members || []);
    } catch (err) {
      setError('Failed to load chit members');
    }
  };

  const loadPayments = async (chitId) => {
    try {
      const res = await fetchPaymentsByChit(chitId);
      setPayments(res.data);
    } catch (err) {
      setError('Failed to load payments');
    }
  };

  const handleRecord = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await recordPayment(form);
      setSuccess('Payment recorded successfully');
      setForm({ chitMemberId: '', month: '', amount: '', remarks: '' });
      if (selectedChit) {
        loadPayments(selectedChit);
        loadChitDetails(selectedChit); // Refresh member payment status
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording payment');
    }
  };

  const getMemberName = (memberId) => {
    const member = chitMembers.find(m => m.member?._id === memberId || m._id === memberId);
    return member ? member.member?.name || member.name : 'Unknown';
  };

  return (
    <div className="container">
      <h2>Collections</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Select Chit Group</h3>
        <select value={selectedChit} onChange={(e) => setSelectedChit(e.target.value)}>
          <option value="">-- Select a Chit Group --</option>
          {chits.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {selectedChit && (
        <>
          <div className="card">
            <h3>Record Payment</h3>
            <form onSubmit={handleRecord}>
              <div>
                <label>Chit Member:</label>
                <select 
                  name="chitMemberId" 
                  value={form.chitMemberId} 
                  onChange={(e) => setForm({...form, chitMemberId: e.target.value})}
                  required
                >
                  <option value="">Select Member</option>
                  {chitMembers.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.member?.name} (ID: {m._id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Month Number:</label>
                <input 
                  type="number" 
                  name="month" 
                  value={form.month} 
                  onChange={(e) => setForm({...form, month: e.target.value})} 
                  required 
                  min="1"
                />
              </div>
              <div>
                <label>Amount:</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={form.amount} 
                  onChange={(e) => setForm({...form, amount: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label>Remarks:</label>
                <input 
                  name="remarks" 
                  value={form.remarks} 
                  onChange={(e) => setForm({...form, remarks: e.target.value})} 
                />
              </div>
              <button type="submit" className="btn btn-primary">Record Payment</button>
            </form>
          </div>

          <div className="card">
            <h3>Payment History</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td>{new Date(p.paymentDate).toLocaleString()}</td>
                    <td>{p.member?.name || getMemberName(p.member)}</td>
                    <td>{p.month}</td>
                    <td>{p.amount}</td>
                    <td>{p.remarks}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No payments recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Collections; 