import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import {
    CheckCircle, XCircle, Eye, Building2, Plus,
    Edit2, Power, Trash2, RotateCcw, MoreVertical,
    Search, Filter, MapPin, Mail, Globe, Users,
    ArrowUpRight, Clock, ShieldCheck, Bell, TrendingUp, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const Colleges = () => {
    const navigate = useNavigate();
    const [colleges, setColleges] = useState([]);
    const [allColleges, setAllColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editModal, setEditModal] = useState({ open: false, college: null });
    const [editForm, setEditForm] = useState({});
    const [rejectionModal, setRejectionModal] = useState({ open: false, id: null, name: '' });
    const [rejectionReason, setRejectionReason] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchColleges();
    }, [searchQuery]);

    useEffect(() => {
        applyFilter();
    }, [filter, allColleges]);

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
                search: searchQuery || undefined
            };
            const response = await superAdminAPI.getColleges(params);
            const fetchedColleges = response.data.data.colleges;
            setAllColleges(fetchedColleges);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load colleges');
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        if (!filter) {
            setColleges(allColleges);
        } else {
            setColleges(allColleges.filter(c => {
                if (filter === 'verified') return c.isVerified;
                if (filter === 'pending') return !c.isVerified && !c.isRejected;
                if (filter === 'rejected') return c.isRejected;
                return true;
            }));
        }
    };

    const handleApprove = async (id, approved, collegeName) => {
        if (!approved) {
            setRejectionModal({ open: true, id, name: collegeName });
            setRejectionReason('');
            return;
        }

        try {
            await superAdminAPI.approveCollege(id, true);
            toast.success(`${collegeName} - Approved`);
            fetchColleges(pagination.current);
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            await superAdminAPI.approveCollege(rejectionModal.id, false, rejectionReason);
            toast.error(`${rejectionModal.name} - Rejected`);
            setRejectionModal({ open: false, id: null, name: '' });
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
            header: 'Institutional Entity',
            accessor: 'name',
            render: (name, college) => (
                <div className="entity-cell">
                    <div className="entity-icon">
                        {college.logo ? (
                            <img src={college.logo} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                            <Building2 size={16} />
                        )}
                    </div>
                    <div>
                        <div className="entity-name uppercase">{name}</div>
                        <div className="entity-meta uppercase tracking-wider">{college.code}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Phase',
            accessor: 'isVerified',
            render: (isVerified, college) => {
                if (college.isRejected) return <span className="status-badge status-error">Rejected</span>;
                return (
                    <span className={`status-badge ${isVerified ? 'status-success' : 'status-pending'}`}>
                        {isVerified ? 'Verified' : 'Registry Review'}
                    </span>
                );
            }
        },
        {
            header: 'Location',
            accessor: 'address.city',
            render: (city) => <span className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-wider">{city || 'Multiple'}</span>
        },
        {
            header: 'Global Talent',
            accessor: 'stats.totalStudents',
            render: (val) => (
                <div className="text-[10px] font-black text-[#4a2c15] uppercase tracking-widest">
                    {val || 0} Registered
                </div>
            )
        },
        {
            header: 'Command',
            accessor: '_id',
            render: (_, college) => (
                <div className="flex gap-2 justify-end action-dropdown-wrapper">
                    <button
                        onClick={() => navigate(`/admin/colleges/${college._id}`)}
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        title="View Details"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === college._id ? null : college._id);
                        }}
                    >
                        <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                        {openDropdown === college._id && (
                            <motion.div
                                className="absolute right-0 mt-8 w-48 bg-white rounded-xl shadow-lg border border-[#e6d8c3] z-50 overflow-hidden"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="p-1">
                                    {!college.isVerified && !college.isRejected && (
                                        <>
                                            <button
                                                onClick={() => { handleApprove(college._id, true, college.name); setOpenDropdown(null); }}
                                                className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#1e7d4d] hover:bg-[#e6f4ea] rounded-lg mb-1 flex items-center gap-2"
                                            >
                                                <CheckCircle size={14} /> Authorize Campus
                                            </button>
                                            <button
                                                onClick={() => { handleApprove(college._id, false, college.name); setOpenDropdown(null); }}
                                                className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#b42318] hover:bg-[#fdeaea] rounded-lg mb-1 flex items-center gap-2"
                                            >
                                                <XCircle size={14} /> Decline Request
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => { openEditModal(college); setOpenDropdown(null); }}
                                        className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#6b3f1d] hover:bg-[#faf6ef] rounded-lg mb-1 flex items-center gap-2"
                                    >
                                        <Edit2 size={14} /> Edit Information
                                    </button>
                                    <button
                                        onClick={() => { handleDelete(college._id); setOpenDropdown(null); }}
                                        className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#b42318] hover:bg-[#fdeaea] rounded-lg flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Terminate
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )
        }
    ];

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-1">Academic Nexus</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">Global Institutional Registry</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f5a]" />
                        <input
                            type="text"
                            placeholder="SEARCH CAMPUS..."
                            className="admin-search-input-hardened theme-input pl-10 pr-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all"
                            style={{ backgroundColor: '#ffffff' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Link to="/admin/colleges/new">
                        <Button variant="primary" className="!rounded-lg !bg-[#6b3f1d] admin-action-btn-hardened">
                            <Plus size={18} className="mr-2" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Initialize Node</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="filter-tabs">
                {[
                    { id: '', label: 'Full Registry' },
                    { id: 'verified', label: 'Authorized' },
                    { id: 'pending', label: 'Review Required' },
                    { id: 'rejected', label: 'Restricted' }
                ].map((btn) => (
                    <div
                        key={btn.id}
                        onClick={() => setFilter(btn.id)}
                        className={`filter-tab ${filter === btn.id ? 'active' : ''}`}
                    >
                        {btn.label}
                    </div>
                ))}
            </div>

            <div className="table-container mt-6">
                <Table
                    columns={columns}
                    data={colleges}
                    loading={loading}
                />
            </div>

            {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={pagination.current}
                        pages={pagination.pages}
                        onPageChange={(page) => fetchColleges(page)}
                    />
                </div>
            )}

            <Modal
                isOpen={rejectionModal.open}
                onClose={() => setRejectionModal({ open: false, id: null, name: '' })}
                title="Decline Institutional Application"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest mb-2 block">Reason for Rejection</label>
                        <textarea
                            placeholder="State mission critical reasons for declining this application..."
                            className="admin-form-input-hardened theme-input w-full p-4 text-sm focus:outline-none"
                            style={{ backgroundColor: '#ffffff' }}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 !border-[#e6d8c3]"
                            onClick={() => setRejectionModal({ open: false, id: null, name: '' })}
                        >
                            <span className="text-[11px] font-bold uppercase tracking-wider">Abort</span>
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1 !bg-[#b42318]"
                            onClick={submitRejection}
                        >
                            <span className="text-[11px] font-bold uppercase tracking-wider">Decline Access</span>
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, college: null })}
                title="Update Institutional Metadata"
                size="lg"
            >
                <form onSubmit={handleEditSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">Institution Name</label>
                            <Input
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">Identification Code</label>
                            <Input
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                value={editForm.code || ''}
                                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">University Affiliation</label>
                            <Input
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                value={editForm.university || ''}
                                onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">Administrative Email</label>
                            <Input
                                type="email"
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                value={editForm.contactEmail || ''}
                                onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#faf6ef]">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">City</label>
                            <Input
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                value={editForm.city || ''}
                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">State</label>
                            <Input
                                required
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                value={editForm.state || ''}
                                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">Postal Code</label>
                            <Input
                                className="admin-form-input-hardened theme-input"
                                style={{ backgroundColor: '#ffffff' }}
                                value={editForm.pincode || ''}
                                onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-12">
                        <Button
                            variant="outline"
                            type="button"
                            className="!border-[#e6d8c3]"
                            onClick={() => setEditModal({ open: false, college: null })}
                        >
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b6f5a]">Abort</span>
                        </Button>
                        <Button variant="primary" type="submit" className="!bg-[#6b3f1d]">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Synchronize Changes</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Colleges;
