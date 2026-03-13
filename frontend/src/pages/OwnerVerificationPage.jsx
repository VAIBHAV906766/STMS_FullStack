import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { getMyOwnerVerificationStatus, requestOwnerVerification } from '../api/ownerApi';

const getVerificationStatus = (owner) => {
  if (!owner) return 'NOT_REQUESTED';
  if (owner.ownerVerified) return 'VERIFIED';
  if (owner.verificationRequestedAt) return 'REQUESTED';
  return 'NOT_REQUESTED';
};

const OwnerVerificationPage = () => {
  const [owner, setOwner] = useState(null);
  const [form, setForm] = useState({
    companyName: '',
    companyLicenseNumber: '',
    companyAddress: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await getMyOwnerVerificationStatus();
      setOwner(data.owner);
      setForm({
        companyName: data.owner?.companyName || '',
        companyLicenseNumber: data.owner?.companyLicenseNumber || '',
        companyAddress: data.owner?.companyAddress || ''
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load verification details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
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

      const data = await requestOwnerVerification(form);
      setOwner(data.owner);
      setSuccess(data.message || 'Verification request submitted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit verification request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card state-card">
        <p>Loading verification details...</p>
      </div>
    );
  }

  const status = getVerificationStatus(owner);

  return (
    <section className="page-stack">
      <PageHero
        eyebrow="Owner Verification"
        title="Transport owner verification"
        description="Submit company details for admin review so customers can identify verified transport owners."
        actions={
          <Link to="/owner/dashboard" className="button secondary">
            Back to Dashboard
          </Link>
        }
        stats={[
          { label: 'Status', value: status.replace('_', ' '), helper: 'Current verification state' },
          {
            label: 'Requested At',
            value: owner?.verificationRequestedAt
              ? new Date(owner.verificationRequestedAt).toLocaleDateString()
              : '-',
            helper: 'Most recent verification request time'
          }
        ]}
      />

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}

      <div className="card form-card">
        <div className="section-header">
          <div>
            <span className="eyebrow">Company Profile</span>
            <h2>Request verification</h2>
            <p className="muted">
              Provide accurate company details. Admin can approve once all data is valid.
            </p>
          </div>
          <span className={`status-badge ${status.toLowerCase()}`}>{status.replace('_', ' ')}</span>
        </div>

        {status === 'VERIFIED' ? (
          <p className="success-text">Your owner account is already verified.</p>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Company Name
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Acme Transport Services"
                required
              />
            </label>

            <label>
              Company License Number
              <input
                type="text"
                name="companyLicenseNumber"
                value={form.companyLicenseNumber}
                onChange={handleChange}
                placeholder="LIC-2026-001"
                required
              />
            </label>

            <label>
              Company Address
              <textarea
                name="companyAddress"
                value={form.companyAddress}
                onChange={handleChange}
                placeholder="Full company registered address"
                rows={4}
                required
              />
            </label>

            <div className="button-row">
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Verification Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default OwnerVerificationPage;
