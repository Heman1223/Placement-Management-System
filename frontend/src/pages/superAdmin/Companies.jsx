import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import {
    CheckCircle, XCircle, Eye, Briefcase, Plus,
    Edit2, Power, Ban, Trash2, RotateCcw, Building2,
    Calendar, Download, MoreVertical, Search, Globe,
    Users, ShieldCheck, Clock, ShieldAlert, Bell, Mail, ArrowUpRight, Activity, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import './AdminPages.css';

const Companies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [allCompanies, setAllCompanies] = useState([]);
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
    const [rejectionModal, setRejectionModal] = useState({ open: false, id: null, name: '' });
    const [rejectionReason, setRejectionReason] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchCompanies();
        fetchColleges();
    }, [searchQuery]);

    useEffect(() => {
        applyFilter();
    }, [filter, allCompanies]);

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
                search: searchQuery || undefined
            };
            const response = await superAdminAPI.getCompanies(params);
            const fetchedCompanies = response.data.data.companies;
            setAllCompanies(fetchedCompanies);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        if (!filter) {
            setCompanies(allCompanies);
        } else {
            setCompanies(allCompanies.filter(c => {
                if (filter === 'approved') return c.isApproved;
                if (filter === 'pending') return !c.isApproved && !c.isRejected;
                if (filter === 'rejected') return c.isRejected;
                return true;
            }));
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
        if (!approved) {
            setRejectionModal({ open: true, id, name: companyName });
            setRejectionReason('');
            return;
        }

        try {
            await superAdminAPI.approveCompany(id, true);
            toast.success(`${companyName} - Authorized`);
            fetchCompanies(pagination.current);
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
            await superAdminAPI.approveCompany(rejectionModal.id, false, rejectionReason);
            toast.error(`${rejectionModal.name} - Rejected`);
            setRejectionModal({ open: false, id: null, name: '' });
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        const action = currentStatus ? 'Deactivate' : 'Activate';
        try {
            await superAdminAPI.toggleCompanyStatus(id);
            toast.success(`Entity ${action}ed`);
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error(`Failed to ${action} entity`);
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
            toast.success(`Access ${suspendModal.company.isSuspended ? 'Restored' : 'Suspended'}`);
            setSuspendModal({ open: false, company: null });
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this corporate partnership?')) return;

        try {
            await superAdminAPI.deleteCompany(id);
            toast.success('Partnership Terminated');
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Termination failed');
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

            toast.success('Access Permissions Updated');
            setAgencyModal({ open: false, company: null });
            fetchCompanies(pagination.current);
        } catch (error) {
            toast.error('Failed to update access');
        }
    };

    const handleRemoveCollege = async (collegeId) => {
        try {
            await superAdminAPI.removeCollegeFromAgency(agencyModal.company._id, collegeId);
            toast.success('Connection Severed');
            openAgencyAccessModal(agencyModal.company);
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const columns = [
        {
            header: 'Corporate Entity',
            accessor: 'name',
            render: (name, company) => (
                <div className="entity-cell">
                    <div className="entity-icon">
                        {company.logo ? (
                            <img src={company.logo} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                            <Briefcase size={16} />
                        )}
                    </div>
                    <div>
                        <div className="entity-name uppercase">{name}</div>
                        <div className="entity-meta uppercase tracking-wider">{company.industry || 'General Industry'}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Phase',
            accessor: 'isApproved',
            render: (isApproved, company) => {
                if (company.isRejected) return <span className="status-badge status-error">Rejected</span>;
                return (
                    <span className={`status-badge ${isApproved ? 'status-success' : 'status-pending'}`}>
                        {isApproved ? 'Authorized' : 'Partnership Review'}
                    </span>
                );
            }
        },
        {
            header: 'Sector',
            accessor: 'industry',
            render: (val) => <span className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-wider">{val || 'Global'}</span>
        },
        {
            header: 'Authority',
            accessor: 'contactPerson',
            render: (val) => (
                <div className="text-[10px] font-black text-[#4a2c15] uppercase tracking-widest">
                    {val?.name || 'Unassigned'}
                </div>
            )
        },
        {
            header: 'Command',
            accessor: '_id',
            render: (_, company) => (
                <div className="flex gap-2 justify-end action-dropdown-wrapper">
                    <button
                        onClick={() => navigate(`/admin/companies/${company._id}`)}
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        title="View Details"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === company._id ? null : company._id);
                        }}
                    >
                        <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                        {openDropdown === company._id && (
                            <motion.div
                                className="absolute right-0 mt-8 w-52 bg-white rounded-xl shadow-lg border border-[#e6d8c3] z-50 overflow-hidden"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="p-1">
                                    {!company.isApproved && !company.isRejected && (
                                        <>
                                            <button
                                                onClick={() => { handleApprove(company._id, true, company.name); setOpenDropdown(null); }}
                                                className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#1e7d4d] hover:bg-[#e6f4ea] rounded-lg mb-1 flex items-center gap-2"
                                            >
                                                <CheckCircle size={14} /> Authorize Partner
                                            </button>
                                            <button
                                                onClick={() => { handleApprove(company._id, false, company.name); setOpenDropdown(null); }}
                                                className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#b42318] hover:bg-[#fdeaea] rounded-lg mb-1 flex items-center gap-2"
                                            >
                                                <XCircle size={14} /> Decline Request
                                            </button>
                                        </>
                                    )}
                                    {company.isApproved && company.type === 'placement_agency' && (
                                        <button
                                            onClick={() => { openAgencyAccessModal(company); setOpenDropdown(null); }}
                                            className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#c6a85e] hover:bg-[#faf6ef] rounded-lg mb-1 flex items-center gap-2"
                                        >
                                            <ShieldCheck size={14} /> Access Matrix
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { openSuspendModal(company); setOpenDropdown(null); }}
                                        className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#b45309] hover:bg-[#fffbeb] rounded-lg mb-1 flex items-center gap-2"
                                    >
                                        <Ban size={14} /> {company.isSuspended ? 'Restore' : 'Suspend'} Access
                                    </button>
                                    <button
                                        onClick={() => { handleDelete(company._id); setOpenDropdown(null); }}
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
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-1">Corporate Ecosystem</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">Global Partner Registry</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f5a]" />
                        <input
                            type="text"
                            placeholder="IDENTIFY ENTITY..."
                            className="admin-search-input-hardened theme-input pl-10 pr-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all"
                            style={{ backgroundColor: '#ffffff' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Link to="/admin/companies/new">
                        <Button variant="primary" className="!rounded-lg !bg-[#6b3f1d] admin-action-btn-hardened">
                            <Plus size={18} className="mr-2" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Register Entity</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="filter-tabs">
                {[
                    { id: '', label: 'Full Registry' },
                    { id: 'approved', label: 'Authorized' },
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
                    data={companies}
                    loading={loading}
                />
            </div>

            {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={pagination.current}
                        pages={pagination.pages}
                        onPageChange={(page) => fetchCompanies(page)}
                    />
                </div>
            )}

            <Modal
                isOpen={rejectionModal.open}
                onClose={() => setRejectionModal({ open: false, id: null, name: '' })}
                title="Decline Partnership Request"
            >
                <div className="p-6">
                    <div className="mb-6">
                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest mb-2 block">Reason for Rejection</label>
                        <textarea
                            placeholder="State mission critical reasons for declining this partnership..."
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
                isOpen={suspendModal.open}
                onClose={() => setSuspendModal({ open: false, company: null })}
                title={suspendModal.company?.isSuspended ? "Restore Partner Access" : "Suspend Organization"}
            >
                {suspendModal.company && (
                    <div className="p-6">
                        {!suspendModal.company.isSuspended ? (
                            <>
                                <div className="mb-6 p-4 bg-[#fdeaea] rounded-lg border border-[#f5c2c7]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ShieldAlert size={18} className="text-[#b42318]" />
                                        <h4 className="font-bold text-[#b42318] uppercase text-[11px]">System Access Restriction</h4>
                                    </div>
                                    <p className="text-[10px] text-[#842029] font-medium uppercase tracking-tight">Revoking platform access for the organization and all associated recruiters.</p>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">Reason</label>
                                        <Input
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            placeholder="Violation or administrative directive..."
                                            value={suspendForm.reason}
                                            onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">Sunset Date (Optional)</label>
                                        <Input
                                            type="date"
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            value={suspendForm.endDate}
                                            onChange={(e) => setSuspendForm({ ...suspendForm, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    className="w-full !bg-[#b42318]"
                                    onClick={handleSuspend}
                                >
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Confirm Suspension</span>
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-xs font-bold text-[#4a2c15] uppercase tracking-widest mb-8">Restore access for <span className="text-[#6b3f1d]">{suspendModal.company.name}</span>?</p>
                                <Button
                                    variant="primary"
                                    className="w-full !bg-[#1e7d4d]"
                                    onClick={handleSuspend}
                                >
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Authorize Recovery</span>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={agencyModal.open}
                onClose={() => setAgencyModal({ open: false, company: null })}
                title="Institutional Access Matrix"
                size="lg"
            >
                {agencyModal.company && (
                    <div className="p-8">
                        <div className="mb-8">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b6f5a] block mb-4">Authorized Institutions</span>
                            <div className="flex flex-wrap gap-2">
                                {agencyModal.company.agencyAccess?.allowedColleges?.map((ac) => (
                                    <div key={ac.college._id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#faf6ef] rounded-lg text-[10px] font-bold text-[#4a2c15] border border-[#e6d8c3]">
                                        {ac.college.name}
                                        <button onClick={() => handleRemoveCollege(ac.college._id)} className="text-[#b42318] hover:scale-110 transition-transform">
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                ))}
                                {(!agencyModal.company.agencyAccess?.allowedColleges || agencyModal.company.agencyAccess.allowedColleges.length === 0) && (
                                    <p className="text-[10px] font-medium italic text-[#8b6f5a] uppercase">No institutions currently authorized.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b6f5a] block ml-1">Expansion Registry</span>
                            <select
                                multiple
                                className="w-full h-48 bg-[#faf6ef] border border-[#e6d8c3] rounded-xl p-4 text-[10px] font-bold text-[#4a2c15] uppercase tracking-wider focus:outline-none focus:border-[#c6a85e]"
                                value={accessForm.selectedColleges}
                                onChange={(e) => setAccessForm({
                                    ...accessForm,
                                    selectedColleges: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                            >
                                {colleges.map((college) => (
                                    <option key={college._id} value={college._id} className="py-2 border-b border-[#e6d8c3]/30 last:border-none">
                                        {college.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-10 pt-8 border-t border-[#faf6ef]">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">Access Sunset</label>
                                <Input
                                    type="date"
                                    className="!bg-[#faf6ef] !border-[#e6d8c3]"
                                    value={accessForm.expiryDate}
                                    onChange={(e) => setAccessForm({ ...accessForm, expiryDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest">Download Quota</label>
                                <Input
                                    type="number"
                                    min="0"
                                    className="!bg-[#faf6ef] !border-[#e6d8c3]"
                                    value={accessForm.downloadLimit}
                                    onChange={(e) => setAccessForm({ ...accessForm, downloadLimit: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button variant="primary" onClick={handleSaveAgencyAccess} className="w-full !bg-[#6b3f1d]">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Synchronize Permissions</span>
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Companies;
