import { useEffect, useMemo, useState } from 'react';
import PageHero from '../components/PageHero';
import StatusBadge from '../components/StatusBadge';
import { getPendingBookings, updateBookingStatus } from '../api/bookingApi';
import { getDrivers } from '../api/userApi';

const PendingBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const driverLookup = useMemo(() => {
    const map = {};
    drivers.forEach((driver) => {
      map[driver.id] = driver;
    });
    return map;
  }, [drivers]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingData, driverData] = await Promise.all([getPendingBookings(), getDrivers()]);
      setBookings(pendingData.bookings || []);
      setDrivers(driverData.drivers || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load pending bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDriverChange = (bookingId, value) => {
    setSelectedDriver((prev) => ({ ...prev, [bookingId]: value }));
  };

  const handleStatus = async (bookingId, status) => {
    try {
      const payload = { status };
      const driverId = selectedDriver[bookingId];

      if (status === 'APPROVED' && driverId) {
        payload.driverId = Number(driverId);
      }

      await updateBookingStatus(bookingId, payload);
      setInfoMessage(`Booking ${status.toLowerCase()} successfully.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  if (loading) {
    return (
      <div className="card state-card">
        <p>Loading pending bookings...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Approval Queue"
        title="Pending booking review"
        description="Approve or reject incoming booking requests, assign drivers manually when needed, or let the system auto-assign for speed."
        stats={[
          { label: 'Pending', value: bookings.length, helper: 'Bookings waiting for a decision' },
          { label: 'Drivers', value: drivers.length, helper: 'Available accounts for assignment' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}
      {infoMessage ? <p className="success-text">{infoMessage}</p> : null}

      <div className="card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Review List</span>
            <h2>Booking approval queue</h2>
            <p className="muted">Each card keeps route, customer, cargo, and driver assignment controls in one place.</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <p className="muted">No pending bookings available.</p>
        ) : (
          <div className="list-grid">
            {bookings.map((booking) => (
              <article key={booking.id} className="list-item stacked">
                <div className="list-item-head">
                  <h3>
                    {booking.pickupLocation} to {booking.dropLocation}
                  </h3>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="detail-row">
                  <span className="detail-chip">
                    Customer: {booking.customer?.name || 'Unknown'}
                  </span>
                  <span className="detail-chip">{booking.customer?.email || 'NA'}</span>
                  <span className="detail-chip">{booking.goodsType}</span>
                  <span className="detail-chip">{booking.vehicleType}</span>
                  <span className="detail-chip">{booking.distanceKm} km</span>
                </div>

                <div className="booking-actions">
                  <label>
                    Assign Driver
                    <select
                      value={selectedDriver[booking.id] || ''}
                      onChange={(event) => handleDriverChange(booking.id, event.target.value)}
                    >
                      <option value="">Auto Assign</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} ({driver.email})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="button-row">
                    <button
                      type="button"
                      className="button"
                      onClick={() => handleStatus(booking.id, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="button danger"
                      onClick={() => handleStatus(booking.id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {booking.driverId ? (
                  <p className="muted small">
                    Assigned: {driverLookup[booking.driverId]?.name || 'Driver'}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PendingBookingsPage;
