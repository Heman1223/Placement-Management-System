import './Button.css';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    onClick,
    className = '',
    ...props
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        loading && 'btn-loading',
        'text-xs md:text-sm',
        className
    ].filter(Boolean).join(' ');

    const iconSize = size === 'sm' ? 14 : 16;
    const iconSizeMd = size === 'sm' ? 16 : 18;

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <span className="btn-spinner" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className={`w-${iconSize/4} h-${iconSize/4} md:w-${iconSizeMd/4} md:h-${iconSizeMd/4}`} />}
                    {children && <span>{children}</span>}
                    {Icon && iconPosition === 'right' && <Icon className={`w-${iconSize/4} h-${iconSize/4} md:w-${iconSizeMd/4} md:h-${iconSizeMd/4}`} />}
                </>
            )}
        </button>
    );
};

export default Button;
