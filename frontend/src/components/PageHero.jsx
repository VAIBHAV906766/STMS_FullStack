const PageHero = ({ eyebrow, title, description, actions, stats = [] }) => {
  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p className="hero-description">{description}</p> : null}
        {actions ? <div className="button-row hero-actions">{actions}</div> : null}
      </div>

      {stats.length ? (
        <div className="hero-highlights">
          {stats.map((stat) => (
            <article key={stat.label} className="hero-stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              {stat.helper ? <small>{stat.helper}</small> : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default PageHero;
