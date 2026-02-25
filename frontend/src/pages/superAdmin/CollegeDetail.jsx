import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Plus, Mail, Phone, Globe, MapPin, Users,
    CheckCircle, Briefcase, Bell, Building2, TrendingUp,
    GraduationCap, Clock, ShieldCheck, Edit2, Trash2, Star,
    ChevronDown, ChevronUp, ArrowUpRight, Shield, UserPlus,
    Target, Award, MoreVertical
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

const CollegeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [college, setCollege] = useState(null);
    const [stats, setStats] = useState(null);
    const [departmentStats, setDepartmentStats] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [studentForm, setStudentForm] = useState({
        name: { firstName: '', lastName: '' },
        email: '',
        phone: '',
        rollNumber: '',
        department: '',
        batch: new Date().getFullYear(),
        cgpa: ''
    });

    useEffect(() => {
        fetchCollegeDetails();
        fetchStudents();
    }, [id]);

    const fetchCollegeDetails = async () => {
        try {
            const response = await superAdminAPI.getCollegeDetails(id);
            setCollege(response.data.data.college);
            setStats(response.data.data.stats);
            setDepartmentStats(response.data.data.departmentStats);
        } catch (error) {
            toast.error('Failed to load college details');
            navigate('/admin/colleges');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const response = await superAdminAPI.getCollegeStudents(id, { limit: 20 });
            setStudents(response.data.data.students);
        } catch (error) {
            console.error('Failed to load students');
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleToggleStar = async (student) => {
        try {
            await superAdminAPI.toggleStarStudent(student._id);
            const newStatus = !student.isStarStudent;

            setStudents(prev => prev.map(s =>
                s._id === student._id ? { ...s, isStarStudent: newStatus } : s
            ));

            toast.success(newStatus ? 'Marked as Star Student' : 'Removed from Star Students');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await superAdminAPI.addStudentToCollege(id, studentForm);
            toast.success('Student added successfully!');
            setShowAddStudent(false);
            setStudentForm({
                name: { firstName: '', lastName: '' },
                email: '',
                phone: '',
                rollNumber: '',
                department: '',
                batch: new Date().getFullYear(),
                cgpa: ''
            });
            fetchStudents();
            fetchCollegeDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add student');
        }
    };

    if (loading) {
        return (
            <div className="admin-page flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[#e6d8c3] border-t-[#6b3f1d] rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-[#8b6f5a] font-bold uppercase tracking-widest text-[10px]">Accessing Institution Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-10">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#e6d8c3] overflow-hidden">
                        {college.logo ? (
                            <img src={college.logo} alt={college.name} className="w-full h-full object-contain p-2" />
                        ) : (
                            <Building2 size={32} className="text-[#6b3f1d]" />
                        )}
                    </div>
                    <div>
                        <button
                            onClick={() => navigate('/admin/colleges')}
                            className="flex items-center gap-2 text-[#6b3f1d] font-bold text-[10px] uppercase tracking-widest hover:gap-3 transition-all mb-3"
                        >
                            <ArrowLeft size={14} /> Back to Institutions
                        </button>
                        <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-2">{college.name}</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-[#8b6f5a] font-bold uppercase tracking-widest bg-[#faf6ef] px-2 py-1 rounded border border-[#e6d8c3]">Registry Code: {college.code}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${college.isVerified ? 'bg-[#e6f4ea] border-[#b7e4c7] text-[#1e7d4d]' : 'bg-[#fffbeb] border-[#fef3c7] text-[#b45309]'
                                }`}>
                                {college.isVerified ? 'Verified Node' : 'Registry Review'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="!rounded-lg !border-[#e6d8c3] !text-[#6b3f1d]">
                        <Edit2 size={16} className="mr-2" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Modify Profile</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{stats.totalStudents}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Total Talent</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{stats.verifiedStudents}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Verified</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="text-2xl font-black text-[#4a2c15] tracking-tight">{stats.placedStudents}</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Placed</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e6d8c3] shadow-sm border-l-4 border-l-[#c6a85e]">
                    <div className="text-2xl font-black text-[#6b3f1d] tracking-tight">{stats.placementRate}%</div>
                    <div className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest leading-none mt-2">Placement Success Rate</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <Target size={18} className="text-[#6b3f1d]" /> Institutional Metadata
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-70">Contact Email</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{college.contactEmail}</p>
                                </div>
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-70">Phone String</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{college.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-70">Localization</span>
                                    <p className="text-[11px] font-bold text-[#4a2c15] uppercase">{college.address.city}, {college.address.state}</p>
                                </div>
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2 opacity-70">Digital Domain</span>
                                    <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#6b3f1d] hover:underline uppercase">
                                        {college.website || 'N/A'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <GraduationCap size={18} className="text-[#c6a85e]" /> Academic Segments
                        </h2>
                        <div className="space-y-4">
                            {departmentStats.map((dept) => (
                                <div key={dept._id} className="flex items-center justify-between p-5 bg-[#faf6ef] rounded-lg border border-[#e6d8c3] border-l-4 border-l-[#6b3f1d] hover:border-[#c6a85e]/30 transition-all">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-tight block text-[#4a2c15]">{dept._id}</span>
                                        <span className="text-[9px] text-[#8b6f5a] font-bold uppercase tracking-widest mt-1 block">
                                            {dept.total} Enrolled Nodes • {dept.placed} Successful Placements
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-[#6b3f1d]">{((dept.placed / dept.total) * 100).toFixed(1)}%</div>
                                        <div className="text-[8px] font-bold text-[#8b6f5a] uppercase tracking-widest">Efficiency</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="bg-[#6b3f1d] p-8 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Shield className="text-[#c6a85e]" size={18} /> Authority Node
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-[#e6d8c3] opacity-60">Identity Signature</span>
                                <p className="text-[11px] font-bold text-white uppercase mt-1">{college.admin.email}</p>
                            </div>
                            <div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-[#e6d8c3] opacity-60">Operational Status</span>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white mt-1 flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${college.admin.isActive ? 'bg-[#1e7d4d]' : 'bg-[#b42318]'} animate-pulse`}></div>
                                    {college.admin.isActive ? 'Active Protocol' : 'Node Suspended'}
                                </p>
                            </div>
                            <div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-[#e6d8c3] opacity-60">Commission Date</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white mt-1">{new Date(college.admin.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest mb-8 border-b border-[#faf6ef] pb-4 flex items-center gap-2">
                            <Award size={18} className="text-[#c6a85e]" /> Institutional Assets
                        </h2>
                        <div className="space-y-6">
                            {college.university && (
                                <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                    <span className="text-[8px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2">Affiliated University</span>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c15]">{college.university}</p>
                                </div>
                            )}
                            <div className="p-4 bg-[#faf6ef] rounded-lg border border-[#e6d8c3]">
                                <span className="text-[8px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-2">Registry ID</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4a2c15]">{college._id.slice(-12).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#4a2c15] uppercase tracking-tight">Academic Talent Registry</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c6a85e]">Real-time Student Interaction Matrix</p>
                    </div>
                    <Button
                        variant={showAddStudent ? 'primary' : 'outline'}
                        onClick={() => setShowAddStudent(!showAddStudent)}
                        className={`text-[10px] !rounded-lg ${showAddStudent ? '!bg-[#6b3f1d]' : '!border-[#e6d8c3] !text-[#6b3f1d]'}`}
                    >
                        {showAddStudent ? 'Abort Onboarding' : 'Onboard Talent'}
                    </Button>
                </div>

                <AnimatePresence>
                    {showAddStudent && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 rounded-xl border-2 border-[#6b3f1d]/20 shadow-xl"
                        >
                            <form onSubmit={handleAddStudent} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">First Name</label>
                                        <Input
                                            required
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            value={studentForm.name.firstName}
                                            onChange={(e) => setStudentForm({
                                                ...studentForm,
                                                name: { ...studentForm.name, firstName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Last Name</label>
                                        <Input
                                            required
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            value={studentForm.name.lastName}
                                            onChange={(e) => setStudentForm({
                                                ...studentForm,
                                                name: { ...studentForm.name, lastName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Email Vector</label>
                                        <Input
                                            type="email"
                                            required
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            value={studentForm.email}
                                            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Phone Link</label>
                                        <Input
                                            required
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            value={studentForm.phone}
                                            onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Roll Identifier</label>
                                        <Input
                                            required
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            value={studentForm.rollNumber}
                                            onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Segment</label>
                                        <select
                                            required
                                            value={studentForm.department}
                                            onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                                            className="admin-form-input-hardened theme-input w-full px-3 py-3 text-[11px] font-bold text-[#4a2c15] uppercase tracking-wider focus:outline-none focus:border-[#c6a85e]"
                                            style={{ backgroundColor: '#ffffff' }}
                                        >
                                            <option value="">Select Segment</option>
                                            {college.departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Batch Wave</label>
                                        <Input
                                            type="number"
                                            required
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            value={studentForm.batch}
                                            onChange={(e) => setStudentForm({ ...studentForm, batch: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest block ml-1">Merit Index (CGPA)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="admin-form-input-hardened theme-input"
                                            style={{ backgroundColor: '#ffffff' }}
                                            value={studentForm.cgpa}
                                            onChange={(e) => setStudentForm({ ...studentForm, cgpa: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-8 border-t border-[#faf6ef]">
                                    <Button type="submit" className="!px-16 !bg-[#6b3f1d] !rounded-lg text-[11px] font-bold uppercase tracking-widest">Execute Onboarding</Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    {studentsLoading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-2 border-[#e6d8c3] border-t-[#6b3f1d] rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-16 bg-[#faf6ef] rounded-xl border border-dashed border-[#e6d8c3]">
                            <p className="text-[#8b6f5a] font-bold uppercase tracking-widest text-[10px]">No talent entries detected in registry</p>
                        </div>
                    ) : (
                        students.map((student) => (
                            <div key={student._id} className="flex items-center gap-6 p-6 bg-white rounded-xl border border-[#e6d8c3] hover:border-[#c6a85e]/30 transition-all group relative overflow-hidden">
                                {student.isStarStudent && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#c6a85e]/5 rounded-bl-full flex items-center justify-center pl-4 pb-4">
                                        <Star size={14} className="text-[#c6a85e] fill-current" />
                                    </div>
                                )}
                                <div className="w-14 h-14 rounded bg-[#faf6ef] flex items-center justify-center text-[#6b3f1d] font-black text-xl border border-[#e6d8c3]">
                                    {student.name.firstName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-sm font-bold uppercase tracking-tight text-[#4a2c15]">{student.name.firstName} {student.name.lastName}</h3>
                                        <span className="text-[9px] font-bold text-[#8b6f5a] uppercase tracking-widest bg-[#faf6ef] px-2 py-0.5 rounded border border-[#e6d8c3]">ID: {student.rollNumber}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-[#8b6f5a] uppercase tracking-widest mt-1.5 opacity-80">
                                        {student.department} • Batch {student.batch}
                                    </p>
                                </div>
                                <div className="hidden md:block text-center mx-10 border-x border-[#faf6ef] px-10">
                                    <span className="text-[8px] font-bold text-[#8b6f5a] uppercase tracking-widest block mb-1">Merit Index</span>
                                    <span className="text-sm font-black text-[#4a2c15]">{student.cgpa?.toFixed(2) || '0.00'} <span className="text-[9px] font-bold opacity-40">CGPA</span></span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${student.placementStatus === 'placed' ? 'bg-[#e6f4ea] border-[#b7e4c7] text-[#1e7d4d]' :
                                        student.placementStatus === 'in_process' ? 'bg-[#fffbeb] border-[#fef3c7] text-[#b45309]' :
                                            'bg-[#faf6ef] border-[#e6d8c3] text-[#8b6f5a]'
                                        }`}>
                                        {student.placementStatus.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleToggleStar(student)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${student.isStarStudent ? 'bg-[#c6a85e] border-[#c6a85e] text-white shadow-lg' : 'bg-white border-[#e6d8c3] text-[#8b6f5a] hover:border-[#c6a85e]'}`}
                                        >
                                            <Star size={18} className={student.isStarStudent ? 'fill-current' : ''} />
                                        </button>
                                        <Link
                                            to={`/admin/students/${student._id}`}
                                            className="w-10 h-10 rounded-lg bg-[#6b3f1d] text-white flex items-center justify-center hover:bg-[#4a2c15] transition-all shadow-md group-hover:scale-105"
                                        >
                                            <ArrowUpRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollegeDetail;
