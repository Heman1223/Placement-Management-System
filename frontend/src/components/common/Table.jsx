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
                                        {col.render ? col.render(row[col.accessor], row, rowIdx) : row[col.accessor]}
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
                            bg-[#1e293b] rounded-xl border border-white/5 p-4 shadow-lg
                            ${onRowClick ? 'cursor-pointer active:bg-white/5 transition-colors' : ''}
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
                                        ${colIdx !== 0 ? 'mt-3 pt-3 border-t border-white/5' : ''}
                                    `}
                                >
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                                        {col.header}
                                    </span>
                                    <span className="text-sm text-white text-right flex-1 min-w-0 font-medium">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
            {/* Page Info */}
            <p className="text-xs md:text-sm text-slate-400 order-2 sm:order-1 font-medium">
                Page {current} of {pages} <span className="text-slate-600 mx-1">•</span> {total} items
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-2 order-1 sm:order-2">
                <button
                    onClick={() => onPageChange(current - 1)}
                    disabled={current === 1}
                    className="
                        px-3 py-1.5 md:px-4 md:py-2
                        text-xs md:text-sm font-medium
                        text-white bg-white/5 border border-white/10 rounded-xl
                        hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed
                        transition-all duration-200
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
                        text-white bg-white/5 border border-white/10 rounded-xl
                        hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed
                        transition-all duration-200
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
