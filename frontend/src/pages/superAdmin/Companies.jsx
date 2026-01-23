import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { 
    CheckCircle, XCircle, Eye, Briefcase, Plus, 
    Edit2, Power, Ban, Trash2, RotateCcw, Building2, 
    Calendar, Download, MoreVertical, Search, Globe,
    Users, ShieldCheck, Clock, ShieldAlert, Bell, Mail, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Companies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [detailModal, setDetailModal] = useState({ open: false, company: null });
    const [agencyModal, setAgencyModal] = useState({ open: false, company: null });
    const [suspendModal, setSuspendModal] = useState({ open: false, company: null });
    const [suspendForm, setSuspendForm] = useState({ reason: '', endDate: '' });
    const [accessForm, setAccessForm] = useState({ selectedColleges: [], expiryDate: '', downloadLimit: 100 });
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchCompanies();
        fetchColleges();
    }, [filter, searchQuery]);

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
            const params = { 
                page, 
                status: filter || undefined,
                search: searchQuery || undefined
            };
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

    const handleApprove = async (id, approved, companyName) => {
        try {
            await superAdminAPI.approveCompany(id, approved);
            if (approved) {
                toast.success(`${companyName} - Approved`);
            } else {
                toast.error(`${companyName} - Rejected`, {
                    icon: '❌',
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #ef4444'
                    }
                });
            }
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
            await superAdminAPI.assignCollegesToAgency(agencyModal.company._id, accessForm.selectedColleges);
            if (accessForm.expiryDate) {
                await superAdminAPI.setAgencyAccessExpiry(agencyModal.company._id, accessForm.expiryDate);
            }
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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div 
            className="admin-page"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="page-header companies-header">
                <div className="header-title-area">
                    <motion.h1 variants={itemVariants}>Partnerships</motion.h1>
                    <motion.p className="subtitle" variants={itemVariants}>
                        Super Admin Portal
                    </motion.p>
                </div>
                <div className="header-controls">
                    <Link to="/admin/companies/new">
                        <Button icon={Plus} variant="primary" className="add-college-btn-header">
                            Register New Entity
                        </Button>
                    </Link>
                </div>
            </div>



            {/* Stats Overview */}
            <div className="admin-stats-overview colleges-stats">
                <motion.div className="mini-stat-card card-dark" variants={itemVariants}>
                    <div className="mini-stat-icon-bg indigo">
                        <Briefcase size={20} />
                    </div>
                    <div className="mini-stat-info">
                        <span className="value">{pagination.total}</span>
                        <span className="label">Total Partners</span>
                    </div>
                </motion.div>
                <motion.div className="mini-stat-card card-dark" variants={itemVariants}>
                    <div className="mini-stat-icon-bg green">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="mini-stat-info">
                        <span className="value">
                            {companies.filter(c => c.isApproved).length}
                        </span>
                        <span className="label">Verified Status</span>
                    </div>
                </motion.div>
            </div>

            {/* Search and Filters */}
            <div className="search-filter-section">
                <div className="search-bar-modern">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search by company name or industry..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="pill-filters">
                    <button
                        className={`pill-btn ${filter === '' ? 'active' : ''}`}
                        onClick={() => setFilter('')}
                    >
                        All Entities
                    </button>
                    <button
                        className={`pill-btn ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`pill-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                        {companies.filter(c => !c.isApproved && !c.isRejected).length > 0 && (
                            <span className="badge">{companies.filter(c => !c.isApproved && !c.isRejected).length}</span>
                        )}
                    </button>
                    <button
                        className={`pill-btn ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                        {companies.filter(c => c.isRejected).length > 0 && (
                            <span className="badge">{companies.filter(c => c.isRejected).length}</span>
                        )}
                    </button>
                </div>
            </div>

            <div className="section-title-row">
                <h2>Active Partnerships</h2>
                <button className="view-map-link">Industry Map</button>
            </div>

            {/* Redesigned Company Cards */}
            <div className="colleges-cards-grid">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="loader-full">
                            <div className="spinner"></div>
                            <span>Scanning corporate network...</span>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="empty-cards-state">
                            <Briefcase size={48} />
                            <p>No corporate entities found</p>
                        </div>
                    ) : (
                        companies.map((company) => (
                            <motion.div 
                                key={company._id}
                                className="college-modern-card"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                layout
                            >
                                <div className="card-top">
                                    <div className="college-avatar company">
                                        <Briefcase size={22} />
                                    </div>
                                    <div className="college-main-info">
                                        <h3>{company.name}</h3>
                                        <div className="code-row">
                                            <span>{company.type?.replace('_', ' ').toUpperCase()}</span>
                                        </div>
                                        <div className={`status-pill ${company.isApproved ? 'verified' : company.isRejected ? 'rejected' : 'pending'}`}>
                                            {company.isApproved ? <CheckCircle size={14} /> : company.isRejected ? <XCircle size={14} /> : <Clock size={14} />}
                                            <span>{company.isApproved ? 'APPROVED' : company.isRejected ? 'REJECTED' : 'PENDING REVIEW'}</span>
                                        </div>
                                    </div>
                                    <div className="action-dropdown-wrapper" style={{ position: 'relative' }}>
                                        <button 
                                            className="more-options-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(openDropdown === company._id ? null : company._id);
                                            }}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
    
                                        {/* Inline Actions */}
                                        <AnimatePresence>
                                            {openDropdown === company._id && (
                                                <motion.div 
                                                    className="inline-dropdown"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                >
                                                    {!company.isApproved && (
                                                        <>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprove(company._id, true, company.name);
                                                                    setOpenDropdown(null);
                                                                }}
                                                                className="success"
                                                            >
                                                                <CheckCircle size={16} /> Approve
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprove(company._id, false, company.name);
                                                                    setOpenDropdown(null);
                                                                }}
                                                                className="danger"
                                                            >
                                                                <XCircle size={16} /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {company.isApproved && company.type === 'placement_agency' && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openAgencyAccessModal(company);
                                                                setOpenDropdown(null);
                                                            }}
                                                        >
                                                            <Building2 size={16} /> Access
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openSuspendModal(company);
                                                            setOpenDropdown(null);
                                                        }}
                                                    >
                                                        <Ban size={16} /> Suspend
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(company._id);
                                                            setOpenDropdown(null);
                                                        }} 
                                                        className="danger"
                                                    >
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="card-divider" />

                                <div className="card-stats-row">
                                    <div className="card-stat">
                                        <span className="stat-header">INDUSTRY</span>
                                        <div className="stat-detail">
                                            <Globe size={14} />
                                            <span>{company.industry || 'General'}</span>
                                        </div>
                                    </div>
                                    <div className="card-stat">
                                        <span className="stat-header">AUTHORITY</span>
                                        <div className="stat-detail">
                                            <Users size={14} />
                                            <span>{company.contactPerson?.name || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-divider" />

                                <div className="card-footer">
                                    <div className="footer-email">
                                        <Mail size={14} />
                                        <span>{company.contactPerson?.email || 'No email registered'}</span>
                                    </div>
                                    <button 
                                        className="details-link-btn"
                                        onClick={() => navigate(`/admin/companies/${company._id}`)}
                                    >
                                        Profile
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {pagination.pages > 1 && (
                <div className="modern-pagination">
                    <button 
                        disabled={pagination.current === 1}
                        onClick={() => fetchCompanies(pagination.current - 1)}
                    >
                        <ArrowUpRight size={18} style={{ transform: 'rotate(-135deg)' }} />
                    </button>
                    <span>{pagination.current} / {pagination.pages}</span>
                    <button 
                        disabled={pagination.current === pagination.pages}
                        onClick={() => fetchCompanies(pagination.current + 1)}
                    >
                        <ArrowUpRight size={18} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            <Modal
                isOpen={detailModal.open}
                onClose={() => setDetailModal({ open: false, company: null })}
                title="Corporate Profile"
                size="md"
            >
                {detailModal.company && (
                    <div className="detail-modal redesigned">
                        <div className="detail-header">
                            <div className="detail-icon">
                                <Briefcase size={32} />
                            </div>
                            <div className="detail-title-block">
                                <h3>{detailModal.company.name}</h3>
                                <span className="detail-code">{detailModal.company.type?.replace('_', ' ')}</span>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="label">Industry Sector</span>
                                <span className="value">{detailModal.company.industry || 'Not Specified'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Contact Authority</span>
                                <span className="value">{detailModal.company.contactPerson?.name}</span>
                                <span className="sub-value">{detailModal.company.contactPerson?.email}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Contact Number</span>
                                <span className="value">{detailModal.company.contactPerson?.phone || 'No phone provided'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Organizational Profile</span>
                                <span className="value">Size: {detailModal.company.size || 'N/A'}</span>
                                {detailModal.company.website && (
                                    <a href={detailModal.company.website} target="_blank" rel="noreferrer" className="sub-value text-blue-500">
                                        View Website <ArrowUpRight size={12} />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions-footer">
                            <Button variant="outline" onClick={() => setDetailModal({ open: false, company: null })}>
                                Close Profile
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Suspend Modal */}
            <Modal
                isOpen={suspendModal.open}
                onClose={() => setSuspendModal({ open: false, company: null })}
                title={suspendModal.company?.isSuspended ? "Unsuspend Organization" : "Suspend Organization"}
                size="sm"
            >
                {suspendModal.company && !suspendModal.company.isSuspended && (
                    <form onSubmit={handleSuspend} className="admin-modern-form">
                        <div className="warning-banner">
                            <ShieldAlert size={20} />
                            <span>Suspension will Revoke all platform access immediately.</span>
                        </div>
                        <Input
                            label="Reason for Action"
                            required
                            placeholder="Identify violation or reason..."
                            value={suspendForm.reason}
                            onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                        />
                        <Input
                            label="Self-Unsuspend Date (Optional)"
                            type="date"
                            value={suspendForm.endDate}
                            onChange={(e) => setSuspendForm({ ...suspendForm, endDate: e.target.value })}
                        />
                        <div className="modal-actions-footer">
                            <Button type="button" variant="outline" onClick={() => setSuspendModal({ open: false, company: null })}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="danger">
                                Suspend Account
                            </Button>
                        </div>
                    </form>
                )}
                {suspendModal.company?.isSuspended && (
                    <div className="admin-modern-form">
                        <p className="text-slate-300 mb-6">Are you sure you want to restore platform access for <strong>{suspendModal.company.name}</strong>?</p>
                        <div className="modal-actions-footer">
                            <Button variant="outline" onClick={() => setSuspendModal({ open: false, company: null })}>
                                Cancel
                            </Button>
                            <Button onClick={handleSuspend} variant="primary">
                                Restore Access
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Agency Access Control Modal */}
            <Modal
                isOpen={agencyModal.open}
                onClose={() => setAgencyModal({ open: false, company: null })}
                title="Partner Access Management"
                size="lg"
            >
                {agencyModal.company && (
                    <form onSubmit={handleSaveAgencyAccess} className="admin-modern-form">
                        <div className="agency-access-header">
                            <Building2 size={24} />
                            <div>
                                <h4>{agencyModal.company.name}</h4>
                                <p className="text-xs text-slate-400">Manage institutional connections and data limits</p>
                            </div>
                        </div>
                        
                        <div className="form-section">
                            <label className="label mb-3 block">Connected Institutions</label>
                            <div className="connected-colleges-list">
                                {agencyModal.company.agencyAccess?.allowedColleges?.map((ac) => (
                                    <div key={ac.college._id} className="connected-item">
                                        <span>{ac.college.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCollege(ac.college._id)}
                                            className="remove-btn"
                                            title="Disconnect Institution"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(!agencyModal.company.agencyAccess?.allowedColleges || agencyModal.company.agencyAccess.allowedColleges.length === 0) && (
                                    <p className="text-sm text-slate-500 italic">No institutions connected yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <label className="label mb-3 block">Connect New Institutions</label>
                            <select
                                multiple
                                className="admin-search-input h-40"
                                value={accessForm.selectedColleges}
                                onChange={(e) => setAccessForm({
                                    ...accessForm,
                                    selectedColleges: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                            >
                                {colleges.map((college) => (
                                    <option key={college._id} value={college._id} className="py-2 px-3">
                                        {college.name} ({college.code})
                                    </option>
                                ))}
                            </select>
                            <small className="text-slate-500 mt-2 block">Hold Ctrl/Cmd to select multiple institutions</small>
                        </div>

                        <div className="form-row">
                            <Input
                                label="Contract Expiry Date"
                                type="date"
                                value={accessForm.expiryDate}
                                onChange={(e) => setAccessForm({ ...accessForm, expiryDate: e.target.value })}
                                icon={Calendar}
                            />
                            <div>
                                <Input
                                    label="Data Download Quota"
                                    type="number"
                                    min="0"
                                    value={accessForm.downloadLimit}
                                    onChange={(e) => setAccessForm({ ...accessForm, downloadLimit: e.target.value })}
                                    icon={Download}
                                />
                                <small className="text-slate-500 block mt-1">
                                    Utilization: {agencyModal.company.agencyAccess?.downloadCount || 0} / {agencyModal.company.agencyAccess?.downloadLimit || 0}
                                </small>
                            </div>
                        </div>

                        <div className="modal-actions-footer">
                            <Button type="button" variant="outline" onClick={() => setAgencyModal({ open: false, company: null })}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Save Permissions
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </motion.div>
    );
};

export default Companies;
