const DashboardCard = ({ title, value, subtitle, tone = 'sky' }) => {
  return (
    <div className={`dashboard-card tone-${tone}`}>
      <span className="dashboard-label">{title}</span>
      <p className="card-value">{value}</p>
      {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
    </div>
  );
};

export default DashboardCard;
