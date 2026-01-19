import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { CheckCircle, XCircle, Eye, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [detailModal, setDetailModal] = useState({ open: false, company: null });

    useEffect(() => {
        fetchCompanies();
    }, [filter]);

    const fetchCompanies = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, approved: filter || undefined };
            const response = await superAdminAPI.getCompanies(params);
            setCompanies(response.data.data.companies);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, approved) => {
        try {
            await superAdminAPI.approveCompany(id, approved);
            toast.success(approved ? 'Company approved' : 'Company rejected');
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const columns = [
        {
            header: 'Company',
            accessor: 'name',
            render: (name, row) => (
                <div className="entity-cell">
                    <div className="entity-icon company">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <span className="entity-name">{name}</span>
                        <span className="entity-meta">{row.type?.replace('_', ' ')}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Industry',
            accessor: 'industry',
            render: (val) => val || '-'
        },
        {
            header: 'Contact',
            accessor: 'contactPerson',
            render: (val) => val?.name || '-'
        },
        {
            header: 'Jobs Posted',
            accessor: 'stats',
            render: (stats) => stats?.totalJobsPosted || 0
        },
        {
            header: 'Status',
            accessor: 'isApproved',
            render: (val) => (
                <span className={`status-badge ${val ? 'status-success' : 'status-pending'}`}>
                    {val ? 'Approved' : 'Pending'}
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
                        onClick={() => setDetailModal({ open: true, company: row })}
                    >
                        <Eye size={16} />
                    </button>
                    {!row.isApproved && (
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
                    <h1>Companies</h1>
                    <p>Manage registered companies and agencies</p>
                </div>
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
                    Approved
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
                    data={companies}
                    loading={loading}
                    emptyMessage="No companies registered yet"
                />
                <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    onPageChange={(page) => fetchCompanies(page)}
                />
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={detailModal.open}
                onClose={() => setDetailModal({ open: false, company: null })}
                title="Company Details"
                size="md"
            >
                {detailModal.company && (
                    <div className="detail-modal">
                        <div className="detail-header">
                            <div className="detail-icon company">
                                <Briefcase size={32} />
                            </div>
                            <div>
                                <h3>{detailModal.company.name}</h3>
                                <span className="detail-code">{detailModal.company.type?.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="label">Industry</span>
                                <span className="value">{detailModal.company.industry || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Headquarters</span>
                                <span className="value">
                                    {detailModal.company.headquarters?.city}, {detailModal.company.headquarters?.country || 'India'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Contact Person</span>
                                <span className="value">{detailModal.company.contactPerson?.name || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Email</span>
                                <span className="value">{detailModal.company.contactPerson?.email || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Phone</span>
                                <span className="value">{detailModal.company.contactPerson?.phone || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Website</span>
                                <span className="value">{detailModal.company.website || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Jobs Posted</span>
                                <span className="value">{detailModal.company.stats?.totalJobsPosted || 0}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Total Hires</span>
                                <span className="value">{detailModal.company.stats?.totalHires || 0}</span>
                            </div>
                        </div>

                        {detailModal.company.description && (
                            <div className="detail-section">
                                <span className="label">Description</span>
                                <p className="detail-description">{detailModal.company.description}</p>
                            </div>
                        )}

                        {!detailModal.company.isApproved && (
                            <div className="modal-actions">
                                <Button
                                    variant="danger"
                                    onClick={() => { handleApprove(detailModal.company._id, false); setDetailModal({ open: false, company: null }); }}
                                >
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => { handleApprove(detailModal.company._id, true); setDetailModal({ open: false, company: null }); }}
                                >
                                    Approve Company
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Companies;
