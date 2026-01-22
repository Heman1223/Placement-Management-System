import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { CheckCircle, XCircle, Eye, Briefcase, Plus, Edit2, Power, Ban, Trash2, RotateCcw, Building2, Calendar, Download, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [detailModal, setDetailModal] = useState({ open: false, company: null });
    const [agencyModal, setAgencyModal] = useState({ open: false, company: null });
    const [suspendModal, setSuspendModal] = useState({ open: false, company: null });
    const [suspendForm, setSuspendForm] = useState({ reason: '', endDate: '' });
    const [accessModal, setAccessModal] = useState({ open: false, company: null });
    const [accessForm, setAccessForm] = useState({ selectedColleges: [], expiryDate: '', downloadLimit: 100 });
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchCompanies();
        fetchColleges();
    }, [filter]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-dropdown-wrapper')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const fetchColleges = async () => {
        try {
            const response = await superAdminAPI.getColleges({ limit: 100 });
            setColleges(response.data.data.colleges);
        } catch (error) {
            console.error('Failed to load colleges');
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

    const handleToggleActive = async (id, currentStatus) => {
        const action = currentStatus ? 'block' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this company?`)) return;

        try {
            await superAdminAPI.toggleCompanyStatus(id);
            toast.success(`Company ${action}ed successfully`);
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error(`Failed to ${action} company`);
        }
    };

    const openSuspendModal = (company) => {
        setSuspendForm({ reason: '', endDate: '' });
        setSuspendModal({ open: true, company });
    };

    const handleSuspend = async (e) => {
        e.preventDefault();
        try {
            await superAdminAPI.toggleCompanySuspension(
                suspendModal.company._id,
                suspendForm.reason,
                suspendForm.endDate
            );
            toast.success(`Company ${suspendModal.company.isSuspended ? 'unsuspended' : 'suspended'} successfully`);
            setSuspendModal({ open: false, company: null });
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Failed to suspend company');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this company?')) return;

        try {
            await superAdminAPI.deleteCompany(id);
            toast.success('Company deleted successfully');
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Failed to delete company');
        }
    };

    const handleRestore = async (id) => {
        try {
            await superAdminAPI.restoreCompany(id);
            toast.success('Company restored successfully');
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Failed to restore company');
        }
    };

    const openAgencyAccessModal = async (company) => {
        try {
            const response = await superAdminAPI.getAgencyDetails(company._id);
            const agencyData = response.data.data;
            
            setAccessForm({
                selectedColleges: agencyData.agencyAccess?.allowedColleges?.map(ac => ac.college._id) || [],
                expiryDate: agencyData.agencyAccess?.accessExpiryDate ? 
                    new Date(agencyData.agencyAccess.accessExpiryDate).toISOString().split('T')[0] : '',
                downloadLimit: agencyData.agencyAccess?.downloadLimit || 100
            });
            setAgencyModal({ open: true, company: agencyData });
        } catch (error) {
            toast.error('Failed to load agency details');
        }
    };

    const handleSaveAgencyAccess = async (e) => {
        e.preventDefault();
        try {
            // Assign colleges
            await superAdminAPI.assignCollegesToAgency(agencyModal.company._id, accessForm.selectedColleges);
            
            // Set expiry date
            if (accessForm.expiryDate) {
                await superAdminAPI.setAgencyAccessExpiry(agencyModal.company._id, accessForm.expiryDate);
            }
            
            // Set download limit
            await superAdminAPI.setAgencyDownloadLimit(agencyModal.company._id, accessForm.downloadLimit);
            
            toast.success('Agency access updated successfully');
            setAgencyModal({ open: false, company: null });
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Failed to update agency access');
        }
    };

    const handleRemoveCollege = async (collegeId) => {
        try {
            await superAdminAPI.removeCollegeFromAgency(agencyModal.company._id, collegeId);
            toast.success('College access removed');
            openAgencyAccessModal(agencyModal.company);
        } catch (error) {
            toast.error('Failed to remove college access');
        }
    };

    const columns = [
        {
            header: 'Company',
            accessor: 'name',
            render: (name, row) => (
                <Link to={`/admin/companies/${row._id}`} className="entity-cell-link">
                    <div className="entity-cell">
                        <div className="entity-icon company">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <span className="entity-name">{name}</span>
                            <span className="entity-meta">{row.type?.replace('_', ' ')}</span>
                        </div>
                    </div>
                </Link>
            )
        },
        {
            header: 'Industry',
            accessor: 'industry'
        },
        {
            header: 'Status',
            accessor: 'isApproved',
            render: (val, row) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`status-badge ${val ? 'status-success' : 'status-pending'}`}>
                        {val ? 'Approved' : 'Pending'}
                    </span>
                    {row.isDeleted && (
                        <span className="status-badge status-error">Deleted</span>
                    )}
                    {!row.isDeleted && row.isSuspended && (
                        <span className="status-badge status-warning">Suspended</span>
                    )}
                    {!row.isDeleted && !row.isSuspended && !row.isActive && (
                        <span className="status-badge status-error">Blocked</span>
                    )}
                </div>
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
                                    setDetailModal({ open: true, company: row });
                                    setOpenDropdown(null);
                                }}
                            >
                                <Eye size={16} />
                                <span>View Details</span>
                            </button>
                            {!row.isDeleted && (
                                <>
                                    {!row.isApproved && (
                                        <>
                                            <button
                                                className="action-dropdown-item success"
                                                onClick={() => {
                                                    handleApprove(id, true);
                                                    setOpenDropdown(null);
                                                }}
                                            >
                                                <CheckCircle size={16} />
                                                <span>Approve</span>
                                            </button>
                                            <button
                                                className="action-dropdown-item danger"
                                                onClick={() => {
                                                    handleApprove(id, false);
                                                    setOpenDropdown(null);
                                                }}
                                            >
                                                <XCircle size={16} />
                                                <span>Reject</span>
                                            </button>
                                        </>
                                    )}
                                    {row.isApproved && (
                                        <>
                                            {row.type === 'placement_agency' && (
                                                <button
                                                    className="action-dropdown-item"
                                                    onClick={() => {
                                                        openAgencyAccessModal(row);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    <Building2 size={16} />
                                                    <span>Manage Access</span>
                                                </button>
                                            )}
                                            <button
                                                className={`action-dropdown-item ${row.isActive ? 'warning' : 'success'}`}
                                                onClick={() => {
                                                    handleToggleActive(id, row.isActive);
                                                    setOpenDropdown(null);
                                                }}
                                            >
                                                <Power size={16} />
                                                <span>{row.isActive ? 'Block' : 'Activate'}</span>
                                            </button>
                                            <button
                                                className="action-dropdown-item warning"
                                                onClick={() => {
                                                    openSuspendModal(row);
                                                    setOpenDropdown(null);
                                                }}
                                            >
                                                <Ban size={16} />
                                                <span>{row.isSuspended ? 'Unsuspend' : 'Suspend'}</span>
                                            </button>
                                            <button
                                                className="action-dropdown-item danger"
                                                onClick={() => {
                                                    handleDelete(id);
                                                    setOpenDropdown(null);
                                                }}
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete</span>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                            {row.isDeleted && (
                                <button
                                    className="action-dropdown-item success"
                                    onClick={() => {
                                        handleRestore(id);
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <RotateCcw size={16} />
                                    <span>Restore</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Companies & Agencies</h1>
                    <p>Manage companies and placement agencies</p>
                </div>
                <Button icon={Plus} onClick={() => window.location.href = '/admin/companies/new'}>
                    Add Company
                </Button>
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
                            <div className="detail-icon">
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
                                <span className="value">{detailModal.company.industry}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Contact Person</span>
                                <span className="value">{detailModal.company.contactPerson?.name}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Email</span>
                                <span className="value">{detailModal.company.contactPerson?.email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Phone</span>
                                <span className="value">{detailModal.company.contactPerson?.phone}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Website</span>
                                <span className="value">{detailModal.company.website || '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Size</span>
                                <span className="value">{detailModal.company.size || '-'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Suspend Modal */}
            <Modal
                isOpen={suspendModal.open}
                onClose={() => setSuspendModal({ open: false, company: null })}
                title={suspendModal.company?.isSuspended ? "Unsuspend Company" : "Suspend Company"}
                size="sm"
            >
                {suspendModal.company && !suspendModal.company.isSuspended && (
                    <form onSubmit={handleSuspend} className="form">
                        <Input
                            label="Reason for Suspension"
                            required
                            value={suspendForm.reason}
                            onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                        />
                        <Input
                            label="Suspension End Date (Optional)"
                            type="date"
                            value={suspendForm.endDate}
                            onChange={(e) => setSuspendForm({ ...suspendForm, endDate: e.target.value })}
                        />
                        <div className="modal-actions">
                            <Button type="button" variant="outline" onClick={() => setSuspendModal({ open: false, company: null })}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="danger">
                                Suspend Company
                            </Button>
                        </div>
                    </form>
                )}
                {suspendModal.company?.isSuspended && (
                    <div className="form">
                        <p>Are you sure you want to unsuspend this company?</p>
                        <div className="modal-actions">
                            <Button variant="outline" onClick={() => setSuspendModal({ open: false, company: null })}>
                                Cancel
                            </Button>
                            <Button onClick={handleSuspend}>
                                Unsuspend Company
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Agency Access Control Modal */}
            <Modal
                isOpen={agencyModal.open}
                onClose={() => setAgencyModal({ open: false, company: null })}
                title="Agency Access Control"
                size="lg"
            >
                {agencyModal.company && (
                    <form onSubmit={handleSaveAgencyAccess} className="form">
                        <h4>{agencyModal.company.name}</h4>
                        
                        {/* Assigned Colleges */}
                        <div className="form-section">
                            <label className="input-label">Assigned Colleges</label>
                            {agencyModal.company.agencyAccess?.allowedColleges?.length > 0 ? (
                                <div className="tags-list">
                                    {agencyModal.company.agencyAccess.allowedColleges.map((ac) => (
                                        <span key={ac.college._id} className="tag">
                                            {ac.college.name}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCollege(ac.college._id)}
                                                style={{ marginLeft: '8px', cursor: 'pointer' }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No colleges assigned yet</p>
                            )}
                        </div>

                        {/* Add Colleges */}
                        <div className="form-section">
                            <label className="input-label">Add Colleges</label>
                            <select
                                multiple
                                className="input"
                                value={accessForm.selectedColleges}
                                onChange={(e) => setAccessForm({
                                    ...accessForm,
                                    selectedColleges: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                                style={{ minHeight: '120px' }}
                            >
                                {colleges.map((college) => (
                                    <option key={college._id} value={college._id}>
                                        {college.name} ({college.code})
                                    </option>
                                ))}
                            </select>
                            <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
                        </div>

                        {/* Access Expiry */}
                        <Input
                            label="Access Expiry Date"
                            type="date"
                            value={accessForm.expiryDate}
                            onChange={(e) => setAccessForm({ ...accessForm, expiryDate: e.target.value })}
                            icon={Calendar}
                        />

                        {/* Download Limit */}
                        <Input
                            label="Download Limit"
                            type="number"
                            min="0"
                            value={accessForm.downloadLimit}
                            onChange={(e) => setAccessForm({ ...accessForm, downloadLimit: e.target.value })}
                            icon={Download}
                        />
                        <small className="text-muted">
                            Current: {agencyModal.company.agencyAccess?.downloadCount || 0} / {agencyModal.company.agencyAccess?.downloadLimit || 0}
                        </small>

                        <div className="modal-actions">
                            <Button type="button" variant="outline" onClick={() => setAgencyModal({ open: false, company: null })}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save Access Settings
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Companies;
