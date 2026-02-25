import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import {
    Search, Filter, GraduationCap,
    CheckCircle, XCircle, MoreVertical,
    UserCheck, Star, Eye, Building2,
    Briefcase, Mail, Phone, Sparkles, Trash2,
    Activity, ArrowUpRight, MapPin, Users,
    FilterX, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const Students = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        college: '',
        department: '',
        placementStatus: '',
        isStarStudent: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, [pagination.current, filters.college, filters.department, filters.placementStatus, filters.isStarStudent]);

    useEffect(() => {
        fetchColleges();
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-dropdown-wrapper')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchStudents(1);
    }, [filters.search]);

    const fetchColleges = async () => {
        try {
            const response = await superAdminAPI.getColleges({ limit: 100 });
            setColleges(response.data.data.colleges);
        } catch (error) {
            console.error('Failed to load colleges');
        }
    };

    const fetchStudents = async (page = pagination.current) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 10,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                )
            };

            const response = await superAdminAPI.getAllStudents(params);
            setStudents(response.data.data.students);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load student registry');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStar = async (student) => {
        try {
            await superAdminAPI.toggleStarStudent(student._id);
            const newStatus = !student.isStarStudent;

            setStudents(prev => prev.map(s =>
                s._id === student._id ? { ...s, isStarStudent: newStatus } : s
            ));

            toast.success(newStatus ? 'Excellence Recognized' : 'Status Updated');
        } catch (error) {
            toast.error('Recognition update failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this student record permanently?')) return;

        try {
            await superAdminAPI.deleteStudent(id);
            toast.success('Record Terminated');
            fetchStudents();
        } catch (error) {
            toast.error('Termination failed');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters({ ...filters, [field]: value });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            college: '',
            department: '',
            placementStatus: '',
            isStarStudent: ''
        });
        setPagination({ ...pagination, current: 1 });
        fetchStudents(1);
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const columns = [
        {
            header: 'Candidate Identity',
            accessor: 'name',
            render: (_, student) => (
                <div className="entity-cell">
                    <div className="relative">
                        <div className="entity-icon">
                            {student.avatar ? (
                                <img src={student.avatar} alt="" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <span className="text-[10px] font-black">{getInitials(student.name?.firstName, student.name?.lastName)}</span>
                            )}
                        </div>
                        {student.isStarStudent && (
                            <div className="absolute -top-1 -right-1">
                                <Star size={10} className="text-[#c6a85e] fill-current" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="entity-name uppercase">
                            {student.name?.firstName} {student.name?.lastName}
                        </div>
                        <div className="entity-meta uppercase tracking-widest leading-none mt-1">
                            {student.rollNumber || student._id.slice(-6)}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Institutional Data',
            accessor: 'college.name',
            render: (collegeName, student) => (
                <div>
                    <div className="text-[10px] font-bold text-[#4a2c15] uppercase flex items-center gap-1.5">
                        <Building2 size={12} className="text-[#6b3f1d]" /> {collegeName}
                    </div>
                    <div className="text-[9px] text-[#8b6f5a] font-bold uppercase tracking-widest mt-0.5">
                        {student.department}
                    </div>
                </div>
            )
        },
        {
            header: 'Academic Vector',
            accessor: 'cgpa',
            render: (cgpa) => (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#6b3f1d] px-2 py-0.5 bg-[#faf6ef] rounded-md border border-[#e6d8c3]">
                        {cgpa?.toFixed(2) || 'N/A'}
                    </span>
                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-tighter">GPA INDEX</span>
                </div>
            )
        },
        {
            header: 'Phase',
            accessor: 'placementStatus',
            render: (status) => (
                <span className={`status-badge ${status === 'placed' ? 'status-success' : 'status-pending'}`}>
                    {status === 'placed' ? 'Placed' : status?.replace('_', ' ') || 'Searching'}
                </span>
            )
        },
        {
            header: 'Command',
            accessor: '_id',
            render: (_, student) => (
                <div className="flex gap-2 justify-end action-dropdown-wrapper">
                    <button
                        onClick={() => navigate(`/admin/students/${student._id}`)}
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        title="View Profile"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        className="w-8 h-8 rounded-lg border border-[#e6d8c3] flex items-center justify-center text-[#6b3f1d] hover:bg-[#faf6ef] transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === student._id ? null : student._id);
                        }}
                    >
                        <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                        {openDropdown === student._id && (
                            <motion.div
                                className="absolute right-0 mt-8 w-48 bg-white rounded-xl shadow-lg border border-[#e6d8c3] z-50 overflow-hidden"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="p-1">
                                    <button
                                        onClick={() => { handleToggleStar(student); setOpenDropdown(null); }}
                                        className={`w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase flex items-center gap-2 rounded-lg mb-1 ${student.isStarStudent ? 'text-[#b42318] hover:bg-[#fdeaea]' : 'text-[#b45309] hover:bg-[#fffbeb]'
                                            }`}
                                    >
                                        <Star size={14} className={student.isStarStudent ? '' : 'fill-current'} />
                                        {student.isStarStudent ? 'Revoke Excellence' : 'Mark Excellence'}
                                    </button>
                                    <button
                                        onClick={() => { handleDelete(student._id); setOpenDropdown(null); }}
                                        className="w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase text-[#b42318] hover:bg-[#fdeaea] rounded-lg flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Terminate Record
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
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-1">Talent Intelligence</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">Global Candidate Registry</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6f5a]" />
                        <input
                            type="text"
                            placeholder="IDENTIFY CANDIDATE..."
                            className="admin-search-input-hardened theme-input pl-10 pr-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all"
                            style={{ backgroundColor: '#ffffff' }}
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <Button
                        variant={showFilters ? 'primary' : 'outline'}
                        className={`!rounded-lg transition-all admin-action-btn-hardened ${showFilters ? '!bg-[#6b3f1d] !border-[#6b3f1d]' : '!border-[#e6d8c3] !text-[#6b3f1d]'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={18} className="mr-2" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Matrix Filters</span>
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] grid grid-cols-1 md:grid-cols-4 gap-6 shadow-sm">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest ml-1">Institutional Node</label>
                                <select
                                    className="admin-form-input-hardened theme-input w-full px-3 py-2 text-[11px] font-bold text-[#4a2c15] uppercase tracking-wider focus:outline-none focus:border-[#c6a85e]"
                                    style={{ backgroundColor: '#ffffff' }}
                                    value={filters.college}
                                    onChange={(e) => handleFilterChange('college', e.target.value)}
                                >
                                    <option value="">Full Network</option>
                                    {colleges.map(college => (
                                        <option key={college._id} value={college._id}>{college.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest ml-1">Academic Discipline</label>
                                <Input
                                    className="admin-form-input-hardened theme-input"
                                    style={{ backgroundColor: '#ffffff' }}
                                    placeholder="E.G. ENGINEERING..."
                                    value={filters.department}
                                    onChange={(e) => handleFilterChange('department', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest ml-1">Placement Status</label>
                                <select
                                    className="admin-form-input-hardened theme-input w-full px-3 py-2 text-[11px] font-bold text-[#4a2c15] uppercase tracking-wider focus:outline-none focus:border-[#c6a85e]"
                                    style={{ backgroundColor: '#ffffff' }}
                                    value={filters.placementStatus}
                                    onChange={(e) => handleFilterChange('placementStatus', e.target.value)}
                                >
                                    <option value="">Any Status</option>
                                    <option value="placed">Confirmed Placement</option>
                                    <option value="not_placed">Active Search</option>
                                    <option value="in_process">Under Interview</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-3">
                                <Button variant="outline" className="flex-1 !py-2.5 !border-[#e6d8c3] !text-[#8b6f5a]" onClick={clearFilters}>
                                    <FilterX size={14} className="mr-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Flush</span>
                                </Button>
                                <Button variant="primary" className="flex-1 !py-2.5 !bg-[#6b3f1d]" onClick={() => setShowFilters(false)}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Apply Matrix</span>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="table-container shadow-sm">
                <Table
                    columns={columns}
                    data={students}
                    loading={loading}
                />
            </div>

            {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={pagination.current}
                        pages={pagination.pages}
                        onPageChange={(page) => fetchStudents(page)}
                    />
                </div>
            )}
        </div>
    );
};

export default Students;
