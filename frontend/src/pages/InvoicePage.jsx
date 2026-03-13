import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getApprovedUninvoicedBookings } from '../api/bookingApi';
import { generateInvoice, getMyInvoices, getOwnerInvoices } from '../api/invoiceApi';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

const InvoicePage = () => {
  const { user } = useAuth();
  const isCustomer = user.role === 'CUSTOMER';

  const [invoices, setInvoices] = useState([]);
  const [bookingsToInvoice, setBookingsToInvoice] = useState([]);
  const [rateByBooking, setRateByBooking] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');

      if (isCustomer) {
        const data = await getMyInvoices();
        setInvoices(data.invoices || []);
        setBookingsToInvoice([]);
      } else {
        const [invoiceData, bookingData] = await Promise.all([
          getOwnerInvoices(),
          getApprovedUninvoicedBookings()
        ]);

        setInvoices(invoiceData.invoices || []);
        setBookingsToInvoice(bookingData.bookings || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [isCustomer]);

  const handleRateChange = (bookingId, value) => {
    setRateByBooking((prev) => ({ ...prev, [bookingId]: value }));
  };

  const handleGenerate = async (bookingId) => {
    try {
      setError('');
      setSuccess('');

      const rateInput = rateByBooking[bookingId];
      const parsedRate = rateInput ? Number(rateInput) : 20;

      await generateInvoice({
        bookingId,
        ratePerKm: parsedRate
      });

      setSuccess('Invoice generated successfully.');
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invoice.');
    }
  };

  if (loading) {
    return <p>Loading invoices...</p>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>{isCustomer ? 'My Invoices' : 'Invoice Management'}</h1>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      {!isCustomer && (
        <div className="card">
          <h2>Generate Invoice (Approved Bookings)</h2>
          {bookingsToInvoice.length === 0 ? (
            <p className="muted">No approved bookings waiting for invoice.</p>
          ) : (
            <div className="list-grid">
              {bookingsToInvoice.map((booking) => (
                <article key={booking.id} className="list-item stacked">
                  <div className="list-item-head">
                    <h3>
                      Booking #{booking.id}: {booking.pickupLocation} to {booking.dropLocation}
                    </h3>
                    <span className="muted">{booking.distanceKm} km</span>
                  </div>
                  <p className="muted">Customer: {booking.customer?.name || 'Unknown'}</p>

                  <div className="inline-form">
                    <label>
                      Rate per km
                      <input
                        type="number"
                        min={1}
                        step="0.1"
                        value={rateByBooking[booking.id] || 20}
                        onChange={(event) => handleRateChange(booking.id, event.target.value)}
                      />
                    </label>

                    <button type="button" className="button" onClick={() => handleGenerate(booking.id)}>
                      Generate
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>{isCustomer ? 'Invoice History' : 'All Invoices'}</h2>

        {invoices.length === 0 ? (
          <p className="muted">No invoices found.</p>
        ) : (
          <div className="list-grid">
            {invoices.map((invoice) => (
              <article key={invoice.id} className="list-item stacked">
                <div className="list-item-head">
                  <h3>
                    Invoice #{invoice.id} | Booking #{invoice.bookingId}
                  </h3>
                  <StatusBadge status={invoice.status} />
                </div>

                <p className="muted">
                  Distance: {invoice.distanceKm} km | Rate: {formatCurrency(invoice.ratePerKm)} / km
                </p>
                <p className="muted">Total: {formatCurrency(invoice.totalAmount)}</p>

                {!isCustomer ? (
                  <p className="muted">
                    Customer: {invoice.customer?.name || invoice.booking?.customer?.name || 'Unknown'}
                  </p>
                ) : null}

                {isCustomer && invoice.status === 'PENDING' ? (
                  <Link to={`/customer/payment/${invoice.id}`} className="button">
                    Pay Now
                  </Link>
                ) : null}

                {!isCustomer && invoice.payments?.length > 0 ? (
                  <p className="success-text small">
                    Paid via {invoice.payments[0].paymentMode} on{' '}
                    {new Date(invoice.payments[0].paidAt).toLocaleString()}
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

export default InvoicePage;
