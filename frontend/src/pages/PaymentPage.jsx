import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getMyInvoices } from '../api/invoiceApi';
import { payInvoice } from '../api/paymentApi';
import PageHero from '../components/PageHero';

const PAYMENT_MODES = ['UPI', 'CARD', 'NET_BANKING', 'CASH'];
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount || 0));

const PaymentPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const data = await getMyInvoices();
        const found = (data.invoices || []).find((item) => item.id === Number(invoiceId));

        if (!found) {
          setError('Invoice not found.');
          return;
        }

        setInvoice(found);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load invoice details.');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      await payInvoice({
        invoiceId: Number(invoiceId),
        paymentMode
      });
      navigate('/customer/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card state-card">
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!invoice) {
    return <Navigate to="/customer/invoices" replace />;
  }

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Payment Gateway"
        title={`Pay invoice #${invoice.id}`}
        description="Review the amount due, select a payment mode, and complete the simulated payment flow."
        actions={
          <Link to="/customer/invoices" className="button secondary">
            Back to Invoices
          </Link>
        }
        stats={[
          { label: 'Amount Due', value: formatCurrency(invoice.totalAmount), helper: 'Current invoice total' },
          { label: 'Status', value: invoice.status, helper: 'Payment state of this invoice' }
        ]}
      />

      <div className="card form-card narrow">
        <div className="section-header">
          <div>
            <span className="eyebrow">Billing Summary</span>
            <h2>Invoice payment details</h2>
            <p className="muted">Choose a payment mode to simulate invoice settlement.</p>
          </div>
        </div>

        <div className="summary-grid">
          <article className="summary-tile">
            <span>Total Amount</span>
            <strong>{formatCurrency(invoice.totalAmount)}</strong>
          </article>
          <article className="summary-tile">
            <span>Status</span>
            <strong>{invoice.status}</strong>
          </article>
        </div>

        {invoice.status === 'PAID' ? (
          <p className="success-text">This invoice is already paid.</p>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Payment Mode
              <select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>

            {error ? <p className="error-text">{error}</p> : null}

            <button className="button" type="submit" disabled={submitting}>
              {submitting ? 'Processing...' : 'Pay Invoice'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default PaymentPage;
