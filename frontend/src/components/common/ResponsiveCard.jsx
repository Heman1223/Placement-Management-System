import React from 'react';

/**
 * Responsive Card Component with Tailwind CSS
 * 
 * Desktop: Full padding, larger text
 * Mobile: Reduced padding, smaller text
 */
const ResponsiveCard = ({ 
  children, 
  className = '', 
  hoverable = false,
  onClick 
}) => {
  const baseClasses = `
    bg-white 
    rounded-lg md:rounded-xl 
    shadow-sm 
    border border-gray-200
    p-4 md:p-6
    transition-all duration-200
    ${hoverable ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer' : ''}
    ${className}
  `;

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
};

/**
 * Responsive Stats Card
 * Shows icon, value, and label
 */
export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary',
  trend 
}) => {
  const colorClasses = {
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <ResponsiveCard hoverable>
      <div className="flex items-center gap-3 md:gap-4">
        {/* Icon */}
        <div className={`
          w-10 h-10 md:w-14 md:h-14 
          rounded-lg md:rounded-xl 
          flex items-center justify-center
          ${colorClasses[color]}
        `}>
          {Icon && <Icon className="w-5 h-5 md:w-7 md:h-7" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
            {value}
          </p>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1 truncate">
            {title}
          </p>
        </div>

        {/* Optional Trend */}
        {trend && (
          <div className={`
            text-xs md:text-sm font-medium
            ${trend > 0 ? 'text-green-600' : 'text-red-600'}
          `}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </ResponsiveCard>
  );
};

/**
 * Responsive Grid Container for Cards
 */
export const CardGrid = ({ children, columns = 4 }) => {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`
      grid 
      ${gridClasses[columns] || gridClasses[4]}
      gap-3 md:gap-5
    `}>
      {children}
    </div>
  );
};

export default ResponsiveCard;
