import React from 'react';

/**
 * Responsive Input Component
 */
export const ResponsiveInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5 md:mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full
            px-3 md:px-4 py-2 md:py-2.5
            ${Icon ? 'pl-9 md:pl-10' : ''}
            text-sm md:text-base
            border rounded-lg
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs md:text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

/**
 * Responsive Select Component
 */
export const ResponsiveSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5 md:mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`
          w-full
          px-3 md:px-4 py-2 md:py-2.5
          text-sm md:text-base
          border rounded-lg
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all
          bg-white
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs md:text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

/**
 * Responsive Textarea Component
 */
export const ResponsiveTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  rows = 4,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-1.5 md:mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full
          px-3 md:px-4 py-2 md:py-2.5
          text-sm md:text-base
          border rounded-lg
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all
          resize-none
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs md:text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

/**
 * Responsive Button Component
 */
export const ResponsiveButton = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  loading = false,
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm',
    md: 'px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base',
    lg: 'px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg',
  };

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-medium rounded-lg
        flex items-center justify-center gap-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      ) : null}
      {children}
    </button>
  );
};

/**
 * Responsive Form Grid
 */
export const FormGrid = ({ children, columns = 2 }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 md:gap-5`}>
      {children}
    </div>
  );
};
