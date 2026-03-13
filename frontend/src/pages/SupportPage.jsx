import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { createSupportQuery, getMySupportQueries } from '../api/supportApi';

const SupportPage = () => {
  const [queries, setQueries] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const data = await getMySupportQueries();
      setQueries(data.queries || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load support queries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      await createSupportQuery(form);
      setSuccess('Your support query has been submitted.');
      setForm({ subject: '', message: '' });
      fetchQueries();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit support query.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card state-card">
        <p>Loading support queries...</p>
      </div>
    );
  }

  const openCount = queries.filter((query) => query.status === 'OPEN').length;
  const inProgressCount = queries.filter((query) => query.status === 'IN_PROGRESS').length;
  const resolvedCount = queries.filter((query) => query.status === 'RESOLVED').length;

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Customer Support"
        title="Support and issue queries"
        description="Submit account, booking, or invoice issues and track progress from open to resolution."
        actions={
          <Link to="/customer/dashboard" className="button secondary">
            Back to Dashboard
          </Link>
        }
        stats={[
          { label: 'Open', value: openCount, helper: 'Newly submitted issues' },
          { label: 'In Progress', value: inProgressCount, helper: 'Queries currently being handled' },
          { label: 'Resolved', value: resolvedCount, helper: 'Queries marked complete' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      <div className="card form-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">New Query</span>
            <h2>Submit support request</h2>
            <p className="muted">Add a clear subject and message so admin can respond quickly.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Subject
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Issue with invoice payment status"
              required
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Describe the issue in detail"
              rows={5}
              required
            />
          </label>

          <div className="button-row">
            <button className="button" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Query'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <span className="eyebrow">My Queries</span>
            <h2>Submitted support queries</h2>
            <p className="muted">Track each query status and submission timestamp.</p>
          </div>
        </div>

        {queries.length === 0 ? (
          <p className="muted">You have not submitted any support queries yet.</p>
        ) : (
          <div className="list-grid">
            {queries.map((query) => (
              <article key={query.id} className="list-item stacked">
                <div className="list-item-head">
                  <h3>{query.subject}</h3>
                  <span className={`status-badge ${String(query.status).toLowerCase()}`}>
                    {query.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="muted">{query.message}</p>
                <p className="muted small">Submitted: {new Date(query.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SupportPage;
