import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="centered-state">
      <div className="card state-card not-found-card">
        <span className="eyebrow">404 Signal Lost</span>
        <h1>Page not found</h1>
        <p className="muted">
          The route you requested is not available. Head back to your dashboard and continue the
          workflow from there.
        </p>
        <div className="button-row">
          <Link className="button" to="/">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
