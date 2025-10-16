import React, { useState, useEffect } from 'react';
import axios from 'axios';
const SeatRecords = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const statusMap = { 0: 'Upcoming', 1: 'Completed', 2: 'Canceled', 3: 'Expired' };

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) throw new Error('User information missing, please log in again');
        
        const currentUser = JSON.parse(currentUserStr);
        if (!currentUser.id) throw new Error('User information missing, please log in again');
        
        const userId = currentUser.id;
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: { 'user-id': userId }
        });
        setUserInfo(userResponse.data);
        
        const bookingsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings?userId=${userId}`);
        const sortedBookings = bookingsResponse.data.sort((a, b) => {
          const timeA = new Date(`${a.date} ${a.start_time}`).getTime();
          const timeB = new Date(`${b.date} ${b.start_time}`).getTime();
          return timeB - timeA;
        });
        setBookings(sortedBookings);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndBookings();
  }, []);

  const formatLocation = (room) => {
    if (room.startsWith('library-')) return `Library - Floor ${room.split('-')[1]}`;
    if (room === 'canteen') return 'Canteen';
    if (room.includes('-')) {
      const [buildingFloor, roomNum] = room.split('-');
      return `Teaching Building ${buildingFloor.charAt(0)} - Room ${buildingFloor.slice(1)}-${roomNum}`;
    }
    return room;
  };

  const cancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}/cancel`);
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: 2 } : booking
        ));
      } catch (err) {
        alert('Failed to cancel booking: ' + (err.response?.data?.message || 'Unknown error'));
      }
    }
  };

  return (
    <div className="records-container">
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          .records-container {
            width: 100%;
            min-height: 100vh;
            background-color: #f8fafc;
            padding: 1rem;
          }
          .records-header {
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.8rem;
          }
          .records-header h1 {
            color: #0f172a;
            font-size: 1.5rem;
            font-weight: 600;
          }
          .records-header p {
            color: #64748b;
            font-size: 0.9rem;
            margin-top: 0.3rem;
          }
          .loading-state, .error-state, .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 300px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            color: #64748b;
            font-size: 1rem;
            padding: 0 1rem;
            text-align: center;
          }
          .error-state {
            color: #ef4444;
          }
          .booking-cards {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .booking-card {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
          }
          .booking-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .booking-location {
            font-weight: 600;
            color: #0f172a;
          }
          .status-badge {
            display: inline-block;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          .status-upcoming {
            background-color: #dbeafe;
            color: #1e40af;
          }
          .status-completed {
            background-color: #dcfce7;
            color: #166534;
          }
          .status-canceled {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .status-expired {
            background-color: #fef3c7;
            color: #92400e;
          }
          .booking-details {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }
          .booking-detail-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
          }
          .detail-label {
            color: #64748b;
          }
          .detail-value {
            color: #334155;
            font-weight: 500;
          }
          .time-display {
            color: #1e40af;
          }
          .booking-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }
          .cancel-btn {
            padding: 0.4rem 0.8rem;
            background-color: #ef4444;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.9rem;
          }
          .cancel-btn:hover {
            background-color: #dc2626;
          }
          
          @media (min-width: 768px) {
            .table-wrapper {
              overflow-x: auto;
            }
            .records-table-container {
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
              overflow: hidden;
            }
            .records-table {
              width: 100%;
              min-width: 600px;
              border-collapse: collapse;
            }
            .records-table th {
              background-color: #1e40af;
              color: #ffffff;
              text-align: left;
              padding: 0.8rem 1rem;
              font-size: 0.85rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .records-table td {
              padding: 0.8rem 1rem;
              color: #334155;
              font-size: 0.85rem;
              border-bottom: 1px solid #f1f5f9;
            }
            .records-table tr:last-child td {
              border-bottom: none;
            }
            .records-table tr:hover td {
              background-color: #f8fafc;
            }
            .booking-cards {
              display: none;
            }
          }
          
          @media (max-width: 767px) {
            .records-table-container {
              display: none;
            }
          }
        `}
      </style>
      <div className="records-header">
        <h1>My Booking Records</h1>
        {userInfo && <p>Name: {userInfo.name} | JCU ID: {userInfo.jcu_id}</p>}
      </div>
      {loading ? (
        <div className="loading-state">Loading booking records...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">No booking records available</div>
      ) : (
        <>
          <div className="booking-cards">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <span className="booking-location">{formatLocation(booking.room)}</span>
                  <span 
                    className={`status-badge status-${
                      booking.status === 0 ? 'upcoming' : 
                      booking.status === 1 ? 'completed' : 
                      booking.status === 2 ? 'canceled' : 'expired'
                    }`}
                  >
                    {statusMap[booking.status] || 'Unknown Status'}
                  </span>
                </div>
                <div className="booking-details">
                  <div className="booking-detail-item">
                    <span className="detail-label">Seat Number:</span>
                    <span className="detail-value">{booking.seat_number}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Booking Date:</span>
                    <span className="detail-value">{new Date(booking.date).toISOString().split('T')[0]}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Time Slot:</span>
                    <span className="detail-value time-display">
                      {booking.start_time} - {booking.end_time}
                    </span>
                  </div>
                </div>
                <div className="booking-actions">
                  {booking.status === 0 && (
                    <button 
                      className="cancel-btn"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="records-table-container">
            <div className="table-wrapper">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Booking Location</th>
                    <th>Seat Number</th>
                    <th>Booking Date</th>
                    <th>Booking Time Slot</th>
                    <th>Booking Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{formatLocation(booking.room)}</td>
                      <td>{booking.seat_number}</td>
                      <td>{new Date(booking.date).toISOString().split('T')[0]}</td>
                      <td className="time-display">
                        {booking.start_time} - {booking.end_time}
                      </td>
                      <td>
                        <span 
                          className={`status-badge status-${
                            booking.status === 0 ? 'upcoming' : 
                            booking.status === 1 ? 'completed' : 
                            booking.status === 2 ? 'canceled' : 'expired'
                          }`}
                        >
                          {statusMap[booking.status] || 'Unknown Status'}
                        </span>
                      </td>
                      <td>
                        {booking.status === 0 && (
                          <button 
                            className="cancel-btn"
                            onClick={() => cancelBooking(booking.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default SeatRecords;