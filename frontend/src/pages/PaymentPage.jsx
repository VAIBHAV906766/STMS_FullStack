import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getMyInvoices } from '../api/invoiceApi';
import { payInvoice } from '../api/paymentApi';

const PAYMENT_MODES = ['UPI', 'CARD', 'NET_BANKING', 'CASH'];

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
    return <p>Loading payment details...</p>;
  }

  if (!invoice) {
    return <Navigate to="/customer/invoices" replace />;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Pay Invoice #{invoice.id}</h1>
      </div>

      <div className="card form-card narrow">
        <p>
          Total Amount: <strong>Rs. {Number(invoice.totalAmount).toFixed(2)}</strong>
        </p>
        <p className="muted">Status: {invoice.status}</p>

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
