import React, { useState, useEffect } from 'react';
import { fetchSubscriptions, fetchMembers, fetchChitGroups, paySubscription } from '../api';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [chitGroups, setChitGroups] = useState([]);
  const [filters, setFilters] = useState({ memberId: '', chitGroupId: '' });
  const [paymentForm, setPaymentForm] = useState({
    subscriptionId: '',
    amountPaid: '',
    paymentMethod: 'cash',
    transactionId: '',
    remarks: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMembers();
    loadChitGroups();
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [filters]);

  const loadMembers = async () => {
    try {
      const { data } = await fetchMembers();
      setMembers(data);
    } catch (err) {
      setError('Failed to load members');
    }
  };

  const loadChitGroups = async () => {
    try {
      const { data } = await fetchChitGroups();
      setChitGroups(data);
    } catch (err) {
      setError('Failed to load chit groups');
    }
  };

  const loadSubscriptions = async () => {
    try {
      const params = {};
      if (filters.memberId) params.memberId = filters.memberId;
      if (filters.chitGroupId) params.chitGroupId = filters.chitGroupId;
      const { data } = await fetchSubscriptions(params);
      setSubscriptions(data);
    } catch (err) {
      setError('Failed to load subscriptions');
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await paySubscription(paymentForm);
      setSuccess('Payment recorded');
      setPaymentForm({ subscriptionId: '', amountPaid: '', paymentMethod: 'cash', transactionId: '', remarks: '' });
      loadSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="container">
      <h2>Subscriptions</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Filters</h3>
        <select
          value={filters.memberId}
          onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
        >
          <option value="">All Members</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
        <select
          value={filters.chitGroupId}
          onChange={(e) => setFilters({ ...filters, chitGroupId: e.target.value })}
        >
          <option value="">All Chit Groups</option>
          {chitGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
      </div>

      <div className="card">
        <h3>Record Payment</h3>
        <form onSubmit={handlePay}>
          <select
            value={paymentForm.subscriptionId}
            onChange={(e) => setPaymentForm({ ...paymentForm, subscriptionId: e.target.value })}
            required
          >
            <option value="">Select Subscription</option>
            {subscriptions.filter(s => s.status !== 'paid').map(s => (
              <option key={s._id} value={s._id}>
                {s.member?.name} - Month {s.monthNumber} (Due: {s.amount})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount Paid"
            value={paymentForm.amountPaid}
            onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
            required
          />
          <select
            value={paymentForm.paymentMethod}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
          <input
            placeholder="Transaction ID (if any)"
            value={paymentForm.transactionId}
            onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
          />
          <input
            placeholder="Remarks"
            value={paymentForm.remarks}
            onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">Record Payment</button>
        </form>
      </div>

      <div className="card">
        <h3>Subscriptions List</h3>
        <table>
          <thead>
            <tr>
              <th>Member</th><th>Group</th><th>Month</th><th>Due Date</th><th>Amount</th><th>Paid</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(s => (
              <tr key={s._id}>
                <td>{s.member?.name}</td>
                <td>{s.chitGroup?.name}</td>
                <td>{s.monthNumber}</td>
                <td>{new Date(s.dueDate).toLocaleDateString()}</td>
                <td>{s.amount}</td>
                <td>{s.paidAmount}</td>
                <td>{s.status}</td>
              </tr>
            ))}
            {subscriptions.length === 0 && <tr><td colSpan="7">No subscriptions</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;