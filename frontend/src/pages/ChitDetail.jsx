import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchChitGroupDetails, addMemberToChit, fetchMembers } from '../api';

const ChitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chitGroup, setChitGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [chitRes, membersRes] = await Promise.all([
        fetchChitGroupDetails(id),
        fetchMembers()
      ]);
      setChitGroup(chitRes.data.chitGroup);
      setMembers(chitRes.data.members || []);
      // For dropdown, we need all available members (not yet in this chit)
      // We'll filter out already added members
      const allMembers = membersRes.data;
      const addedMemberIds = chitRes.data.members.map(m => m.member._id);
      const availableMembers = allMembers.filter(m => !addedMemberIds.includes(m._id));
      setAvailableMembers(availableMembers);
    } catch (err) {
      setError('Failed to load chit details');
    } finally {
      setLoading(false);
    }
  };

  const [availableMembers, setAvailableMembers] = useState([]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      await addMemberToChit(id, selectedMember);
      // Refresh data
      loadData();
      setSelectedMember('');
    } catch (err) {
      setError('Failed to add member');
    }
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

      <div className="card">
        <h3>Chit Group Details</h3>
        <p><strong>Total Amount:</strong> {chitGroup.totalAmount}</p>
        <p><strong>Monthly Contribution:</strong> {chitGroup.monthlyContribution}</p>
        <p><strong>Duration (months):</strong> {chitGroup.durationMonths}</p>
        <p><strong>Start Date:</strong> {new Date(chitGroup.startDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {chitGroup.status}</p>
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
        <h3>Members in this Chit Group</h3>
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
                    {cm.payments.filter(p => p.status === 'paid').length}/{cm.payments.length} paid
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