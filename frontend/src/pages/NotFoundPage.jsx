import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="card auth-card">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link className="button" to="/">
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
