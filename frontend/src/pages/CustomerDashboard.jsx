import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { getMyBookings } from '../api/bookingApi';
import { getMyInvoices } from '../api/invoiceApi';
import { useAuth } from '../context/AuthContext';
import { formatRouteChain, getStopLocations } from '../utils/bookingRoute';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [bookingsData, invoicesData] = await Promise.all([getMyBookings(), getMyInvoices()]);
        setBookings(bookingsData.bookings || []);
        setInvoices(invoicesData.invoices || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter((booking) => booking.status === 'APPROVED').length;
  const unpaidInvoices = invoices.filter((invoice) => invoice.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="card state-card">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Customer Command Deck"
        title={`Welcome${user?.name ? `, ${user.name}` : ''}`}
        description="Create new booking requests, watch approval status change in real time, and keep invoice activity visible from one panel."
        actions={
          <>
            <Link to="/customer/bookings/new" className="button">
              New Booking
            </Link>
            <Link to="/customer/invoices" className="button secondary">
              View Invoices
            </Link>
            <Link to="/customer/support" className="button secondary">
              Support Queries
            </Link>
          </>
        }
        stats={[
          { label: 'Open Requests', value: totalBookings, helper: 'All bookings created so far' },
          { label: 'Approved', value: approvedBookings, helper: 'Ready for invoicing or dispatch' },
          { label: 'Unpaid', value: unpaidInvoices, helper: 'Invoices still pending payment' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-grid">
        <DashboardCard title="Total Bookings" value={totalBookings} subtitle="Shipment requests logged" tone="sky" />
        <DashboardCard title="Approved Bookings" value={approvedBookings} subtitle="Cleared by operations" tone="teal" />
        <DashboardCard title="Pending Invoices" value={unpaidInvoices} subtitle="Awaiting payment" tone="amber" />
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Activity Feed</span>
            <h2>Recent bookings</h2>
            <p className="muted">Your latest booking requests and their current approval state.</p>
          </div>
        </div>
        {bookings.length === 0 ? (
          <p className="muted">No bookings yet.</p>
        ) : (
          <div className="list-grid">
            {bookings.slice(0, 5).map((booking) => (
              <article key={booking.id} className="list-item">
                <div className="list-copy">
                  <h3>{formatRouteChain(booking.pickupLocation, booking.deliveryStops, booking.dropLocation)}</h3>
                  <div className="detail-row">
                    <span className="detail-chip">{booking.goodsType}</span>
                    <span className="detail-chip">{booking.vehicleType}</span>
                    <span className="detail-chip">{booking.distanceKm} km</span>
                    {getStopLocations(booking.deliveryStops).length > 0 ? (
                      <span className="detail-chip">
                        Stops: {getStopLocations(booking.deliveryStops).join(', ')}
                      </span>
                    ) : null}
                  </div>
                  {booking.approvedByOwner ? (
                    <div className="detail-row">
                      <span className="detail-chip">
                        Approved by: {booking.approvedByOwner.companyName || booking.approvedByOwner.name}
                      </span>
                      {booking.approvedByOwner.ownerVerified ? (
                        <span className="verified-badge">✔ Verified Transport Owner</span>
                      ) : (
                        <span className="status-badge not_requested">Owner not verified</span>
                      )}
                    </div>
                  ) : null}
                </div>
                <StatusBadge status={booking.status} />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerDashboard;
