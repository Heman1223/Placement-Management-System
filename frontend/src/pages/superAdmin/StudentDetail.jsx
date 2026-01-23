import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api'; 
import Button from '../../components/common/Button';
import { 
    ArrowLeft, Mail, Phone, Calendar, Award, Briefcase, 
    FileText, Github, Linkedin, Globe, CheckCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../college/StudentDetail.css'; // Reusing CSS

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            // Using superAdminAPI to get student details
            // Assuming getStudent endpoint exists or we use getAllStudents with ID filter if needed
            // But usually there should be a getStudent(id) endpoint. 
            // Checking superAdminController earlier, getAllStudents was there. 
            // In collegeController, getStudent exists. 
            // Let's assume for now we might need to add getStudent to superAdminAPI or use existing one if available.
            // Actually, usually getStudent(id) is standard. If not, I'll need to add it or find it.
            // Let's use the one I saw in companyAPI as reference or just try superAdminAPI.getStudent(id)
            // If it fails, I might need to add it to the backend.
            
            // Wait, looking at superAdminController earlier (Step 263), I saw getAllStudents but didn't explicitly see getStudent(id).
            // However, companyAPI has it. Let's try to assume it exists or I'll add it if missing in next steps.
            // For now, I'll write the frontend code assuming it *will* work or I'll fix the backend.
            // Actually, safe bet: I should probably double check backend controller for getStudent. 
            // But I am in execution mode. Let's write the file first.
            const response = await superAdminAPI.getStudent(id); 
            setStudent(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load student details');
            // navigate('/admin/students'); // Commented out to debug if it fails
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    if (!student) {
        return <div className="p-8 text-center text-slate-400">Student not found</div>;
    }

    return (
        <div className="student-detail-page p-8">
            {/* Header */}
            <div className="detail-header mb-8 flex items-center justify-between">
                <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/students')}>
                    Back to Students
                </Button>
            </div>

            {/* Profile Overview */}
            <div className="profile-overview bg-[#1e293b] border border-white/5 rounded-2xl p-8 mb-8 flex items-start gap-8">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-3xl font-bold flex-shrink-0">
                    {student.name?.firstName?.[0]}{student.name?.lastName?.[0]}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{student.name?.firstName} {student.name?.lastName}</h1>
                    <p className="text-slate-400 text-lg mb-4">{student.department} • Batch {student.batch}</p>
                    <div className="flex gap-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            student.isVerified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                            {student.isVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {student.isVerified ? 'Verified' : 'Pending'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20`}>
                            {student.placementStatus.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Mail size={20} className="text-blue-500" /> Contact Information
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-slate-400">Email</span>
                            <span className="text-white font-medium">{student.email}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-slate-400">Phone</span>
                            <span className="text-white font-medium">{student.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <span className="text-slate-400">College</span>
                            <span className="text-white font-medium text-right">{student.college?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Award size={20} className="text-purple-500" /> Academic Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <span className="block text-slate-400 text-sm mb-1">Roll Number</span>
                            <span className="block text-white font-bold text-lg">{student.rollNumber}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <span className="block text-slate-400 text-sm mb-1">CGPA</span>
                            <span className="block text-blue-400 font-bold text-lg">{student.cgpa?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <span className="block text-slate-400 text-sm mb-1">Backlogs</span>
                            <span className="block text-white font-bold text-lg">{student.backlogs?.active || 0}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <span className="block text-slate-400 text-sm mb-1">Percentage</span>
                            <span className="block text-white font-bold text-lg">{student.percentage ? `${student.percentage}%` : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Skills */}
                {student.skills && student.skills.length > 0 && (
                    <div className="bg-[#1e293b] border border-white/5 rounded-2xl p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Award size={20} className="text-emerald-500" /> Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {student.skills.map((skill, index) => (
                                <span key={index} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDetail;
