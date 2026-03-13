import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../api/bookingApi';

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
    <section>
      <div className="page-header">
        <h1>Create Booking</h1>
      </div>

      <div className="card form-card">
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
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BookingFormPage;
