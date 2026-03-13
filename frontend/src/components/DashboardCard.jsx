const DashboardCard = ({ title, value, subtitle }) => {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p className="card-value">{value}</p>
      {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
    </div>
  );
};

export default DashboardCard;
