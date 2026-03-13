import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { getMyBookings } from '../api/bookingApi';
import { getMyInvoices } from '../api/invoiceApi';

const CustomerDashboard = () => {
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
    return <p>Loading dashboard...</p>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Customer Dashboard</h1>
        <Link to="/customer/bookings/new" className="button">
          New Booking
        </Link>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="dashboard-grid">
        <DashboardCard title="Total Bookings" value={totalBookings} />
        <DashboardCard title="Approved Bookings" value={approvedBookings} />
        <DashboardCard title="Pending Invoices" value={unpaidInvoices} />
      </div>

      <div className="card">
        <h2>Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="muted">No bookings yet.</p>
        ) : (
          <div className="list-grid">
            {bookings.slice(0, 5).map((booking) => (
              <article key={booking.id} className="list-item">
                <div>
                  <h3>
                    {booking.pickupLocation} to {booking.dropLocation}
                  </h3>
                  <p className="muted">
                    {booking.goodsType} | {booking.vehicleType} | {booking.distanceKm} km
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

export default CustomerDashboard;
