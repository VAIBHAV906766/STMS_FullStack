import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { getPendingBookings, getApprovedUninvoicedBookings } from '../api/bookingApi';
import { getOwnerInvoices } from '../api/invoiceApi';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [approvedUninvoiced, setApprovedUninvoiced] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        const [pendingData, approvedData, invoiceData] = await Promise.all([
          getPendingBookings(),
          getApprovedUninvoicedBookings(),
          getOwnerInvoices()
        ]);

        setPendingBookings(pendingData.bookings || []);
        setApprovedUninvoiced(approvedData.bookings || []);
        setInvoices(invoiceData.invoices || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load owner dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  const paidCount = invoices.filter((invoice) => invoice.status === 'PAID').length;
  const pendingPayments = invoices.filter((invoice) => invoice.status === 'PENDING').length;

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
        eyebrow="Operations Control"
        title={`Owner dashboard${user?.name ? ` for ${user.name}` : ''}`}
        description="Monitor the approval queue, manage driver assignment, and keep invoice throughput moving without leaving the workspace."
        actions={
          <>
            <Link to="/owner/pending-bookings" className="button">
              Review Queue
            </Link>
            <Link to="/owner/invoices" className="button secondary">
              Open Invoices
            </Link>
          </>
        }
        stats={[
          { label: 'Pending Queue', value: pendingBookings.length, helper: 'Requests waiting for review' },
          { label: 'Ready to Invoice', value: approvedUninvoiced.length, helper: 'Approved bookings with no invoice yet' },
          { label: 'Paid', value: paidCount, helper: 'Invoices already settled' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-grid">
        <DashboardCard title="Pending Bookings" value={pendingBookings.length} subtitle="Awaiting owner decision" tone="amber" />
        <DashboardCard title="Bookings to Invoice" value={approvedUninvoiced.length} subtitle="Approved but not billed" tone="sky" />
        <DashboardCard title="Pending Payments" value={pendingPayments} subtitle="Invoices still open" tone="rose" />
        <DashboardCard title="Paid Invoices" value={paidCount} subtitle="Closed payment cycle" tone="teal" />
      </div>

      <div className="action-row">
        <Link to="/owner/pending-bookings" className="button">
          Manage Pending Bookings
        </Link>
        <Link to="/owner/invoices" className="button secondary">
          Manage Invoices
        </Link>
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Queue Snapshot</span>
            <h2>Latest pending requests</h2>
            <p className="muted">High-priority approvals surfaced for quick operational review.</p>
          </div>
        </div>
        {pendingBookings.length === 0 ? (
          <p className="muted">No pending bookings.</p>
        ) : (
          <div className="list-grid">
            {pendingBookings.slice(0, 5).map((booking) => (
              <article key={booking.id} className="list-item">
                <div className="list-copy">
                  <h3>
                    {booking.pickupLocation} to {booking.dropLocation}
                  </h3>
                  <div className="detail-row">
                    <span className="detail-chip">
                      Customer: {booking.customer?.name || 'Unknown'}
                    </span>
                    <span className="detail-chip">{booking.distanceKm} km</span>
                  </div>
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

export default OwnerDashboard;
