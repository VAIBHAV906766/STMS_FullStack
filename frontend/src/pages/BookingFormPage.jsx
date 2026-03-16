import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBooking } from '../api/bookingApi';
import PageHero from '../components/PageHero';
import { getOwners } from '../api/userApi';

const initialForm = {
  ownerId: '',
  pickupLocation: '',
  dropLocation: '',
  goodsType: '',
  vehicleType: '',
  distanceKm: ''
};

const initialStop = { location: '', notes: '' };

const BookingFormPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [stops, setStops] = useState([]);
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    const fetchOwners = async () => {
      try {
        const data = await getOwners();
        const availableOwners = data.owners || [];

        if (!active) return;

        setOwners(availableOwners);
        setForm((prev) => ({
          ...prev,
          ownerId: prev.ownerId || (availableOwners[0] ? String(availableOwners[0].id) : '')
        }));
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Unable to load owners for booking.');
      } finally {
        if (active) {
          setOwnersLoading(false);
        }
      }
    };

    fetchOwners();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStop = () => {
    setStops((prev) => [...prev, { ...initialStop }]);
  };

  const handleRemoveStop = (index) => {
    setStops((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleStopChange = (index, key, value) => {
    setStops((prev) =>
      prev.map((stop, idx) => (idx === index ? { ...stop, [key]: value } : stop))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!form.ownerId) {
        setError('Please select an owner for this booking.');
        setLoading(false);
        return;
      }

      const normalizedStops = stops
        .map((stop) => ({
          location: String(stop.location || '').trim(),
          notes: String(stop.notes || '').trim()
        }))
        .filter((stop) => stop.location);

      if (stops.some((stop) => String(stop.location || '').trim() === '')) {
        setError('Each added stop must include a location.');
        setLoading(false);
        return;
      }

      await createBooking({
        ...form,
        ownerId: Number(form.ownerId),
        distanceKm: Number(form.distanceKm),
        deliveryStops: normalizedStops
      });

      setSuccess('Booking submitted successfully.');
      setForm({
        ...initialForm,
        ownerId: owners[0] ? String(owners[0].id) : ''
      });
      setStops([]);

      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 800);
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach API server. Ensure backend is running on http://localhost:5000.');
      } else {
        setError(err.response?.data?.message || 'Failed to create booking.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Booking Intake"
        title="Create a new booking"
        description="Select the service owner, then submit route, goods, vehicle, and distance details. The request is sent only to that owner."
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
            Service Owner
            <select
              name="ownerId"
              value={form.ownerId}
              onChange={handleChange}
              disabled={ownersLoading || owners.length === 0}
              required
            >
              {ownersLoading ? <option value="">Loading owners...</option> : null}
              {!ownersLoading && owners.length === 0 ? <option value="">No owners available</option> : null}
              {!ownersLoading
                ? owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.companyName || owner.name}
                      {owner.ownerVerified ? ' [Verified]' : ''}
                    </option>
                  ))
                : null}
            </select>
          </label>

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

          <div className="full-width card nested-card">
            <div className="section-header">
              <div>
                <span className="eyebrow">Multi-stop Delivery</span>
                <h3>Intermediate stops</h3>
                <p className="muted">
                  Add optional delivery stops between pickup and final destination.
                </p>
              </div>
              <button type="button" className="button secondary" onClick={handleAddStop}>
                Add Stop
              </button>
            </div>

            {stops.length === 0 ? (
              <p className="muted">No intermediate stops added.</p>
            ) : (
              <div className="list-grid">
                {stops.map((stop, index) => (
                  <article className="list-item stacked" key={`stop-${index + 1}`}>
                    <div className="list-item-head">
                      <h3>Stop #{index + 1}</h3>
                      <button
                        type="button"
                        className="button danger"
                        onClick={() => handleRemoveStop(index)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="form-grid two-col">
                      <label>
                        Stop Location
                        <input
                          type="text"
                          value={stop.location}
                          onChange={(event) =>
                            handleStopChange(index, 'location', event.target.value)
                          }
                          placeholder="Lonavala"
                          required
                        />
                      </label>

                      <label>
                        Notes (Optional)
                        <input
                          type="text"
                          value={stop.notes}
                          onChange={(event) =>
                            handleStopChange(index, 'notes', event.target.value)
                          }
                          placeholder="Unload partial goods"
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {error ? <p className="error-text full-width">{error}</p> : null}
          {success ? <p className="success-text full-width">{success}</p> : null}

          <div className="full-width">
            <div className="button-row">
              <button
                type="submit"
                className="button"
                disabled={loading || ownersLoading || owners.length === 0}
              >
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
