import './Card.css';

const Card = ({
    children,
    title,
    subtitle,
    actions,
    padding = 'default',
    className = '',
    onClick,
    hoverable = false,
    ...props
}) => {
    const classes = [
        'card',
        `card-padding-${padding}`,
        hoverable && 'card-hoverable',
        onClick && 'card-clickable',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {(title || actions) && (
                <div className="card-header">
                    <div className="card-header-content">
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className="card-body">{children}</div>
        </div>
    );
};

// Stats Card variant
export const StatsCard = ({ title, value, icon: Icon, trend, trendUp, color = 'primary' }) => {
    return (
        <div className={`stats-card stats-card-${color}`}>
            <div className="stats-card-icon">
                {Icon && <Icon size={24} />}
            </div>
            <div className="stats-card-content">
                <span className="stats-card-value">{value}</span>
                <span className="stats-card-title">{title}</span>
                {trend && (
                    <span className={`stats-card-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Card;
