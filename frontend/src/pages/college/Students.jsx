import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Plus, Search, Filter, CheckCircle, Eye, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import './Students.css';

const Students = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [departments, setDepartments] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, student: null });

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        department: searchParams.get('department') || '',
        batch: searchParams.get('batch') || '',
        status: searchParams.get('status') || '',
        verified: searchParams.get('verified') || ''
    });

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
    }, [searchParams]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = {
                page: searchParams.get('page') || 1,
                sortBy: 'createdAt',
                order: 'desc' // Newest first
            };
            
            // Only add filter params if they have values
            const search = searchParams.get('search');
            const department = searchParams.get('department');
            const batch = searchParams.get('batch');
            const status = searchParams.get('status');
            const verified = searchParams.get('verified');
            
            if (search) params.search = search;
            if (department) params.department = department;
            if (batch) params.batch = batch;
            if (status) params.status = status;
            if (verified) params.verified = verified;

            const response = await collegeAPI.getStudents(params);
            setStudents(response.data.data.students);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await collegeAPI.getDepartments();
            setDepartments(response.data.data);
        } catch (error) {
            console.error('Failed to load departments');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        params.set('page', '1');
        setSearchParams(params);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({ search: '', department: '', batch: '', status: '', verified: '' });
        setSearchParams({}); // Clear URL params
        setShowFilters(false);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
    };

    const handleVerify = async (id) => {
        try {
            const response = await collegeAPI.verifyStudent(id);
            toast.success('Student verified successfully');
            
            // Update the student in the local state immediately
            setStudents(prevStudents => 
                prevStudents.map(student => 
                    student._id === id 
                        ? { ...student, isVerified: true, verifiedAt: new Date() }
                        : student
                )
            );
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify student');
        }
    };

    const handleDelete = async () => {
        try {
            await collegeAPI.deleteStudent(deleteModal.student._id);
            toast.success('Student deleted successfully');
            setDeleteModal({ open: false, student: null });
            fetchStudents();
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    const columns = [
        {
            header: 'Name',
            accessor: 'name',
            render: (val) => `${val?.firstName || ''} ${val?.lastName || ''}`
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Department', accessor: 'department' },
        { header: 'Batch', accessor: 'batch' },
        {
            header: 'CGPA',
            accessor: 'cgpa',
            render: (val) => val?.toFixed(2) || '-'
        },
        {
            header: 'Status',
            accessor: 'placementStatus',
            render: (val) => (
                <span className={`status-badge status-${val}`}>
                    {val?.replace('_', ' ') || 'Not Placed'}
                </span>
            )
        },
        {
            header: 'Verified',
            accessor: 'isVerified',
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {val ? (
                        <>
                            <CheckCircle size={18} className="verified-icon" />
                            <span style={{ fontSize: '0.875rem', color: 'var(--success-600)' }}>Verified</span>
                        </>
                    ) : (
                        <span className="not-verified">Pending</span>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (id, row) => (
                <div className="action-buttons">
                    <Link to={`/college/students/${id}`}>
                        <button className="action-btn" title="View">
                            <Eye size={16} />
                        </button>
                    </Link>
                    <Link to={`/college/students/${id}/edit`}>
                        <button className="action-btn" title="Edit">
                            <Edit size={16} />
                        </button>
                    </Link>
                    {!row.isVerified && (
                        <button
                            className="action-btn action-btn-success"
                            title="Verify"
                            onClick={() => handleVerify(id)}
                        >
                            <CheckCircle size={16} />
                        </button>
                    )}
                    <button
                        className="action-btn action-btn-danger"
                        title="Delete"
                        onClick={() => setDeleteModal({ open: true, student: row })}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const batches = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i);

    return (
        <div className="students-page">
            <div className="page-header">
                <div>
                    <h1>Students</h1>
                    <p>Manage and track all your students</p>
                </div>
                <div className="header-actions">
                    <Link to="/college/upload">
                        <Button variant="secondary" icon={Upload}>Bulk Upload</Button>
                    </Link>
                    <Link to="/college/students/new">
                        <Button icon={Plus}>Add Student</Button>
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or roll number..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>
                <Button variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>
                    Filters
                </Button>
                <Button onClick={applyFilters}>Apply</Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Department</label>
                        <select
                            value={filters.department}
                            onChange={(e) => handleFilterChange('department', e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Batch</label>
                        <select
                            value={filters.batch}
                            onChange={(e) => handleFilterChange('batch', e.target.value)}
                        >
                            <option value="">All Batches</option>
                            {batches.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Placement Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="not_placed">Not Placed</option>
                            <option value="in_process">In Process</option>
                            <option value="placed">Placed</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Verification</label>
                        <select
                            value={filters.verified}
                            onChange={(e) => handleFilterChange('verified', e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="true">Verified</option>
                            <option value="false">Pending</option>
                        </select>
                    </div>
                    <Button variant="ghost" onClick={clearFilters}>Clear All</Button>
                </div>
            )}

            {/* Students Table */}
            <div className="table-container">
                <Table
                    columns={columns}
                    data={students}
                    loading={loading}
                    emptyMessage="No students found. Add your first student!"
                />
                <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, student: null })}
                title="Delete Student"
                size="sm"
            >
                <div className="delete-modal">
                    <p>Are you sure you want to delete <strong>{deleteModal.student?.name?.firstName} {deleteModal.student?.name?.lastName}</strong>?</p>
                    <p className="warning-text">This action cannot be undone.</p>
                    <div className="modal-actions">
                        <Button variant="secondary" onClick={() => setDeleteModal({ open: false, student: null })}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Students;
