import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);

export const fetchMembers = () => API.get('/members');
export const createMember = (newMember) => API.post('/members', newMember);
export const updateMember = (id, updatedMember) => API.put(`/members/${id}`, updatedMember);
export const deleteMember = (id) => API.delete(`/members/${id}`);

export const fetchChitGroups = () => API.get('/chits');
export const createChitGroup = (newGroup) => API.post('/chits', newGroup);
export const fetchChitGroupDetails = (id) => API.get(`/chits/${id}`);
export const addMemberToChit = (chitId, memberId) => API.post(`/chits/${chitId}/members`, { memberId });
export const recordPayment = (paymentData) => API.post('/chits/payments', paymentData);
export const fetchPaymentsByChit = (chitId) => API.get(`/chits/${chitId}/payments`);