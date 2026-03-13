import { useEffect, useState } from 'react';
import PageHero from '../components/PageHero';
import { getVerificationRequests, verifyOwnerAccount } from '../api/adminApi';

const getStatus = (owner) => {
  if (owner.ownerVerified) return 'VERIFIED';
  if (owner.verificationRequestedAt) return 'REQUESTED';
  return 'NOT_REQUESTED';
};

const AdminVerificationPage = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getVerificationRequests();
      setOwners(data.owners || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load verification requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (ownerId) => {
    try {
      setProcessingId(ownerId);
      setError('');
      setSuccess('');
      await verifyOwnerAccount(ownerId);
      setSuccess('Owner verified successfully.');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to verify owner.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card state-card">
        <p>Loading verification requests...</p>
      </div>
    );
  }

  const requestedCount = owners.filter((owner) => !owner.ownerVerified).length;
  const verifiedCount = owners.filter((owner) => owner.ownerVerified).length;

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Admin Verification Console"
        title="Owner verification requests"
        description="Review owner company details and approve verified transport owners for customer trust visibility."
        stats={[
          { label: 'Pending Review', value: requestedCount, helper: 'Requests waiting for admin approval' },
          { label: 'Verified Owners', value: verifiedCount, helper: 'Owners already approved' }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      <div className="card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Review Queue</span>
            <h2>Verification requests</h2>
            <p className="muted">Approve only after checking company name, license, and address details.</p>
          </div>
        </div>

        {owners.length === 0 ? (
          <p className="muted">No owner verification requests found.</p>
        ) : (
          <div className="list-grid">
            {owners.map((owner) => {
              const status = getStatus(owner);
              return (
                <article key={owner.id} className="list-item stacked">
                  <div className="list-item-head">
                    <h3>
                      {owner.name} ({owner.email})
                    </h3>
                    <span className={`status-badge ${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-chip">Company: {owner.companyName || 'N/A'}</span>
                    <span className="detail-chip">
                      License: {owner.companyLicenseNumber || 'N/A'}
                    </span>
                  </div>
                  <p className="muted">
                    Address: {owner.companyAddress || 'N/A'}
                    {owner.verificationRequestedAt
                      ? ` | Requested: ${new Date(owner.verificationRequestedAt).toLocaleString()}`
                      : ''}
                  </p>

                  {!owner.ownerVerified ? (
                    <div className="button-row">
                      <button
                        type="button"
                        className="button"
                        disabled={processingId === owner.id}
                        onClick={() => handleApprove(owner.id)}
                      >
                        {processingId === owner.id ? 'Approving...' : 'Approve Verification'}
                      </button>
                    </div>
                  ) : (
                    <p className="success-text small">This owner is already verified.</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminVerificationPage;
