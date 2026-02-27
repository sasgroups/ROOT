// pages/MemberChitGroups.jsx
import React, { useState, useEffect } from 'react';
import { fetchMyChitGroups, fetchSubscriptions } from '../api';
import Spinner from '../components/Spinner';

const MemberChitGroups = () => {
  const [groups, setGroups] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groupsRes = await fetchMyChitGroups();
      setGroups(groupsRes.data);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.member?._id) {
        const subsRes = await fetchSubscriptions({ memberId: user.member._id });
        setSubscriptions(subsRes.data);
      }
    } catch (error) {
      // toasted
    } finally {
      setLoading(false);
    }
  };

  // Group subscriptions by chit group ID
  const subsByGroup = {};
  subscriptions.forEach(sub => {
    const groupId = sub.chitGroup?._id;
    if (!subsByGroup[groupId]) subsByGroup[groupId] = [];
    subsByGroup[groupId].push(sub);
  });

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Chit Groups</h1>
      {groups.length === 0 ? (
        <p className="text-gray-600">You are not enrolled in any chit group.</p>
      ) : (
        groups.map(group => {
          const groupSubs = subsByGroup[group._id] || [];
          const paidCount = groupSubs.filter(s => s.status === 'paid').length;
          return (
            <div key={group._id} className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-2">{group.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Monthly Contribution</span>
                  <p className="text-lg font-bold">₹{group.monthlyContribution}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Duration</span>
                  <p className="text-lg font-bold">{group.durationMonths} months</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-500">Payment Progress</span>
                  <p className="text-lg font-bold">{paidCount} / {group.durationMonths} paid</p>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Payment Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupSubs.map(sub => (
                      <tr key={sub._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{sub.monthNumber}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(sub.dueDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap">₹{sub.amount}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sub.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {sub.paidDate ? new Date(sub.paidDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                    {groupSubs.length === 0 && (
                      <tr><td colSpan="5" className="px-4 py-2 text-center text-gray-500">No subscriptions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MemberChitGroups;