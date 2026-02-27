import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAuctionById, placeBid, finalizeAuction } from '../api';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    loadAuction();
  }, [id]);

  const loadAuction = async () => {
    try {
      const { data } = await fetchAuctionById(id);
      setAuction(data.auction);
      setBids(data.bids);
    } catch (err) {
      setError('Failed to load auction');
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await placeBid(id, { memberId: user.member?._id, bidAmount });
      setSuccess('Bid placed');
      setBidAmount('');
      loadAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Bid failed');
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm('Finalize auction? This cannot be undone.')) return;
    setError('');
    setSuccess('');
    try {
      await finalizeAuction(id);
      setSuccess('Auction finalized');
      loadAuction();
    } catch (err) {
      setError(err.response?.data?.message || 'Finalization failed');
    }
  };

  if (!auction) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
      <h2>Auction Details</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h3>Group: {auction.chitGroup?.name}</h3>
        <p>Month: {auction.monthNumber}</p>
        <p>Date: {new Date(auction.auctionDate).toLocaleDateString()}</p>
        <p>Status: {auction.status}</p>
        {auction.winnerMember && <p>Winner: {auction.winnerMember.name}</p>}
        {auction.winningBidAmount && <p>Winning Bid: ₹{auction.winningBidAmount}</p>}
        {auction.dividendPerMember && <p>Dividend per Member: ₹{auction.dividendPerMember}</p>}
      </div>

      {/* Bidding form for members */}
      {!isAdmin && auction.status !== 'completed' && auction.status !== 'cancelled' && (
        <div className="card">
          <h3>Place a Bid</h3>
          <form onSubmit={handlePlaceBid}>
            <input type="number" placeholder="Your bid amount" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} required />
            <button type="submit" className="btn btn-primary">Place Bid</button>
          </form>
        </div>
      )}

      {/* Finalize button for admin */}
      {isAdmin && auction.status === 'in_progress' && (
        <div className="card">
          <button onClick={handleFinalize} className="btn btn-danger">Finalize Auction</button>
        </div>
      )}

      <div className="card">
        <h3>All Bids</h3>
        <table>
          <thead>
            <tr><th>Member</th><th>Bid Amount</th><th>Time</th><th>Winning</th></tr>
          </thead>
          <tbody>
            {bids.map(b => (
              <tr key={b._id}>
                <td>{b.member?.name}</td>
                <td>₹{b.bidAmount}</td>
                <td>{new Date(b.placedAt).toLocaleString()}</td>
                <td>{b.isWinning ? 'Yes' : ''}</td>
              </tr>
            ))}
            {bids.length === 0 && <tr><td colSpan="4">No bids yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuctionDetail;