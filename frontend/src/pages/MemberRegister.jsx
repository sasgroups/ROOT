import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerMember } from '../api';

const MemberRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    nomineeName: '',
    nomineeRelation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const { data } = await registerMember(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h2>Member Registration</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label>Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required />

          <label>Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />

          <label>Password *</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />

          <label>Phone *</label>
          <input name="phone" value={form.phone} onChange={handleChange} required />

          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} />

          <label>Nominee Name</label>
          <input name="nomineeName" value={form.nomineeName} onChange={handleChange} />

          <label>Nominee Relation</label>
          <input name="nomineeRelation" value={form.nomineeRelation} onChange={handleChange} />

          <button type="submit" className="btn btn-primary">Register</button>
        </form>
      </div>
    </div>
  );
};

export default MemberRegister;