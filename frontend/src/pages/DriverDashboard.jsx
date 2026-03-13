import { useEffect, useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { getAssignedTrips } from '../api/bookingApi';

const DriverDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const data = await getAssignedTrips();
        setTrips(data.trips || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load trips.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return <p>Loading assigned trips...</p>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Driver Dashboard</h1>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-grid">
        <DashboardCard title="Assigned Trips" value={trips.length} />
      </div>

      <div className="card">
        <h2>Trip List</h2>

        {trips.length === 0 ? (
          <p className="muted">No trips assigned yet.</p>
        ) : (
          <div className="list-grid">
            {trips.map((trip) => (
              <article className="list-item" key={trip.id}>
                <div>
                  <h3>
                    {trip.pickupLocation} to {trip.dropLocation}
                  </h3>
                  <p className="muted">
                    Customer: {trip.customer?.name || 'Unknown'} | {trip.goodsType} | {trip.vehicleType}
                  </p>
                </div>
                <StatusBadge status={trip.status} />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DriverDashboard;
