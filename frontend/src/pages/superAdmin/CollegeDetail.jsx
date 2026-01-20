import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Mail, Phone, Globe, MapPin, Users, CheckCircle, Briefcase } from 'lucide-react';
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
        return <div className="admin-page"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <button onClick={() => navigate('/admin/colleges')} className="back-btn">
                        <ArrowLeft size={20} />
                        Back to Colleges
                    </button>
                    <h1>{college.name}</h1>
                    <p className="subtitle">{college.code}</p>
                </div>
            </div>

            {/* College Info */}
            <div className="info-cards">
                <div className="info-card">
                    <div className="info-card-header">
                        <h3>College Information</h3>
                    </div>
                    <div className="info-card-body">
                        <div className="info-row">
                            <Mail size={18} />
                            <span>{college.contactEmail}</span>
                        </div>
                        <div className="info-row">
                            <Phone size={18} />
                            <span>{college.phone}</span>
                        </div>
                        {college.website && (
                            <div className="info-row">
                                <Globe size={18} />
                                <a href={college.website} target="_blank" rel="noopener noreferrer">
                                    {college.website}
                                </a>
                            </div>
                        )}
                        <div className="info-row">
                            <MapPin size={18} />
                            <span>{college.address.city}, {college.address.state}</span>
                        </div>
                        {college.university && (
                            <div className="info-row">
                                <span><strong>University:</strong> {college.university}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-card-header">
                        <h3>Admin Details</h3>
                    </div>
                    <div className="info-card-body">
                        <div className="info-row">
                            <Mail size={18} />
                            <span>{college.admin.email}</span>
                        </div>
                        <div className="info-row">
                            <span><strong>Status:</strong> {college.admin.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="info-row">
                            <span><strong>Created:</strong> {new Date(college.admin.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--primary-50)' }}>
                        <Users size={24} style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalStudents}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success-50)' }}>
                        <CheckCircle size={24} style={{ color: 'var(--success-600)' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.verifiedStudents}</div>
                        <div className="stat-label">Verified</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--warning-50)' }}>
                        <Briefcase size={24} style={{ color: 'var(--warning-600)' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.placedStudents}</div>
                        <div className="stat-label">Placed</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--info-50)' }}>
                        <Briefcase size={24} style={{ color: 'var(--info-600)' }} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.placementRate}%</div>
                        <div className="stat-label">Placement Rate</div>
                    </div>
                </div>
            </div>

            {/* Department Stats */}
            {departmentStats.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3>Department-wise Statistics</h3>
                    </div>
                    <div className="card-body">
                        <table className="simple-table">
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th>Total Students</th>
                                    <th>Placed</th>
                                    <th>Placement Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departmentStats.map((dept) => (
                                    <tr key={dept._id}>
                                        <td>{dept._id}</td>
                                        <td>{dept.total}</td>
                                        <td>{dept.placed}</td>
                                        <td>{((dept.placed / dept.total) * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Students Section */}
            <div className="card">
                <div className="card-header">
                    <h3>Students</h3>
                    <button
                        onClick={() => setShowAddStudent(!showAddStudent)}
                        className="btn btn-primary btn-sm"
                    >
                        <Plus size={16} />
                        Add Student
                    </button>
                </div>

                {showAddStudent && (
                    <div className="card-body">
                        <form onSubmit={handleAddStudent} className="add-student-form">
                            <div className="form-grid">
                                <input
                                    type="text"
                                    placeholder="First Name *"
                                    value={studentForm.name.firstName}
                                    onChange={(e) => setStudentForm({
                                        ...studentForm,
                                        name: { ...studentForm.name, firstName: e.target.value }
                                    })}
                                    required
                                    className="input"
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
                                    className="input"
                                />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={studentForm.email}
                                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                    required
                                    className="input"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone *"
                                    value={studentForm.phone}
                                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                                    required
                                    className="input"
                                />
                                <input
                                    type="text"
                                    placeholder="Roll Number *"
                                    value={studentForm.rollNumber}
                                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                                    required
                                    className="input"
                                />
                                <select
                                    value={studentForm.department}
                                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                                    required
                                    className="input"
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
                                    className="input"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="CGPA"
                                    value={studentForm.cgpa}
                                    onChange={(e) => setStudentForm({ ...studentForm, cgpa: parseFloat(e.target.value) })}
                                    className="input"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowAddStudent(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Student
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card-body">
                    {studentsLoading ? (
                        <div className="loading">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="empty-state">No students added yet</div>
                    ) : (
                        <table className="simple-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Roll Number</th>
                                    <th>Department</th>
                                    <th>Batch</th>
                                    <th>CGPA</th>
                                    <th>Status</th>
                                    <th>Verified</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id}>
                                        <td>{student.name.firstName} {student.name.lastName}</td>
                                        <td>{student.rollNumber}</td>
                                        <td>{student.department}</td>
                                        <td>{student.batch}</td>
                                        <td>{student.cgpa?.toFixed(2) || '-'}</td>
                                        <td>
                                            <span className={`status-badge status-${student.placementStatus}`}>
                                                {student.placementStatus.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            {student.isVerified ? (
                                                <CheckCircle size={18} style={{ color: 'var(--success-600)' }} />
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollegeDetail;
