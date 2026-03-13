import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBooking } from '../api/bookingApi';
import PageHero from '../components/PageHero';

const initialForm = {
  pickupLocation: '',
  dropLocation: '',
  goodsType: '',
  vehicleType: '',
  distanceKm: ''
};

const BookingFormPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createBooking({
        ...form,
        distanceKm: Number(form.distanceKm)
      });

      setSuccess('Booking submitted successfully.');
      setForm(initialForm);

      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Booking Intake"
        title="Create a new booking"
        description="Submit route, goods, vehicle, and distance details. Once created, the request moves to the owner approval queue."
        actions={
          <Link to="/customer/dashboard" className="button secondary">
            Back to Dashboard
          </Link>
        }
        stats={[
          { label: 'Flow', value: 'Request -> Review', helper: 'Bookings enter the approval queue immediately' },
          { label: 'Output', value: 'Invoice Ready', helper: 'Approved trips become invoice candidates' }
        ]}
      />

      <div className="card form-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Route Details</span>
            <h2>Shipment request form</h2>
            <p className="muted">Add clear route and cargo details so the approval and assignment step stays fast.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid two-col">
          <label>
            Pickup Location
            <input
              type="text"
              name="pickupLocation"
              value={form.pickupLocation}
              onChange={handleChange}
              placeholder="Mumbai Warehouse"
              required
            />
          </label>

          <label>
            Drop Location
            <input
              type="text"
              name="dropLocation"
              value={form.dropLocation}
              onChange={handleChange}
              placeholder="Pune Market"
              required
            />
          </label>

          <label>
            Goods Type
            <input
              type="text"
              name="goodsType"
              value={form.goodsType}
              onChange={handleChange}
              placeholder="Electronics"
              required
            />
          </label>

          <label>
            Vehicle Type
            <input
              type="text"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              placeholder="Truck"
              required
            />
          </label>

          <label>
            Distance (km)
            <input
              type="number"
              name="distanceKm"
              value={form.distanceKm}
              onChange={handleChange}
              placeholder="150"
              min={1}
              step="0.1"
              required
            />
          </label>

          {error ? <p className="error-text full-width">{error}</p> : null}
          {success ? <p className="success-text full-width">{success}</p> : null}

          <div className="full-width">
            <div className="button-row">
              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Booking'}
              </button>
              <Link to="/customer/dashboard" className="button secondary">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BookingFormPage;
