import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
    ArrowLeft, Plus, Mail, Phone, Globe, MapPin, Users, 
    CheckCircle, Briefcase, Bell, Building2, TrendingUp,
    GraduationCap, Clock, ShieldCheck, Edit2, Trash2
} from 'lucide-react';
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
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium">Loading college profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard p-8">
            {/* Premium Header Banner */}
            <div className="premium-header-banner mb-12">
                <div className="premium-header-text">
                    <button 
                        onClick={() => navigate('/admin/colleges')} 
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-3 text-sm font-bold"
                    >
                        <ArrowLeft size={16} />
                        Back to Institutions
                    </button>
                    <h1>{college.name}</h1>
                    <p>Institution Profile • Code: {college.code}</p>
                </div>
                <div className={`px-6 py-3 rounded-xl ${college.isVerified ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                    <div className="flex items-center gap-2">
                        {college.isVerified ? <CheckCircle size={20} className="text-emerald-500" /> : <Clock size={20} className="text-amber-500" />}
                        <span className={`text-sm font-black uppercase tracking-wider ${college.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {college.isVerified ? 'VERIFIED' : 'PENDING REVIEW'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Premium Statistics Grid */}
            <div className="premium-stat-grid mb-16">
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="premium-stat-icon bg-blue-500/10 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Users size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Total Students</span>
                        <span className="stat-value">{stats.totalStudents}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="premium-stat-icon bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <CheckCircle size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Verified</span>
                        <span className="stat-value">{stats.verifiedStudents}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="premium-stat-icon bg-purple-500/10 text-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                        <Briefcase size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Placed</span>
                        <span className="stat-value">{stats.placedStudents}</span>
                    </div>
                </motion.div>
                <motion.div className="premium-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="premium-stat-icon bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-v2-info">
                        <span className="stat-label">Placement</span>
                        <span className="stat-value">{stats.placementRate}%</span>
                    </div>
                </motion.div>
            </div>

            {/* College Information Cards */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
            >
                {/* College Info */}
                <div className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Building2 size={20} className="text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">College Information</h2>
                    </div>
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Mail size={18} className="text-slate-500" />
                            <span className="text-sm">{college.contactEmail}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <Phone size={18} className="text-slate-500" />
                            <span className="text-sm">{college.phone || 'Not provided'}</span>
                        </div>
                        {college.website && (
                            <div className="flex items-center gap-3 text-slate-300">
                                <Globe size={18} className="text-slate-500" />
                                <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    {college.website}
                                </a>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-slate-300">
                            <MapPin size={18} className="text-slate-500" />
                            <span className="text-sm">{college.address.city}, {college.address.state}</span>
                        </div>
                        {college.university && (
                            <div className="pt-3 border-t border-white/5">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">University</span>
                                <p className="text-sm text-slate-300 mt-1">{college.university}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Details */}
                <div className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <ShieldCheck size={20} className="text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Admin Details</h2>
                    </div>
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Mail size={18} className="text-slate-500" />
                            <span className="text-sm">{college.admin.email}</span>
                        </div>
                        <div className="pt-3 border-t border-white/5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                            <p className="text-sm text-slate-300 mt-1">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${college.admin.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {college.admin.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                        <div className="pt-3 border-t border-white/5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Created</span>
                            <p className="text-sm text-slate-300 mt-1">{new Date(college.admin.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Department Stats */}
            {departmentStats.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl mb-16"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <GraduationCap size={20} className="text-purple-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Department-wise Statistics</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Department</th>
                                    <th className="text-right py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Total Students</th>
                                    <th className="text-right py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Placed</th>
                                    <th className="text-right py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Placement Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departmentStats.map((dept, idx) => (
                                    <tr key={dept._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-4 text-sm font-bold text-white">{dept._id}</td>
                                        <td className="py-4 px-4 text-sm text-slate-300 text-right">{dept.total}</td>
                                        <td className="py-4 px-4 text-sm text-slate-300 text-right">{dept.placed}</td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {((dept.placed / dept.total) * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Students Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="content-section bg-[#1e293b] border border-white/5 rounded-[2rem] p-10 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Users size={20} className="text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Students</h2>
                    </div>
                    <button
                        onClick={() => setShowAddStudent(!showAddStudent)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all text-white font-bold text-sm"
                    >
                        <Plus size={18} />
                        Add Student
                    </button>
                </div>

                {showAddStudent && (
                    <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name *"
                                    value={studentForm.name.firstName}
                                    onChange={(e) => setStudentForm({
                                        ...studentForm,
                                        name: { ...studentForm.name, firstName: e.target.value }
                                    })}
                                    required
                                    className="px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name *"
                                    value={studentForm.name.lastName}
                                    onChange={(e) => setStudentForm({
                                        ...studentForm,
                                        name: { ...studentForm.name, lastName: e.target.value }
                                    })}
                                    required
                                    className="px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={studentForm.email}
                                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                    required
                                    className="px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone *"
                                    value={studentForm.phone}
                                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                                    required
                                    className="px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Roll Number *"
                                    value={studentForm.rollNumber}
                                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                                    required
                                    className="px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <select
                                    value={studentForm.department}
                                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                                    required
                                    className="px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select Department *</option>
                                    {college.departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Batch Year *"
                                    value={studentForm.batch}
                                    onChange={(e) => setStudentForm({ ...studentForm, batch: parseInt(e.target.value) })}
                                    required
                                    className="px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="CGPA"
                                    value={studentForm.cgpa}
                                    onChange={(e) => setStudentForm({ ...studentForm, cgpa: parseFloat(e.target.value) })}
                                    className="px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddStudent(false)} 
                                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all text-white font-bold text-sm"
                                >
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto">
                    {studentsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12">
                            <Users size={48} className="mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-400">No students added yet</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Name</th>
                                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Roll Number</th>
                                    <th className="text-left py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Department</th>
                                    <th className="text-center py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Batch</th>
                                    <th className="text-center py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">CGPA</th>
                                    <th className="text-center py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="text-center py-4 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Verified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-4 text-sm font-bold text-white">{student.name.firstName} {student.name.lastName}</td>
                                        <td className="py-4 px-4 text-sm text-slate-300">{student.rollNumber}</td>
                                        <td className="py-4 px-4 text-sm text-slate-300">{student.department}</td>
                                        <td className="py-4 px-4 text-sm text-slate-300 text-center">{student.batch}</td>
                                        <td className="py-4 px-4 text-sm text-slate-300 text-center">{student.cgpa?.toFixed(2) || '-'}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                                student.placementStatus === 'placed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                student.placementStatus === 'in_process' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                                {student.placementStatus.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {student.isVerified ? (
                                                <CheckCircle size={18} className="mx-auto text-emerald-500" />
                                            ) : (
                                                <Clock size={18} className="mx-auto text-amber-500" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CollegeDetail;
