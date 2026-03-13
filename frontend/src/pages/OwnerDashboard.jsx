import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { getPendingBookings, getApprovedUninvoicedBookings } from '../api/bookingApi';
import { getOwnerInvoices } from '../api/invoiceApi';

const OwnerDashboard = () => {
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
    return <p>Loading dashboard...</p>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Owner Dashboard</h1>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-grid">
        <DashboardCard title="Pending Bookings" value={pendingBookings.length} />
        <DashboardCard title="Bookings to Invoice" value={approvedUninvoiced.length} />
        <DashboardCard title="Pending Payments" value={pendingPayments} />
        <DashboardCard title="Paid Invoices" value={paidCount} />
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
        <h2>Latest Pending Requests</h2>
        {pendingBookings.length === 0 ? (
          <p className="muted">No pending bookings.</p>
        ) : (
          <div className="list-grid">
            {pendingBookings.slice(0, 5).map((booking) => (
              <article key={booking.id} className="list-item">
                <div>
                  <h3>
                    {booking.pickupLocation} to {booking.dropLocation}
                  </h3>
                  <p className="muted">
                    Customer: {booking.customer?.name || 'Unknown'} | {booking.distanceKm} km
                  </p>
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
