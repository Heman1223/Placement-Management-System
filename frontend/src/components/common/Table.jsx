import './Table.css';

const Table = ({ columns, data, loading, emptyMessage = 'No data available', onRowClick }) => {
    if (loading) {
        return (
            <div className="table-loading">
                <div className="table-spinner" />
                <span>Loading...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="table-empty">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
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
    );
};

// Pagination component
export const Pagination = ({ current, total, onPageChange }) => {
    const pages = Math.ceil(total / 10);

    if (pages <= 1) return null;

    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                onClick={() => onPageChange(current - 1)}
                disabled={current === 1}
            >
                Previous
            </button>
            <span className="pagination-info">
                Page {current} of {pages}
            </span>
            <button
                className="pagination-btn"
                onClick={() => onPageChange(current + 1)}
                disabled={current === pages}
            >
                Next
            </button>
        </div>
    );
};

export default Table;
