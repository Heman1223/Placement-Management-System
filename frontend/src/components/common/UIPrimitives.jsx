import React from 'react';

/**
 * Primary Button with mocha theme
 * bg-primary text-white hover:bg-primaryDark transition rounded-lg px-4 py-2 shadow-soft
 */
export const PrimaryButton = ({ children, className = '', ...props }) => (
    <button
        className={`bg-primary text-white hover:bg-primaryDark transition-all duration-300 rounded-lg px-6 py-2.5 shadow-soft font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 ${className}`}
        {...props}
    >
        {children}
    </button>
);

/**
 * Input Field with cream theme
 * bg-cream border border-border text-text rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary
 */
export const InputField = ({ label, error, className = '', ...props }) => (
    <div className="flex flex-col gap-2 w-full">
        {label && (
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-1">
                {label}
            </label>
        )}
        <input
            className={`theme-input ${error ? 'border-red-400' : ''} ${className}`}
            {...props}
        />
        {error && <span className="text-[10px] font-bold text-red-500 ml-1 leading-none mt-1">{error}</span>}
    </div>
);

/**
 * Card with card background and soft shadow
 * bg-card rounded-2xl shadow-soft p-6
 */
export const PremiumCard = ({ children, title, subtitle, className = '', ...props }) => (
    <div
        className={`bg-white rounded-[2rem] shadow-soft p-8 border border-[var(--accent-gold)]/20 ${className}`}
        {...props}
    >
        {(title || subtitle) && (
            <div className="mb-6">
                {title && <h3 className="text-xl font-black text-text tracking-tight">{title}</h3>}
                {subtitle && <p className="text-sm font-medium text-muted">{subtitle}</p>}
            </div>
        )}
        {children}
    </div>
);
