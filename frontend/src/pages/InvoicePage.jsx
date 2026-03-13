import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getApprovedUninvoicedBookings } from '../api/bookingApi';
import { generateInvoice, getMyInvoices, getOwnerInvoices } from '../api/invoiceApi';
import { formatRouteChain, getStopLocations } from '../utils/bookingRoute';

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
  const paidCount = invoices.filter((invoice) => invoice.status === 'PAID').length;
  const pendingCount = invoices.filter((invoice) => invoice.status === 'PENDING').length;

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
    return (
      <div className="card state-card">
        <p>Loading invoices...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <PageHero
        eyebrow={isCustomer ? 'Customer Billing' : 'Invoice Control'}
        title={isCustomer ? 'My invoices' : 'Invoice management'}
        description={
          isCustomer
            ? 'Track pending bills, review totals, and move straight into payment when an invoice is ready.'
            : 'Generate invoices for approved bookings and monitor the payment state across every issued record.'
        }
        actions={
          isCustomer ? (
            <Link to="/customer/dashboard" className="button secondary">
              Back to Dashboard
            </Link>
          ) : (
            <Link to="/owner/pending-bookings" className="button secondary">
              Review Pending Bookings
            </Link>
          )
        }
        stats={[
          { label: 'Invoices', value: invoices.length, helper: 'Total invoice records available' },
          { label: 'Pending', value: pendingCount, helper: 'Invoices awaiting payment' },
          { label: 'Paid', value: paidCount, helper: 'Invoices already settled' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      {!isCustomer && (
        <div className="card">
          <div className="section-header">
            <div>
              <span className="eyebrow">Invoice Generator</span>
              <h2>Generate invoice from approved booking</h2>
              <p className="muted">Set the rate per kilometer and create a billing record for any approved request.</p>
            </div>
          </div>
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
                    <span className="detail-chip">{booking.distanceKm} km</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-chip">
                      Customer: {booking.customer?.name || 'Unknown'}
                    </span>
                  </div>

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
        <div className="section-header">
          <div>
            <span className="eyebrow">{isCustomer ? 'History' : 'Finance Ledger'}</span>
            <h2>{isCustomer ? 'Invoice history' : 'All invoices'}</h2>
            <p className="muted">
              {isCustomer
                ? 'Review billed distance, rate, total amount, and payment state.'
                : 'Monitor invoice totals and see which records have already been paid.'}
            </p>
          </div>
        </div>

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

                <div className="detail-row">
                  <span className="detail-chip">{invoice.distanceKm} km</span>
                  <span className="detail-chip">{formatCurrency(invoice.ratePerKm)} / km</span>
                  <span className="detail-chip">{formatCurrency(invoice.totalAmount)}</span>
                </div>

                {invoice.booking ? (
                  <div className="detail-row">
                    <span className="detail-chip">
                      Route:{' '}
                      {formatRouteChain(
                        invoice.booking.pickupLocation,
                        invoice.booking.deliveryStops,
                        invoice.booking.dropLocation
                      )}
                    </span>
                    {getStopLocations(invoice.booking.deliveryStops).length > 0 ? (
                      <span className="detail-chip">
                        Stops: {getStopLocations(invoice.booking.deliveryStops).join(', ')}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {!isCustomer ? (
                  <div className="detail-row">
                    <span className="detail-chip">
                      Customer: {invoice.customer?.name || invoice.booking?.customer?.name || 'Unknown'}
                    </span>
                  </div>
                ) : invoice.booking?.approvedByOwner ? (
                  <div className="detail-row">
                    <span className="detail-chip">
                      Owner:{' '}
                      {invoice.booking.approvedByOwner.companyName ||
                        invoice.booking.approvedByOwner.name}
                    </span>
                    {invoice.booking.approvedByOwner.ownerVerified ? (
                      <span className="verified-badge">✔ Verified Transport Owner</span>
                    ) : (
                      <span className="status-badge not_requested">Owner not verified</span>
                    )}
                  </div>
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
