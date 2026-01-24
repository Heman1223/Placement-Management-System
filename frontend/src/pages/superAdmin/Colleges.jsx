import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
    CheckCircle, XCircle, Eye, Building2, Plus,
    Edit2, Power, Trash2, RotateCcw, MoreVertical,
    Search, Filter, MapPin, Mail, Globe, Users,
    ArrowUpRight, Clock, ShieldCheck, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';

const Colleges = () => {
    const navigate = useNavigate();
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [detailModal, setDetailModal] = useState({ open: false, college: null });
    const [editModal, setEditModal] = useState({ open: false, college: null });
    const [editForm, setEditForm] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
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

    const fetchColleges = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                status: filter || undefined,
                search: searchQuery || undefined
            };
            const response = await superAdminAPI.getColleges(params);
            setColleges(response.data.data.colleges);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load colleges');
        } finally {
            setLoading(false);
        }
    };


    const handleApprove = async (id, approved, collegeName) => {
        try {
            await superAdminAPI.approveCollege(id, approved);
            if (approved) {
                toast.success(`${collegeName} - Approved`);
            } else {
                toast.error(`${collegeName} - Rejected`, {
                    icon: '❌',
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #ef4444'
                    }
                });
            }
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
            <div className="page-header colleges-header">
                <div className="header-title-area">
                    <motion.h1 variants={itemVariants}>Colleges</motion.h1>
                    <motion.p className="subtitle" variants={itemVariants}>
                        Super Admin Portal
                    </motion.p>
                </div>
                <div className="header-controls">
                    <Link to="/admin/colleges/new">
                        <Button icon={Plus} variant="primary" className="add-college-btn-header">
                            Add New College
                        </Button>
                    </Link>
                </div>
            </div>



            {/* Stats Overview */}
            <div className="admin-stats-overview colleges-stats">
                <motion.div className="mini-stat-card card-dark" variants={itemVariants}>
                    <div className="mini-stat-icon-bg blue">
                        <Building2 size={20} />
                    </div>
                    <div className="mini-stat-info">
                        <span className="value">{pagination.total}</span>
                        <span className="label">Total Institutions</span>
                    </div>
                </motion.div>
                <motion.div className="mini-stat-card card-dark" variants={itemVariants}>
                    <div className="mini-stat-icon-bg yellow">
                        <Clock size={20} />
                    </div>
                    <div className="mini-stat-info">
                        <span className="value">
                            {colleges.filter(c => !c.isVerified).length}
                        </span>
                        <span className="label">Pending Review</span>
                    </div>
                </motion.div>
            </div>

            {/* Search and Filter Pills */}
            <div className="search-filter-section">
                <div className="search-bar-modern">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search colleges by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="pill-filters">
                    <button
                        className={`pill-btn ${filter === '' ? 'active' : ''}`}
                        onClick={() => setFilter('')}
                    >
                        All Status
                    </button>
                    <button
                        className={`pill-btn ${filter === 'verified' ? 'active' : ''}`}
                        onClick={() => setFilter('verified')}
                    >
                        Verified
                    </button>
                    <button
                        className={`pill-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                        {colleges.filter(c => !c.isVerified && !c.isRejected).length > 0 && (
                            <span className="badge">{colleges.filter(c => !c.isVerified && !c.isRejected).length}</span>
                        )}
                    </button>
                    <button
                        className={`pill-btn ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                        {colleges.filter(c => c.isRejected).length > 0 && (
                            <span className="badge">{colleges.filter(c => c.isRejected).length}</span>
                        )}
                    </button>
                </div>
            </div>

            <div className="section-title-row">
                <h2>Institutions</h2>
                <button className="view-map-link">View Map</button>
            </div>

            {/* Redesigned College Cards */}
            <div className="colleges-cards-grid">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="loader-full">
                            <div className="spinner"></div>
                            <span>Scanning institutions...</span>
                        </div>
                    ) : colleges.length === 0 ? (
                        <div className="empty-cards-state">
                            <Building2 size={48} />
                            <p>No institutions found in registry</p>
                        </div>
                    ) : (
                        colleges.map((college) => (
                            <motion.div
                                key={college._id}
                                className="college-modern-card"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                layout
                                onClick={() => navigate(`/admin/colleges/${college._id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-top">
                                    <div className="college-avatar">
                                        {college.name.toLowerCase().includes('university') ? <Building2 size={22} /> : <Eye size={22} />}
                                    </div>
                                    <div className="college-main-info">
                                        <h3>{college.name}</h3>
                                        <div className="code-row">
                                            <span>Code: {college.code}</span>
                                        </div>
                                        <div className={`status-pill ${college.isVerified ? 'verified' : college.isRejected ? 'rejected' : 'pending'}`}>
                                            {college.isVerified ? <CheckCircle size={14} /> : college.isRejected ? <XCircle size={14} /> : <Clock size={14} />}
                                            <span>{college.isVerified ? 'VERIFIED' : college.isRejected ? 'REJECTED' : 'PENDING REVIEW'}</span>
                                        </div>
                                    </div>
                                    <div className="action-dropdown-wrapper" style={{ position: 'relative' }}>
                                        <button
                                            className="more-options-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdown(openDropdown === college._id ? null : college._id);
                                            }}
                                            title="More options"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {/* Inline Dropdown for Actions */}
                                        <AnimatePresence>
                                            {openDropdown === college._id && (
                                                <motion.div
                                                    className="inline-dropdown"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/admin/colleges/${college._id}`);
                                                            setOpenDropdown(null);
                                                        }}
                                                        title="View college profile"
                                                    >
                                                        <Eye size={16} /> View Profile
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(college);
                                                            setOpenDropdown(null);
                                                        }}
                                                        title="Edit college information"
                                                    >
                                                        <Edit2 size={16} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(college._id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="danger"
                                                        title="Delete college"
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
                                        <span className="stat-header">LOCATION</span>
                                        <div className="stat-detail">
                                            <MapPin size={14} />
                                            <span>{college.address?.city}, {college.address?.state?.substring(0, 2).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="card-stat">
                                        <span className="stat-header">STUDENTS</span>
                                        <div className="stat-detail">
                                            <Users size={14} />
                                            <span>{college.stats?.totalStudents || 0} Enrolled</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-divider" />

                                {/* Approve/Reject Buttons for Pending Colleges */}
                                {!college.isVerified && !college.isRejected && (
                                    <div className="card-action-buttons" style={{ padding: '1rem', display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApprove(college._id, true, college.name);
                                            }}
                                            className="approve-btn"
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(16, 185, 129, 0.15)',
                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                borderRadius: '0.75rem',
                                                color: '#34d399',
                                                fontWeight: 700,
                                                fontSize: '0.8125rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Approve this college"
                                        >
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApprove(college._id, false, college.name);
                                            }}
                                            className="reject-btn"
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(239, 68, 68, 0.15)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '0.75rem',
                                                color: '#f87171',
                                                fontWeight: 700,
                                                fontSize: '0.8125rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Reject this college"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </div>
                                )}

                                <div className="card-footer">
                                    <div className="footer-email">
                                        <Mail size={14} />
                                        <span>{college.contactEmail}</span>
                                    </div>
                                    <button
                                        className="details-link-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin/colleges/${college._id}`);
                                        }}
                                        title="View full details"
                                    >
                                        Details
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
                        onClick={() => fetchColleges(pagination.current - 1)}
                    >
                        <ArrowUpRight size={18} style={{ transform: 'rotate(-135deg)' }} />
                    </button>
                    <span>{pagination.current} / {pagination.pages}</span>
                    <button
                        disabled={pagination.current === pagination.pages}
                        onClick={() => fetchColleges(pagination.current + 1)}
                    >
                        <ArrowUpRight size={18} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            <Modal
                isOpen={detailModal.open}
                onClose={() => setDetailModal({ open: false, college: null })}
                title="Institution Profile"
                size="md"
            >
                {detailModal.college && (
                    <div className="detail-modal redesigned">
                        <div className="detail-header">
                            <div className="detail-icon">
                                <Building2 size={32} />
                            </div>
                            <div className="detail-title-block">
                                <h3>{detailModal.college.name}</h3>
                                <span className="detail-code">ID: {detailModal.college.code}</span>
                            </div>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="label">Location</span>
                                <span className="value">
                                    {detailModal.college.address?.city}, {detailModal.college.address?.state}
                                    <span className="sub-value">{detailModal.college.address?.pincode}</span>
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Contact Info</span>
                                <span className="value">{detailModal.college.contactEmail}</span>
                                <span className="sub-value">{detailModal.college.phone || 'No phone provided'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">University</span>
                                <span className="value">{detailModal.college.university || 'Not specified'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Total Students</span>
                                <span className="value">{detailModal.college.stats?.totalStudents || 0}</span>
                                <span className="sub-value">Placed: {detailModal.college.stats?.placedStudents || 0}</span>
                            </div>
                        </div>

                        {detailModal.college.departments?.length > 0 && (
                            <div className="detail-section">
                                <span className="label">Faculties & Departments</span>
                                <div className="modern-tags">
                                    {detailModal.college.departments.map((d, i) => (
                                        <span key={i} className="modern-tag">{d}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="modal-actions-footer">
                            {!detailModal.college.isVerified ? (
                                <>
                                    <Button
                                        variant="danger"
                                        onClick={() => { handleApprove(detailModal.college._id, false, detailModal.college.name); setDetailModal({ open: false, college: null }); }}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => { handleApprove(detailModal.college._id, true, detailModal.college.name); setDetailModal({ open: false, college: null }); }}
                                    >
                                        Verify Institution
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" onClick={() => setDetailModal({ open: false, college: null })}>
                                    Close Profile
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, college: null })}
                title="Update Institution Information"
                size="lg"
            >
                <form onSubmit={handleEditSubmit} className="admin-modern-form">
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
                            label="Affiliated University"
                            value={editForm.university || ''}
                            onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                        />
                        <div className="form-row">
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
                        </div>
                        <Input
                            label="Admin Contact Email"
                            type="email"
                            required
                            value={editForm.contactEmail || ''}
                            onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                        />
                        <div className="form-row">
                            <Input
                                label="Phone Number"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                            <Input
                                label="Website URL"
                                value={editForm.website || ''}
                                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="modal-actions-footer">
                        <Button type="button" variant="outline" onClick={() => setEditModal({ open: false, college: null })}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
};

export default Colleges;
