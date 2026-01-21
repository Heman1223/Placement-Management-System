import React from 'react';

/**
 * Responsive Table Component
 * 
 * Desktop: Traditional table layout
 * Mobile: Card-based layout (stacked rows)
 */
const ResponsiveTable = ({ columns, data, onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 md:py-12 text-gray-500 text-sm md:text-base">
        No data available
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  transition-colors
                `}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.accessor], row)
                      : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            onClick={() => onRowClick && onRowClick(row)}
            className={`
              bg-white rounded-lg border border-gray-200 p-4
              ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}
              transition-colors
            `}
          >
            {columns.map((column, colIndex) => {
              // Skip if column has mobileHide flag
              if (column.mobileHide) return null;

              const value = column.render
                ? column.render(row[column.accessor], row)
                : row[column.accessor];

              return (
                <div
                  key={colIndex}
                  className={`
                    flex justify-between items-start
                    ${colIndex !== 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}
                  `}
                >
                  <span className="text-xs font-medium text-gray-600 uppercase">
                    {column.header}
                  </span>
                  <span className="text-sm text-gray-900 text-right ml-2">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * Responsive Table with Pagination
 */
export const ResponsiveTableWithPagination = ({
  columns,
  data,
  pagination,
  onPageChange,
  onRowClick,
}) => {
  return (
    <div className="space-y-4">
      <ResponsiveTable
        columns={columns}
        data={data}
        onRowClick={onRowClick}
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <p className="text-xs md:text-sm text-gray-600">
            Page {pagination.current} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="
                px-3 py-1.5 md:px-4 md:py-2
                text-xs md:text-sm font-medium
                text-gray-700 bg-white border border-gray-300 rounded-lg
                hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="
                px-3 py-1.5 md:px-4 md:py-2
                text-xs md:text-sm font-medium
                text-gray-700 bg-white border border-gray-300 rounded-lg
                hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;
