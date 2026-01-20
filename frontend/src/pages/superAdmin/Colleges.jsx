import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { CheckCircle, XCircle, Eye, Building2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Colleges = () => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [detailModal, setDetailModal] = useState({ open: false, college: null });

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
            render: (val) => (
                <span className={`status-badge ${val ? 'status-success' : 'status-pending'}`}>
                    {val ? 'Verified' : 'Pending'}
                </span>
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
                    >
                        <Eye size={16} />
                    </button>
                    {!row.isVerified && (
                        <>
                            <button
                                className="action-btn action-btn-success"
                                onClick={() => handleApprove(id, true)}
                            >
                                <CheckCircle size={16} />
                            </button>
                            <button
                                className="action-btn action-btn-danger"
                                onClick={() => handleApprove(id, false)}
                            >
                                <XCircle size={16} />
                            </button>
                        </>
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
        </div>
    );
};

export default Colleges;
