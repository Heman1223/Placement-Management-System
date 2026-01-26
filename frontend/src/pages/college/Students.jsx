import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Search, Filter, Plus, Upload, Download, MoreVertical, Eye, Edit, CheckCircle, XCircle, User, Key, Trash2, Star } from 'lucide-react';
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
    const [resetPasswordModal, setResetPasswordModal] = useState({ open: false, student: null });
    const [newPassword, setNewPassword] = useState('');
    const [profileModal, setProfileModal] = useState({ open: false, student: null, completeness: null });
    const [rejectionModal, setRejectionModal] = useState({ open: false, id: null, name: '' });
    const [rejectionReason, setRejectionReason] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        department: searchParams.get('department') || '',
        batch: searchParams.get('batch') || '',
        status: searchParams.get('status') || '',
        verified: searchParams.get('verified') || '',
        skills: searchParams.get('skills') || '',
        cgpaMin: searchParams.get('cgpaMin') || '',
        cgpaMax: searchParams.get('cgpaMax') || '',
        profileCompleteness: searchParams.get('profileCompleteness') || '',
        isStarStudent: searchParams.get('isStarStudent') || ''
    });

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
    }, [searchParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-dropdown-wrapper')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            const skills = searchParams.get('skills');
            const cgpaMin = searchParams.get('cgpaMin');
            const cgpaMax = searchParams.get('cgpaMax');
            const profileCompleteness = searchParams.get('profileCompleteness');

            if (search) params.search = search;
            if (department) params.department = department;
            if (batch) params.batch = batch;
            if (status) params.status = status;
            if (verified) params.verified = verified;
            if (skills) params.skills = skills;
            if (cgpaMin) params.cgpaMin = cgpaMin;
            if (cgpaMax) params.cgpaMax = cgpaMax;
            if (profileCompleteness) params.profileCompleteness = profileCompleteness;

            const isStarStudent = searchParams.get('isStarStudent');
            if (isStarStudent) params.isStarStudent = isStarStudent;

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
        setFilters({
            search: '',
            department: '',
            batch: '',
            status: '',
            verified: '',
            skills: '',
            cgpaMin: '',
            cgpaMax: '',
            profileCompleteness: '',
            isStarStudent: ''
        });
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
                        ? { ...student, isVerified: true, isRejected: false, verifiedAt: new Date() }
                        : student
                )
            );
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify student');
        }
    };

    const handleReject = async (id, name) => {
        setRejectionModal({ open: true, id, name });
        setRejectionReason('');
    };

    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            await collegeAPI.rejectStudent(rejectionModal.id, rejectionReason);
            toast.error('Student registration rejected', {
                icon: '❌',
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #ef4444'
                }
            });

            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student._id === rejectionModal.id
                        ? { ...student, isVerified: false, isRejected: true, rejectionReason }
                        : student
                )
            );
            setRejectionModal({ open: false, id: null, name: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject student');
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

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        try {
            await collegeAPI.resetStudentPassword(resetPasswordModal.student._id, newPassword);
            toast.success('Password reset successfully');
            setResetPasswordModal({ open: false, student: null });
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const viewProfileCompleteness = async (student) => {
        try {
            const response = await collegeAPI.getStudent(student._id);
            setProfileModal({
                open: true,
                student: response.data.data,
                completeness: response.data.data.profileCompleteness
            });
        } catch (error) {
            toast.error('Failed to load profile details');
        }
    };

    const handleToggleStar = async (id, currentStatus) => {
        try {
            await collegeAPI.toggleStarStudent(id);
            toast.success(currentStatus ? 'Removed from star students' : 'Added to star students');
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student._id === id
                        ? { ...student, isStarStudent: !currentStatus }
                        : student
                )
            );
        } catch (error) {
            toast.error('Failed to toggle star status');
        }
    };

    const handleExport = async () => {
        try {
            const params = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params[key] = value;
            });

            const response = await collegeAPI.exportStudents(params);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `students_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Students exported successfully');
        } catch (error) {
            toast.error('Failed to export students');
        }
    };

    const columns = [
        {
            header: 'S.No',
            accessor: '_id',
            width: '60px',
            render: (_, __, index) => ((pagination.current - 1) * 10) + index + 1
        },
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
            header: 'Status',
            accessor: 'isVerified',
            render: (val, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {val ? (
                        <>
                            <CheckCircle size={18} className="verified-icon" />
                            <span style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: '700' }}>Verified</span>
                        </>
                    ) : row.isRejected ? (
                        <>
                            <XCircle size={18} style={{ color: '#ef4444' }} />
                            <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '700' }}>Rejected</span>
                        </>
                    ) : (
                        <span className="not-verified">Pending</span>
                    )}
                    {!row.resumeUrl && (
                        <div className="incomplete-badge" title="Resume not uploaded">
                            <span className="dot"></span>
                            Incomplete
                        </div>
                    )}
                </div>
            )
        },
        {
            header: '⭐',
            accessor: 'isStarStudent',
            width: '60px',
            render: (val) => (
                <span style={{ color: val ? '#fbbf24' : '#64748b' }}>
                    {val ? '⭐' : '☆'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (id, row) => (
                <div className="action-dropdown-wrapper">
                    <button
                        className="action-dropdown-trigger"
                        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
                    >
                        <MoreVertical size={18} />
                    </button>
                    {openDropdown === id && (
                        <div className="action-dropdown-menu">
                            <button
                                className="action-dropdown-item"
                                onClick={() => {
                                    viewProfileCompleteness(row);
                                    setOpenDropdown(null);
                                }}
                            >
                                <User size={16} />
                                <span>Profile Completeness</span>
                            </button>
                            <Link
                                to={`/college/students/${id}`}
                                className="action-dropdown-item"
                                onClick={() => setOpenDropdown(null)}
                            >
                                <Eye size={16} />
                                <span>View Details</span>
                            </Link>
                            <Link
                                to={`/college/students/${id}/edit`}
                                className="action-dropdown-item"
                                onClick={() => setOpenDropdown(null)}
                            >
                                <Edit size={16} />
                                <span>Edit Student</span>
                            </Link>
                            {!row.isVerified && !row.isRejected && (
                                <button
                                    className="action-dropdown-item success"
                                    onClick={() => {
                                        handleVerify(id);
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <CheckCircle size={16} />
                                    <span>Verify Student</span>
                                </button>
                            )}
                            {!row.isVerified && !row.isRejected && (
                                <button
                                    className="action-dropdown-item danger"
                                    onClick={() => {
                                        handleReject(id, `${row.name.firstName} ${row.name.lastName}`);
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <XCircle size={16} />
                                    <span>Reject Student</span>
                                </button>
                            )}
                            <button
                                className="action-dropdown-item warning"
                                onClick={() => {
                                    setResetPasswordModal({ open: true, student: row });
                                    setOpenDropdown(null);
                                }}
                            >
                                <Key size={16} />
                                <span>Reset Password</span>
                            </button>
                            <button
                                className="action-dropdown-item danger"
                                onClick={() => {
                                    setDeleteModal({ open: true, student: row });
                                    setOpenDropdown(null);
                                }}
                            >
                                <Trash2 size={16} />
                                <span>Delete Student</span>
                            </button>
                            <button
                                className={`action-dropdown-item ${row.isStarStudent ? 'warning' : 'success'}`}
                                onClick={() => {
                                    handleToggleStar(id, row.isStarStudent);
                                    setOpenDropdown(null);
                                }}
                            >
                                <Star size={16} className={row.isStarStudent ? 'text-amber-500 fill-current' : ''} />
                                <span>{row.isStarStudent ? 'Remove Star' : 'Mark as Star'}</span>
                            </button>
                        </div>
                    )}
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
                <Button variant="secondary" icon={Download} onClick={handleExport}>
                    Export CSV
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
                    <div className="filter-group">
                        <label>Skills (comma-separated)</label>
                        <input
                            type="text"
                            value={filters.skills}
                            onChange={(e) => handleFilterChange('skills', e.target.value)}
                            placeholder="e.g. React, Node.js, Python"
                        />
                    </div>
                    <div className="filter-group">
                        <label>CGPA Min</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={filters.cgpaMin}
                            onChange={(e) => handleFilterChange('cgpaMin', e.target.value)}
                            placeholder="e.g. 7.0"
                        />
                    </div>
                    <div className="filter-group">
                        <label>CGPA Max</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={filters.cgpaMax}
                            onChange={(e) => handleFilterChange('cgpaMax', e.target.value)}
                            placeholder="e.g. 9.0"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Profile Completeness (Min %)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={filters.profileCompleteness}
                            onChange={(e) => handleFilterChange('profileCompleteness', e.target.value)}
                            placeholder="e.g. 80"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Star Students</label>
                        <select
                            value={filters.isStarStudent}
                            onChange={(e) => handleFilterChange('isStarStudent', e.target.value)}
                        >
                            <option value="">All Students</option>
                            <option value="true">Star Students Only</option>
                            <option value="false">Non-Star Students</option>
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

            {/* Reset Password Modal */}
            <Modal
                isOpen={resetPasswordModal.open}
                onClose={() => {
                    setResetPasswordModal({ open: false, student: null });
                    setNewPassword('');
                }}
                title="Reset Student Password"
                size="sm"
            >
                <div className="reset-password-modal">
                    <p>Reset password for <strong>{resetPasswordModal.student?.name?.firstName} {resetPasswordModal.student?.name?.lastName}</strong></p>
                    <div className="form-group">
                        <label>New Password</label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 6 characters)"
                        />
                    </div>
                    <div className="modal-actions">
                        <Button variant="secondary" onClick={() => {
                            setResetPasswordModal({ open: false, student: null });
                            setNewPassword('');
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleResetPassword}>
                            Reset Password
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Profile Completeness Modal */}
            <Modal
                isOpen={profileModal.open}
                onClose={() => setProfileModal({ open: false, student: null, completeness: null })}
                title="Profile Completeness"
                size="md"
            >
                <div className="profile-completeness-modal">
                    <div className="student-info">
                        <h3>{profileModal.student?.name?.firstName} {profileModal.student?.name?.lastName}</h3>
                        <p>{profileModal.student?.email}</p>
                    </div>

                    <div className="overall-completeness">
                        <div className="completeness-circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="10"
                                    strokeDasharray={`${(profileModal.completeness?.percentage || 0) * 2.827} 282.7`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="completeness-text">
                                <span className="percentage">{profileModal.completeness?.percentage || 0}%</span>
                                <span className="label">Complete</span>
                            </div>
                        </div>
                    </div>

                    <div className="completeness-breakdown">
                        <h4>Profile Breakdown</h4>
                        <div className="breakdown-item">
                            <div className="breakdown-header">
                                <span>Basic Information</span>
                                <span className="breakdown-percentage">{profileModal.completeness?.breakdown?.basicInfo || 0}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${profileModal.completeness?.breakdown?.basicInfo || 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="breakdown-item">
                            <div className="breakdown-header">
                                <span>Academic Information</span>
                                <span className="breakdown-percentage">{profileModal.completeness?.breakdown?.academicInfo || 0}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${profileModal.completeness?.breakdown?.academicInfo || 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="breakdown-item">
                            <div className="breakdown-header">
                                <span>Education History</span>
                                <span className="breakdown-percentage">{profileModal.completeness?.breakdown?.educationHistory || 0}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${profileModal.completeness?.breakdown?.educationHistory || 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="breakdown-item">
                            <div className="breakdown-header">
                                <span>Skills & Resume</span>
                                <span className="breakdown-percentage">{profileModal.completeness?.breakdown?.skillsResume || 0}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${profileModal.completeness?.breakdown?.skillsResume || 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="breakdown-item">
                            <div className="breakdown-header">
                                <span>Additional Information</span>
                                <span className="breakdown-percentage">{profileModal.completeness?.breakdown?.additionalInfo || 0}%</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${profileModal.completeness?.breakdown?.additionalInfo || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <Button onClick={() => setProfileModal({ open: false, student: null, completeness: null })}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Students;
