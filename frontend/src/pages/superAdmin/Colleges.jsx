import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { CheckCircle, XCircle, Eye, Building2, Plus, Edit2, Power, Trash2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Colleges = () => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [detailModal, setDetailModal] = useState({ open: false, college: null });
    const [editModal, setEditModal] = useState({ open: false, college: null });
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchColleges();
    }, [filter]);

    const fetchColleges = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, verified: filter || undefined };
            const response = await superAdminAPI.getColleges(params);
            setColleges(response.data.data.colleges);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load colleges');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, approved) => {
        try {
            await superAdminAPI.approveCollege(id, approved);
            toast.success(approved ? 'College approved' : 'College rejected');
            fetchColleges(pagination.current);
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this college?`)) return;

        try {
            await superAdminAPI.toggleCollegeStatus(id);
            toast.success(`College ${action}d successfully`);
            fetchColleges(pagination.current);
        } catch (error) {
            toast.error(`Failed to ${action} college`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this college? This action can be reversed later.')) return;

        try {
            await superAdminAPI.deleteCollege(id);
            toast.success('College deleted successfully');
            fetchColleges(pagination.current);
        } catch (error) {
            toast.error('Failed to delete college');
        }
    };

    const handleRestore = async (id) => {
        try {
            await superAdminAPI.restoreCollege(id);
            toast.success('College restored successfully');
            fetchColleges(pagination.current);
        } catch (error) {
            toast.error('Failed to restore college');
        }
    };

    const openEditModal = (college) => {
        setEditForm({
            name: college.name,
            code: college.code,
            university: college.university || '',
            city: college.address?.city || '',
            state: college.address?.state || '',
            pincode: college.address?.pincode || '',
            contactEmail: college.contactEmail,
            phone: college.phone || '',
            website: college.website || ''
        });
        setEditModal({ open: true, college });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await superAdminAPI.updateCollege(editModal.college._id, {
                name: editForm.name,
                code: editForm.code,
                university: editForm.university,
                address: {
                    city: editForm.city,
                    state: editForm.state,
                    pincode: editForm.pincode,
                    country: 'India'
                },
                contactEmail: editForm.contactEmail,
                phone: editForm.phone,
                website: editForm.website
            });
            toast.success('College updated successfully');
            setEditModal({ open: false, college: null });
            fetchColleges(pagination.current);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update college');
        }
    };

    const columns = [
        {
            header: 'College',
            accessor: 'name',
            render: (name, row) => (
                <Link to={`/admin/colleges/${row._id}`} className="entity-cell-link">
                    <div className="entity-cell">
                        <div className="entity-icon">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <span className="entity-name">{name}</span>
                            <span className="entity-meta">{row.code}</span>
                        </div>
                    </div>
                </Link>
            )
        },
        {
            header: 'Location',
            accessor: 'address',
            render: (addr) => addr ? `${addr.city}, ${addr.state}` : '-'
        },
        {
            header: 'Contact',
            accessor: 'contactEmail'
        },
        {
            header: 'Students',
            accessor: 'stats',
            render: (stats) => stats?.totalStudents || 0
        },
        {
            header: 'Status',
            accessor: 'isVerified',
            render: (val, row) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`status-badge ${val ? 'status-success' : 'status-pending'}`}>
                        {val ? 'Verified' : 'Pending'}
                    </span>
                    {row.isDeleted && (
                        <span className="status-badge status-error">Deleted</span>
                    )}
                    {!row.isDeleted && !row.isActive && (
                        <span className="status-badge status-warning">Inactive</span>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (id, row) => (
                <div className="action-buttons">
                    <button
                        className="action-btn"
                        onClick={() => setDetailModal({ open: true, college: row })}
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    {!row.isDeleted && (
                        <>
                            <button
                                className="action-btn"
                                onClick={() => openEditModal(row)}
                                title="Edit College"
                            >
                                <Edit2 size={16} />
                            </button>
                            {!row.isVerified && (
                                <>
                                    <button
                                        className="action-btn action-btn-success"
                                        onClick={() => handleApprove(id, true)}
                                        title="Approve"
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                    <button
                                        className="action-btn action-btn-danger"
                                        onClick={() => handleApprove(id, false)}
                                        title="Reject"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </>
                            )}
                            {row.isVerified && (
                                <button
                                    className={`action-btn ${row.isActive ? 'action-btn-warning' : 'action-btn-success'}`}
                                    onClick={() => handleToggleActive(id, row.isActive)}
                                    title={row.isActive ? 'Deactivate' : 'Activate'}
                                >
                                    <Power size={16} />
                                </button>
                            )}
                            <button
                                className="action-btn action-btn-danger"
                                onClick={() => handleDelete(id)}
                                title="Delete College"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                    {row.isDeleted && (
                        <button
                            className="action-btn action-btn-success"
                            onClick={() => handleRestore(id)}
                            title="Restore College"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Colleges</h1>
                    <p>Manage registered colleges and universities</p>
                </div>
                <Link to="/admin/colleges/new">
                    <Button icon={Plus}>Add College</Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === '' ? 'active' : ''}`}
                    onClick={() => setFilter('')}
                >
                    All
                </button>
                <button
                    className={`filter-tab ${filter === 'true' ? 'active' : ''}`}
                    onClick={() => setFilter('true')}
                >
                    Verified
                </button>
                <button
                    className={`filter-tab ${filter === 'false' ? 'active' : ''}`}
                    onClick={() => setFilter('false')}
                >
                    Pending
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <Table
                    columns={columns}
                    data={colleges}
                    loading={loading}
                    emptyMessage="No colleges registered yet"
                />
                <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    onPageChange={(page) => fetchColleges(page)}
                />
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={detailModal.open}
                onClose={() => setDetailModal({ open: false, college: null })}
                title="College Details"
                size="md"
            >
                {detailModal.college && (
                    <div className="detail-modal">
                        <div className="detail-header">
                            <div className="detail-icon">
                                <Building2 size={32} />
                            </div>
                            <div>
                                <h3>{detailModal.college.name}</h3>
                                <span className="detail-code">{detailModal.college.code}</span>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="label">Location</span>
                                <span className="value">
                                    {detailModal.college.address?.city}, {detailModal.college.address?.state}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Email</span>
                                <span className="value">{detailModal.college.contactEmail}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Phone</span>
                                <span className="value">{detailModal.college.phone || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Website</span>
                                <span className="value">{detailModal.college.website || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Total Students</span>
                                <span className="value">{detailModal.college.stats?.totalStudents || 0}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Placed Students</span>
                                <span className="value">{detailModal.college.stats?.placedStudents || 0}</span>
                            </div>
                        </div>

                        {detailModal.college.departments?.length > 0 && (
                            <div className="detail-section">
                                <span className="label">Departments</span>
                                <div className="tags-list">
                                    {detailModal.college.departments.map((d, i) => (
                                        <span key={i} className="tag">{d}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!detailModal.college.isVerified && (
                            <div className="modal-actions">
                                <Button
                                    variant="danger"
                                    onClick={() => { handleApprove(detailModal.college._id, false); setDetailModal({ open: false, college: null }); }}
                                >
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => { handleApprove(detailModal.college._id, true); setDetailModal({ open: false, college: null }); }}
                                >
                                    Approve College
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, college: null })}
                title="Edit College"
                size="lg"
            >
                <form onSubmit={handleEditSubmit} className="form">
                    <div className="form-grid">
                        <Input
                            label="College Name"
                            required
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                        <Input
                            label="College Code"
                            required
                            value={editForm.code || ''}
                            onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                        />
                        <Input
                            label="University"
                            value={editForm.university || ''}
                            onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                        />
                        <Input
                            label="City"
                            required
                            value={editForm.city || ''}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        />
                        <Input
                            label="State"
                            required
                            value={editForm.state || ''}
                            onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        />
                        <Input
                            label="Pincode"
                            value={editForm.pincode || ''}
                            onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                        />
                        <Input
                            label="Contact Email"
                            type="email"
                            required
                            value={editForm.contactEmail || ''}
                            onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                        />
                        <Input
                            label="Phone"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                        <Input
                            label="Website"
                            value={editForm.website || ''}
                            onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        />
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={() => setEditModal({ open: false, college: null })}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Update College
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Colleges;
