import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    toast.error(message);
    return Promise.reject(error);
  }
);

// Auth
export const login = (formData) => API.post('/auth/login', formData);
export const registerMember = (formData) => API.post('/auth/register/member', formData);

// Members (admin)
export const fetchMembers = () => API.get('/members');
export const createMember = (newMember) => API.post('/members', newMember);
export const updateMember = (id, updatedMember) => API.put(`/members/${id}`, updatedMember);
export const deleteMember = (id) => API.delete(`/members/${id}`);

// Member‑specific
export const fetchMyChitGroups = () => API.get('/members/my/groups');
export const fetchMyAuctions = () => API.get('/members/my/auctions');
export const fetchMyLedger = () => API.get('/members/my/ledger');

// Chit Groups
export const fetchChitGroups = () => API.get('/chits');
export const createChitGroup = (newGroup) => API.post('/chits', newGroup);
export const fetchChitGroupDetails = (id) => API.get(`/chits/${id}`);
export const addMemberToChit = (chitId, memberId) => API.post(`/chits/${chitId}/members`, { memberId });

// Subscriptions
export const generateSubscriptions = (chitGroupId) => API.post('/subscriptions', { chitGroupId });
export const fetchSubscriptions = (params) => API.get('/subscriptions', { params });
export const paySubscription = (data) => API.post('/subscriptions/pay', data);

// Auctions
export const createAuction = (data) => API.post('/auctions', data);
export const fetchAuctions = (chitGroupId) => API.get('/auctions', { params: { chitGroupId } });
export const fetchAuctionById = (id) => API.get(`/auctions/${id}`);
export const placeBid = (auctionId, bidData) => API.post(`/auctions/${auctionId}/bids`, bidData);
export const finalizeAuction = (auctionId) => API.post(`/auctions/${auctionId}/finalize`);

// Payments (collections)
export const recordPayment = (paymentData) => API.post('/chits/payments', paymentData);
export const fetchPaymentsByChit = (chitId) => API.get(`/chits/${chitId}/payments`);