import { Link, useNavigate } from 'react-router-dom';
import { roleHomePath, useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user.role;

  return (
    <header className="navbar">
      <div className="navbar-content container">
        <Link to={roleHomePath(role)} className="brand">
          STMS
        </Link>

        <nav className="nav-links">
          {role === 'CUSTOMER' && <Link to="/customer/bookings/new">Create Booking</Link>}
          {role === 'CUSTOMER' && <Link to="/customer/invoices">My Invoices</Link>}
          {role === 'OWNER' && <Link to="/owner/pending-bookings">Pending Bookings</Link>}
          {role === 'OWNER' && <Link to="/owner/invoices">Invoices</Link>}
          <button className="button ghost" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
