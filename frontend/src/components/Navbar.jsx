import { NavLink, useNavigate } from 'react-router-dom';
import { roleHomePath, useAuth } from '../context/AuthContext';

const linkMap = {
  CUSTOMER: [
    { to: '/customer/dashboard', label: 'Dashboard' },
    { to: '/customer/bookings/new', label: 'Create Booking' },
    { to: '/customer/invoices', label: 'Invoices' },
    { to: '/customer/support', label: 'Support' }
  ],
  OWNER: [
    { to: '/owner/dashboard', label: 'Dashboard' },
    { to: '/owner/pending-bookings', label: 'Pending' },
    { to: '/owner/invoices', label: 'Invoices' },
    { to: '/owner/verification', label: 'Verification' }
  ],
  DRIVER: [{ to: '/driver/dashboard', label: 'Dashboard' }],
  ADMIN: [
    { to: '/admin/verification-requests', label: 'Owner Verification' },
    { to: '/admin/support-queries', label: 'Support Queries' }
  ]
};

const formatRole = (role) => `${role.slice(0, 1)}${role.slice(1).toLowerCase()}`;

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
  const links = linkMap[role] || [];

  return (
    <header className="navbar">
      <div className="navbar-content container">
        <NavLink to={roleHomePath(role)} className="brand">
          <span className="brand-mark">ST</span>
          <span className="brand-copy">
            <small>Smart Transport</small>
            <strong>Management System</strong>
          </span>
        </NavLink>

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="nav-meta">
            <span className="role-chip">{formatRole(role)}</span>
            <span className="identity-chip">{user.name}</span>
          </div>

          <button className="button ghost" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
