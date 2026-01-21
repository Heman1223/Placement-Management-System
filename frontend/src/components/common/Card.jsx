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
        <div className={`${classes} text-sm md:text-base`} onClick={onClick} {...props}>
            {(title || actions) && (
                <div className="card-header">
                    <div className="card-header-content">
                        {title && <h3 className="card-title text-base md:text-lg">{title}</h3>}
                        {subtitle && <p className="card-subtitle text-xs md:text-sm">{subtitle}</p>}
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
            <div className="stats-card-icon w-10 h-10 md:w-12 md:h-12">
                {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6" />}
            </div>
            <div className="stats-card-content">
                <span className="stats-card-value text-xl md:text-2xl">{value}</span>
                <span className="stats-card-title text-xs md:text-sm">{title}</span>
                {trend && (
                    <span className={`stats-card-trend text-xs md:text-sm ${trendUp ? 'trend-up' : 'trend-down'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Card;
