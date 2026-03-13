import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero';
import {
  getAdminSupportQueries,
  updateAdminSupportQueryStatus
} from '../api/adminApi';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

const AdminSupportPage = () => {
  const [queries, setQueries] = useState([]);
  const [statusById, setStatusById] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const data = await getAdminSupportQueries();
      const nextQueries = data.queries || [];
      setQueries(nextQueries);
      setStatusById(
        nextQueries.reduce((acc, query) => {
          acc[query.id] = query.status;
          return acc;
        }, {})
      );
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load customer support queries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleStatusChange = (queryId, value) => {
    setStatusById((prev) => ({ ...prev, [queryId]: value }));
  };

  const handleUpdate = async (queryId) => {
    try {
      setProcessingId(queryId);
      setError('');
      setSuccess('');
      await updateAdminSupportQueryStatus(queryId, statusById[queryId]);
      setSuccess('Support query status updated.');
      fetchQueries();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update support query status.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card state-card">
        <p>Loading customer support queries...</p>
      </div>
    );
  }

  const openCount = queries.filter((query) => query.status === 'OPEN').length;
  const inProgressCount = queries.filter((query) => query.status === 'IN_PROGRESS').length;
  const resolvedCount = queries.filter((query) => query.status === 'RESOLVED').length;

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Admin Support Console"
        title="Customer support queries"
        description="Review incoming customer queries and update lifecycle status from open through resolution."
        stats={[
          { label: 'Open', value: openCount, helper: 'Unprocessed customer queries' },
          { label: 'In Progress', value: inProgressCount, helper: 'Queries actively being handled' },
          { label: 'Resolved', value: resolvedCount, helper: 'Completed support requests' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      <div className="card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Query Queue</span>
            <h2>All customer support queries</h2>
            <p className="muted">Review the issue and keep status updates accurate for customer visibility.</p>
          </div>
        </div>

        {queries.length === 0 ? (
          <p className="muted">No support queries found.</p>
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

                <div className="detail-row">
                  <span className="detail-chip">
                    Customer: {query.customer?.name || 'Unknown'}
                  </span>
                  <span className="detail-chip">{query.customer?.email || 'N/A'}</span>
                </div>
                <p className="muted">{query.message}</p>
                <p className="muted small">Submitted: {new Date(query.createdAt).toLocaleString()}</p>

                <div className="inline-form">
                  <label>
                    Update Status
                    <select
                      value={statusById[query.id] || query.status}
                      onChange={(event) => handleStatusChange(query.id, event.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="button"
                    disabled={processingId === query.id}
                    onClick={() => handleUpdate(query.id)}
                  >
                    {processingId === query.id ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminSupportPage;
