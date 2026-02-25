import './Table.css';

const Table = ({ columns, data, loading, emptyMessage = 'No data available', onRowClick }) => {
    if (loading) {
        return (
            <div className="table-loading">
                <div className="table-spinner" />
                <span className="text-sm md:text-base text-[#8b6f5a] font-bold uppercase tracking-widest">Loading...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="table-empty">
                <p className="text-sm md:text-base text-[#8b6f5a] font-bold uppercase tracking-widest">{emptyMessage}</p>
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
            <div className="md:hidden space-y-3 p-4">
                {data.map((row, rowIdx) => (
                    <div
                        key={row._id || rowIdx}
                        onClick={() => onRowClick?.(row)}
                        className={`
                            bg-white rounded-xl border border-[#e6d8c3] p-4 shadow-sm
                            ${onRowClick ? 'cursor-pointer hover:bg-[#faf6ef] transition-colors' : ''}
                        `}
                    >
                        {columns.map((col, colIdx) => {
                            if (col.mobileHide) return null;

                            const value = col.render
                                ? col.render(row[col.accessor], row)
                                : row[col.accessor];

                            if (value === null || value === undefined || value === '') return null;

                            return (
                                <div
                                    key={colIdx}
                                    className={`
                                        flex justify-between items-start gap-3
                                        ${colIdx !== 0 ? 'mt-3 pt-3 border-t border-[#faf6ef]' : ''}
                                    `}
                                >
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-wider flex-shrink-0">
                                        {col.header}
                                    </span>
                                    <span className="text-sm text-[#4a2c15] text-right flex-1 min-w-0 font-medium">
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
export const Pagination = ({ current, pages, total, onPageChange }) => {
    const pageCount = pages || Math.ceil((total || 0) / 10);

    if (pageCount <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#e6d8c3] px-4">
            {/* Page Info */}
            <p className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest order-2 sm:order-1">
                Page {current} of {pageCount}
                {total ? <span className="text-[#c6a85e] mx-2">•</span> : null}
                {total ? `${total} items` : null}
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-2 order-1 sm:order-2">
                <button
                    onClick={() => onPageChange(current - 1)}
                    disabled={current === 1}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#6b3f1d] bg-white border border-[#e6d8c3] rounded-lg hover:bg-[#faf6ef] hover:border-[#c6a85e] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(current + 1)}
                    disabled={current === pageCount}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#6b3f1d] bg-white border border-[#e6d8c3] rounded-lg hover:bg-[#faf6ef] hover:border-[#c6a85e] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Table;
