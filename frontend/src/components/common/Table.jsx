import './Table.css';

const Table = ({ columns, data, loading, emptyMessage = 'No data available', onRowClick }) => {
    if (loading) {
        return (
            <div className="table-loading">
                <div className="table-spinner" />
                <span className="text-sm md:text-base">Loading...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="table-empty">
                <p className="text-sm md:text-base">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{ width: col.width }}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIdx) => (
                            <tr
                                key={row._id || rowIdx}
                                onClick={() => onRowClick?.(row)}
                                className={onRowClick ? 'table-row-clickable' : ''}
                            >
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx}>
                                        {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {data.map((row, rowIdx) => (
                    <div
                        key={row._id || rowIdx}
                        onClick={() => onRowClick?.(row)}
                        className={`
                            bg-white rounded-lg border border-gray-200 p-4 shadow-sm
                            ${onRowClick ? 'cursor-pointer active:bg-gray-50 transition-colors' : ''}
                        `}
                    >
                        {columns.map((col, colIdx) => {
                            // Skip if column has mobileHide flag
                            if (col.mobileHide) return null;

                            const value = col.render
                                ? col.render(row[col.accessor], row)
                                : row[col.accessor];

                            // Skip empty values
                            if (value === null || value === undefined || value === '') return null;

                            return (
                                <div
                                    key={colIdx}
                                    className={`
                                        flex justify-between items-start gap-3
                                        ${colIdx !== 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}
                                    `}
                                >
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex-shrink-0">
                                        {col.header}
                                    </span>
                                    <span className="text-sm text-gray-900 text-right flex-1 min-w-0">
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

// Pagination component
export const Pagination = ({ current, total, onPageChange }) => {
    const pages = Math.ceil(total / 10);

    if (pages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
            {/* Page Info */}
            <p className="text-xs md:text-sm text-gray-600 order-2 sm:order-1">
                Page {current} of {pages} ({total} total items)
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-2 order-1 sm:order-2">
                <button
                    onClick={() => onPageChange(current - 1)}
                    disabled={current === 1}
                    className="
                        px-3 py-1.5 md:px-4 md:py-2
                        text-xs md:text-sm font-medium
                        text-gray-700 bg-white border border-gray-300 rounded-lg
                        hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors
                        min-w-[80px] md:min-w-[90px]
                    "
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(current + 1)}
                    disabled={current === pages}
                    className="
                        px-3 py-1.5 md:px-4 md:py-2
                        text-xs md:text-sm font-medium
                        text-gray-700 bg-white border border-gray-300 rounded-lg
                        hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors
                        min-w-[80px] md:min-w-[90px]
                    "
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Table;
