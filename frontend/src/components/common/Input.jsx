import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({
    label,
    type = 'text',
    error,
    helperText,
    icon: Icon,
    fullWidth = true,
    className = '',
    ...props
}, ref) => {
    const wrapperClasses = [
        'input-wrapper',
        fullWidth && 'input-full',
        error && 'input-error',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {label && (
                <label className="input-label">
                    {label}
                    {props.required && <span className="input-required">*</span>}
                </label>
            )}
            <div className="input-container">
                {Icon && (
                    <span className="input-icon">
                        <Icon size={18} />
                    </span>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`input ${Icon ? 'input-with-icon' : ''}`}
                    {...props}
                />
            </div>
            {(error || helperText) && (
                <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
                    {error || helperText}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
