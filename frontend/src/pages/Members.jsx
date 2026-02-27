import React, { useState, useEffect } from 'react';
import { fetchMembers, createMember, updateMember, deleteMember } from '../api';
import Spinner from '../components/Spinner';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data } = await fetchMembers();
      setMembers(data);
    } catch (error) {
      // toast already shown
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...form };
      if (editingId && !changePassword) {
        delete dataToSend.password; // don't send password if not changing
      }

      if (editingId) {
        await updateMember(editingId, dataToSend);
        toast.success('Member updated');
        setEditingId(null);
      } else {
        await createMember(dataToSend);
        toast.success('Member created');
      }
      setForm({ name: '', phone: '', email: '', address: '', password: '' });
      setChangePassword(false);
      loadMembers();
    } catch (error) {}
  };

  const handleEdit = (member) => {
    setForm({ ...member, password: '' }); // clear password field
    setEditingId(member._id);
    setChangePassword(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await deleteMember(id);
      toast.success('Member deleted');
      loadMembers();
    } catch (error) {}
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Members</h1>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Member' : 'Add New Member'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name *"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone *"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {!editingId && (
              <input
                type="password"
                name="password"
                placeholder="Password *"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
          </div>

          {editingId && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Change password</span>
              </label>
              {changePassword && (
                <input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full max-w-xs border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition">
              {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', phone: '', email: '', address: '', password: '' });
                  setChangePassword(false);
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Members Table (unchanged) */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map(m => (
              <tr key={m._id}>
                <td className="px-6 py-4 whitespace-nowrap">{m.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{m.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{m.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{m.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => handleEdit(m)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(m._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Members;