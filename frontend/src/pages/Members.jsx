import React, { useState, useEffect } from 'react';
import { fetchMembers, createMember, updateMember, deleteMember } from '../api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data } = await fetchMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load members');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMember(editingId, form);
        setEditingId(null);
      } else {
        await createMember(form);
      }
      setForm({ name: '', phone: '', email: '', address: '' });
      loadMembers();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving member');
    }
  };

  const handleEdit = (member) => {
    setForm(member);
    setEditingId(member._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(id);
        loadMembers();
      } catch (err) {
        setError('Failed to delete member');
      }
    }
  };

  return (
    <div className="container">
      <h2>Members</h2>
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="card">
        <h3>{editingId ? 'Edit Member' : 'Add New Member'}</h3>
        <form onSubmit={handleSubmit}>
          <input 
            name="name" 
            placeholder="Name" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="phone" 
            placeholder="Phone" 
            value={form.phone} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
          />
          <input 
            name="address" 
            placeholder="Address" 
            value={form.address} 
            onChange={handleChange} 
          />
          <div>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { 
                  setEditingId(null); 
                  setForm({ name: '', phone: '', email: '', address: '' }); 
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Member List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>{m.address}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(m)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(m._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Members;