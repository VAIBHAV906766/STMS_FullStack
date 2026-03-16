import { useEffect, useMemo, useState } from 'react';
import PageHero from '../components/PageHero';
import StatusBadge from '../components/StatusBadge';
import { getPendingBookings, getReversibleBookings, updateBookingStatus } from '../api/bookingApi';
import { getDrivers } from '../api/userApi';
import { formatRouteChain, getStopLocations } from '../utils/bookingRoute';

const PendingBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [reversibleBookings, setReversibleBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [lastAction, setLastAction] = useState(null);

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
      const [pendingData, reversibleData, driverData] = await Promise.all([
        getPendingBookings(),
        getReversibleBookings(),
        getDrivers()
      ]);
      setBookings(pendingData.bookings || []);
      setReversibleBookings(reversibleData.bookings || []);
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
      setLastAction({ bookingId, status });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const handleUndoLastDecision = async () => {
    if (!lastAction) return;

    try {
      setError('');
      await updateBookingStatus(lastAction.bookingId, { status: 'PENDING' });
      setInfoMessage('Last decision reverted. Booking moved back to pending.');
      setLastAction(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revert last decision.');
    }
  };

  const handleMoveBackToPending = async (bookingId) => {
    try {
      setError('');
      await updateBookingStatus(bookingId, { status: 'PENDING' });
      setInfoMessage('Booking moved back to pending.');
      setLastAction(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to move booking back to pending.');
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
          { label: 'Reversible', value: reversibleBookings.length, helper: 'Approved/rejected without invoice' },
          { label: 'Drivers', value: drivers.length, helper: 'Available accounts for assignment' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}
      {infoMessage ? <p className="success-text">{infoMessage}</p> : null}
      {lastAction ? (
        <div className="action-row">
          <button type="button" className="button secondary" onClick={handleUndoLastDecision}>
            Undo Last {lastAction.status.toLowerCase()} Decision
          </button>
        </div>
      ) : null}

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
                  <h3>{formatRouteChain(booking.pickupLocation, booking.deliveryStops, booking.dropLocation)}</h3>
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
                  {getStopLocations(booking.deliveryStops).length > 0 ? (
                    <span className="detail-chip">
                      Stops: {getStopLocations(booking.deliveryStops).join(', ')}
                    </span>
                  ) : null}
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

      <div className="card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Decision Recovery</span>
            <h2>Reverse previous decisions</h2>
            <p className="muted">Move non-invoiced approved or rejected bookings back to pending if a wrong action was taken.</p>
          </div>
        </div>

        {reversibleBookings.length === 0 ? (
          <p className="muted">No reversible bookings found.</p>
        ) : (
          <div className="list-grid">
            {reversibleBookings.map((booking) => (
              <article key={booking.id} className="list-item stacked">
                <div className="list-item-head">
                  <h3>{formatRouteChain(booking.pickupLocation, booking.deliveryStops, booking.dropLocation)}</h3>
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
                  {getStopLocations(booking.deliveryStops).length > 0 ? (
                    <span className="detail-chip">
                      Stops: {getStopLocations(booking.deliveryStops).join(', ')}
                    </span>
                  ) : null}
                </div>

                <div className="button-row">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => handleMoveBackToPending(booking.id)}
                  >
                    Move Back to Pending
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PendingBookingsPage;
