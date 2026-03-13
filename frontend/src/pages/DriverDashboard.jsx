import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { getAssignedTrips } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';

const DriverDashboard = () => {
  const { user } = useAuth();
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
    return (
      <div className="card state-card">
        <p>Loading assigned trips...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Driver Route Board"
        title={`Assigned trips${user?.name ? ` for ${user.name}` : ''}`}
        description="See approved deliveries, pickup-drop routes, and customer context without hunting through multiple screens."
        stats={[
          { label: 'Active Assignments', value: trips.length, helper: 'Trips currently linked to your account' },
          { label: 'Status', value: 'Live', helper: 'Dispatch feed updates from backend data' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-grid">
        <DashboardCard title="Assigned Trips" value={trips.length} subtitle="Approved trips routed to you" tone="teal" />
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Dispatch Feed</span>
            <h2>Trip list</h2>
            <p className="muted">Every assigned route, customer, and shipment type in one readable list.</p>
          </div>
        </div>

        {trips.length === 0 ? (
          <p className="muted">No trips assigned yet.</p>
        ) : (
          <div className="list-grid">
            {trips.map((trip) => (
              <article className="list-item" key={trip.id}>
                <div className="list-copy">
                  <h3>
                    {trip.pickupLocation} to {trip.dropLocation}
                  </h3>
                  <div className="detail-row">
                    <span className="detail-chip">
                      Customer: {trip.customer?.name || 'Unknown'}
                    </span>
                    <span className="detail-chip">{trip.goodsType}</span>
                    <span className="detail-chip">{trip.vehicleType}</span>
                  </div>
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
