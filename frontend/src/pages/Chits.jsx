import React, { useState, useEffect } from 'react';
import { fetchChitGroups, createChitGroup } from '../api';
import { Link } from 'react-router-dom';

const Chits = () => {
    const [chits, setChits] = useState([]);
    const [form, setForm] = useState({
        name: '',
        totalAmount: '',
        monthlyContribution: '',
        durationMonths: '',
        startDate: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadChits();
    }, []);

    const loadChits = async () => {
        try {
            const { data } = await fetchChitGroups();
            setChits(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load chit groups');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createChitGroup(form);
            setForm({ name: '', totalAmount: '', monthlyContribution: '', durationMonths: '', startDate: '' });
            loadChits();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating chit group');
        }
    };

    return (
        <div className="container">
            <h2>Chit Groups</h2>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <h3>Create New Chit Group</h3>
                <form onSubmit={handleSubmit}>
                    <input name="name" placeholder="Group Name" value={form.name} onChange={handleChange} required />
                    <input name="totalAmount" placeholder="Total Amount" type="number" value={form.totalAmount} onChange={handleChange} required />
                    <input name="monthlyContribution" placeholder="Monthly Contribution" type="number" value={form.monthlyContribution} onChange={handleChange} required />
                    <input name="durationMonths" placeholder="Duration (months)" type="number" value={form.durationMonths} onChange={handleChange} required />
                    <input name="startDate" placeholder="Start Date" type="date" value={form.startDate} onChange={handleChange} required />
                    <button type="submit" className="btn btn-primary">Create Chit Group</button>
                </form>
            </div>

            <div className="card">
                <h3>All Chit Groups</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th><th>Total</th><th>Monthly</th><th>Duration</th><th>Start</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chits.map(c => (
                            <tr key={c._id}>
                                <td>{c.name}</td>
                                <td>{c.totalAmount}</td>
                                <td>{c.monthlyContribution}</td>
                                <td>{c.durationMonths}</td>
                                <td>{new Date(c.startDate).toLocaleDateString()}</td>
                                <td>{c.status}</td>
               
                                <td><Link to={`/chits/${c._id}`} className="btn btn-secondary">View</Link></td>
                            </tr>
                        ))}
                        {chits.length === 0 && (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No chit groups created yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Chits;           