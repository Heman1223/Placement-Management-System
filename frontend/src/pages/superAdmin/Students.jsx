import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Search, Filter, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        college: '',
        department: '',
        batch: '',
        placementStatus: '',
        minCGPA: '',
        maxCGPA: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [pagination.current]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: 20,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                )
            };
            
            const response = await superAdminAPI.getAllStudents(params);
            setStudents(response.data.data.students);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, current: 1 });
        fetchStudents();
    };

    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            college: '',
            department: '',
            batch: '',
            placementStatus: '',
            minCGPA: '',
            maxCGPA: ''
        });
        setPagination({ ...pagination, current: 1 });
        setTimeout(fetchStudents, 100);
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            render: (name) => `${name.firstName} ${name.lastName}`
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Roll Number', accessor: 'rollNumber' },
        {
            header: 'College',
            accessor: 'college',
            render: (college) => college?.name || 'N/A'
        },
        { header: 'Department', accessor: 'department' },
        { header: 'Batch', accessor: 'batch' },
        {
            header: 'CGPA',
            accessor: 'cgpa',
            render: (cgpa) => cgpa?.toFixed(2) || 'N/A'
        },
        {
            header: 'Status',
            accessor: 'placementStatus',
            render: (status) => (
                <span className={`status-badge status-${status === 'placed' ? 'success' : 'pending'}`}>
                    {status?.replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Verified',
            accessor: 'isVerified',
            render: (verified) => (
                <span className={`status-badge ${verified ? 'status-success' : 'status-pending'}`}>
                    {verified ? 'Yes' : 'No'}
                </span>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>All Students</h1>
                    <p>Platform-wide student overview (Read-only)</p>
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={18} />
                    {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-bar">
                <Input
                    icon={Search}
                    placeholder="Search by name, email, or roll number..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <Button type="submit">Search</Button>
            </form>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filters-grid">
                        <Input
                            label="Department"
                            placeholder="e.g., Computer Science"
                            value={filters.department}
                            onChange={(e) => handleFilterChange('department', e.target.value)}
                        />
                        <Input
                            label="Batch"
                            type="number"
                            placeholder="e.g., 2024"
                            value={filters.batch}
                            onChange={(e) => handleFilterChange('batch', e.target.value)}
                        />
                        <div>
                            <label className="input-label">Placement Status</label>
                            <select
                                className="input"
                                value={filters.placementStatus}
                                onChange={(e) => handleFilterChange('placementStatus', e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="not_placed">Not Placed</option>
                                <option value="placed">Placed</option>
                                <option value="in_process">In Process</option>
                            </select>
                        </div>
                        <Input
                            label="Min CGPA"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 7.0"
                            value={filters.minCGPA}
                            onChange={(e) => handleFilterChange('minCGPA', e.target.value)}
                        />
                        <Input
                            label="Max CGPA"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 10.0"
                            value={filters.maxCGPA}
                            onChange={(e) => handleFilterChange('maxCGPA', e.target.value)}
                        />
                    </div>
                    <div className="filters-actions">
                        <Button onClick={fetchStudents}>Apply Filters</Button>
                        <Button variant="outline" onClick={clearFilters}>Clear All</Button>
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <div className="stats-summary">
                <span>Total Students: <strong>{pagination.total}</strong></span>
                <span>Page {pagination.current} of {pagination.pages}</span>
            </div>

            {/* Students Table */}
            {loading ? (
                <div className="loading-screen"><div className="loading-spinner" /></div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={students}
                        emptyMessage="No students found"
                    />

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <Button
                                variant="outline"
                                disabled={pagination.current === 1}
                                onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                            >
                                Previous
                            </Button>
                            <span>Page {pagination.current} of {pagination.pages}</span>
                            <Button
                                variant="outline"
                                disabled={pagination.current === pagination.pages}
                                onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Students;
