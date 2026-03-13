const roleHighlights = [
  {
    title: 'Customer',
    description: 'Book shipments, follow approvals, and clear invoices quickly.'
  },
  {
    title: 'Owner',
    description: 'Review requests, assign drivers, and control invoice flow.'
  },
  {
    title: 'Driver',
    description: 'Open one dashboard and see every approved trip in one place.'
  }
];

const AuthShell = ({ title, description, children, footer }) => {
  return (
    <div className="auth-shell">
      <section className="card auth-visual">
        <span className="eyebrow">Smart Transport Management</span>
        <h1>Keep bookings, dispatch, billing, and payments inside one focused workspace.</h1>
        <p className="hero-description">
          STMS is built for a clean academic demo flow, but the interface should still feel
          deliberate, modern, and easy to move through.
        </p>

        <div className="auth-feature-list">
          <span className="feature-pill">Role-based dashboards</span>
          <span className="feature-pill">Booking approvals</span>
          <span className="feature-pill">Invoice generation</span>
          <span className="feature-pill">Payment tracking</span>
        </div>

        <div className="auth-role-grid">
          {roleHighlights.map((item) => (
            <article key={item.title} className="auth-role-card">
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card auth-card">
        <div className="auth-card-header">
          <span className="eyebrow">Access Portal</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        {children}

        {footer ? <div className="auth-footer">{footer}</div> : null}
      </section>
    </div>
  );
};

export default AuthShell;
