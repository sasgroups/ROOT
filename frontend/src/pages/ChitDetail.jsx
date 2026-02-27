import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchChitGroupDetails,
  addMemberToChit,
  fetchMembers,
  fetchSubscriptions,
  generateSubscriptions,
} from '../api';

const ChitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chitGroup, setChitGroup] = useState(null);
  const [members, setMembers] = useState([]); // ChitMember records
  const [availableMembers, setAvailableMembers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setError('');
    setSuccess('');
    try {
      // Fetch chit group details (includes members)
      const chitRes = await fetchChitGroupDetails(id);
      setChitGroup(chitRes.data.chitGroup);
      const chitMembers = chitRes.data.members || [];
      setMembers(chitMembers);

      // Fetch all members to build available list
      const membersRes = await fetchMembers();
      const allMembers = membersRes.data;
      const addedMemberIds = chitMembers.map(cm => cm.member._id);
      const available = allMembers.filter(m => !addedMemberIds.includes(m._id));
      setAvailableMembers(available);

      // Fetch subscriptions for this chit group
      await loadSubscriptions();
    } catch (err) {
      setError('Failed to load chit details');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const subsRes = await fetchSubscriptions({ chitGroupId: id });
      setSubscriptions(subsRes.data);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
      // Don't show error to user, just keep subscriptions empty
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setError('');
    setSuccess('');
    try {
      await addMemberToChit(id, selectedMember);
      setSuccess('Member added successfully');
      loadData(); // refresh all data
      setSelectedMember('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleGenerateSubscriptions = async () => {
    if (!window.confirm('Generate subscriptions for all months? This will create pending subscriptions for every member in this group.'))
      return;
    setError('');
    setSuccess('');
    try {
      await generateSubscriptions(id);
      setSuccess('Subscriptions generated successfully');
      loadSubscriptions(); // refresh subscriptions
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate subscriptions');
    }
  };

  // Compute paid count per member from subscriptions
  const getPaidCount = (memberId) => {
    return subscriptions.filter(s => s.member === memberId && s.status === 'paid').length;
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!chitGroup) return <div className="container">Chit group not found</div>;

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={() => navigate('/chits')}>
        &larr; Back to Chits
      </button>

      <h2>{chitGroup.name}</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Chit Group Details</h3>
        <p><strong>Total Amount:</strong> ₹{chitGroup.totalAmount}</p>
        <p><strong>Monthly Contribution:</strong> ₹{chitGroup.monthlyContribution}</p>
        <p><strong>Duration (months):</strong> {chitGroup.durationMonths}</p>
        <p><strong>Start Date:</strong> {new Date(chitGroup.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(chitGroup.endDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {chitGroup.status}</p>
        <p><strong>Auction Day:</strong> {chitGroup.auctionDay}</p>
        <p><strong>Commission:</strong> {chitGroup.commissionPercent}%</p>
      </div>

      <div className="card">
        <h3>Add Member to This Chit</h3>
        <form onSubmit={handleAddMember}>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            required
          >
            <option value="">Select a member</option>
            {availableMembers.map(m => (
              <option key={m._id} value={m._id}>{m.name} ({m.phone})</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Add Member</button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Members in this Chit Group</h3>
          <button onClick={handleGenerateSubscriptions} className="btn btn-primary">
            Generate Subscriptions
          </button>
        </div>
        {members.length === 0 ? (
          <p>No members added yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Winning Month</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map(cm => (
                <tr key={cm._id}>
                  <td>{cm.member.name}</td>
                  <td>{cm.member.phone}</td>
                  <td>{cm.member.email}</td>
                  <td>{new Date(cm.joinedDate).toLocaleDateString()}</td>
                  <td>{cm.winningMonth || 'Not yet'}</td>
                  <td>
                    {getPaidCount(cm.member._id)} / {chitGroup.durationMonths} paid
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

export default ChitDetail;