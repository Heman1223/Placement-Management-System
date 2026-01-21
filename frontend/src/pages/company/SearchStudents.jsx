import { useState, useEffect } from 'react';
import { companyAPI, jobAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Search, Filter, Star, ExternalLink, Mail, Github, Linkedin, Building2, GraduationCap, Sparkles, Briefcase, Eye, Phone, Calendar, Award, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';
import './SearchStudents.css';

const SearchStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [jobs, setJobs] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [showFilters, setShowFilters] = useState(true);
    const [shortlistingId, setShortlistingId] = useState(null);
    const [shortlistModal, setShortlistModal] = useState({ open: false, student: null });
    const [selectedJobForShortlist, setSelectedJobForShortlist] = useState('');
    const [shortlistNotes, setShortlistNotes] = useState('');
    const [studentDetailModal, setStudentDetailModal] = useState({ open: false, student: null, loading: false });

    const [filters, setFilters] = useState({
        search: '',
        department: '',
        batch: '',
        minCgpa: '',
        maxBacklogs: '',
        skills: '',
        college: '',
        placementStatus: 'not_placed'
    });

    useEffect(() => {
        fetchJobs();
        fetchColleges();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await jobAPI.getJobs({ status: 'open' });
            setJobs(response.data.data.jobs);
        } catch (error) {
            console.error('Failed to fetch jobs');
        }
    };

    const fetchColleges = async () => {
        try {
            const response = await companyAPI.getColleges();
            setColleges(response.data.data);
        } catch (error) {
            console.error('Failed to fetch colleges');
        }
    };

    const searchStudents = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                page,
                limit: 12
            };

            // Clean empty params
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await companyAPI.searchStudents(params);
            setStudents(response.data.data.students);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        searchStudents(1);
    };

    const handleShortlist = (student) => {
        if (jobs.length === 0) {
            toast.error('No active jobs available. Please create a job first.');
            return;
        }
        setSelectedJobForShortlist('');
        setShortlistNotes('');
        setShortlistModal({ open: true, student });
    };

    const confirmShortlist = async () => {
        if (!selectedJobForShortlist) {
            toast.error('Please select a job to shortlist for');
            return;
        }

        const student = shortlistModal.student;
        setShortlistingId(student._id);
        setShortlistModal({ open: false, student: null });

        try {
            await companyAPI.shortlist(student._id, selectedJobForShortlist, shortlistNotes);
            toast.success(`${student.name?.firstName} shortlisted successfully!`);
        } catch (error) {
            console.error('Shortlist error:', error);
            toast.error(error.response?.data?.message || 'Failed to shortlist');
        } finally {
            setShortlistingId(null);
        }
    };

    const viewStudentDetails = async (studentId) => {
        setStudentDetailModal({ open: true, student: null, loading: true });
        try {
            const response = await companyAPI.getStudent(studentId);
            setStudentDetailModal({ open: true, student: response.data.data, loading: false });
        } catch (error) {
            toast.error('Failed to load student details');
            setStudentDetailModal({ open: false, student: null, loading: false });
        }
    };

    const departments = [
        'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
        'Civil', 'Electrical', 'Chemical', 'Biotechnology'
    ];

    const batches = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

    return (
        <div className="search-page">
            <div className="page-header search-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Sparkles size={28} />
                    </div>
                    <div>
                        <h1>Find Talent</h1>
                        <p>Discover exceptional candidates matching your requirements</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="filters-card glass-card">
                <div className="filters-header">
                    <h3><Filter size={18} /> Search Filters</h3>
                    <button
                        className="toggle-filters"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? 'Hide' : 'Show'}
                    </button>
                </div>

                {showFilters && (
                    <div className="filters-grid">
                        <div className="filter-row">
                            <Input
                                label="Skills"
                                placeholder="JavaScript, React, Python..."
                                value={filters.skills}
                                onChange={(e) => handleFilterChange('skills', e.target.value)}
                                icon={Search}
                            />
                        </div>

                        <div className="filter-row filter-row-3">
                            <div className="input-wrapper">
                                <label className="input-label"><Building2 size={14} /> College</label>
                                <select
                                    className="input"
                                    value={filters.college}
                                    onChange={(e) => handleFilterChange('college', e.target.value)}
                                >
                                    <option value="">All Colleges</option>
                                    {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label"><GraduationCap size={14} /> Department</label>
                                <select
                                    className="input"
                                    value={filters.department}
                                    onChange={(e) => handleFilterChange('department', e.target.value)}
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <div className="input-wrapper">
                                <label className="input-label">Batch</label>
                                <select
                                    className="input"
                                    value={filters.batch}
                                    onChange={(e) => handleFilterChange('batch', e.target.value)}
                                >
                                    <option value="">All Batches</option>
                                    {batches.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="filter-row filter-row-3">
                            <Input
                                label="Minimum CGPA"
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                placeholder="e.g., 7.0"
                                value={filters.minCgpa}
                                onChange={(e) => handleFilterChange('minCgpa', e.target.value)}
                            />
                            <Input
                                label="Max Backlogs"
                                type="number"
                                min="0"
                                placeholder="e.g., 0"
                                value={filters.maxBacklogs}
                                onChange={(e) => handleFilterChange('maxBacklogs', e.target.value)}
                            />
                            <div className="input-wrapper">
                                <label className="input-label">Status</label>
                                <select
                                    className="input"
                                    value={filters.placementStatus}
                                    onChange={(e) => handleFilterChange('placementStatus', e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="not_placed">Not Placed</option>
                                    <option value="in_process">In Process</option>
                                </select>
                            </div>
                        </div>

                        <div className="filter-actions">
                            <Button variant="secondary" onClick={() => setFilters({
                                search: '', department: '', batch: '', minCgpa: '', maxBacklogs: '', skills: '', college: '', placementStatus: ''
                            })}>
                                Clear All
                            </Button>
                            <Button onClick={handleSearch} icon={Search}>
                                Search Talent
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Results */}
            {loading ? (
                <div className="loading-screen"><div className="loading-spinner" /></div>
            ) : students.length > 0 ? (
                <>
                    <div className="results-header">
                        <span className="results-count">
                            <Sparkles size={16} />
                            {pagination.total} talented candidates found
                        </span>
                    </div>

                    <div className="students-grid">
                        {students.map(student => (
                            <Card key={student._id} className="student-card premium-card" hoverable>
                                <div className="student-header">
                                    <div className="student-avatar">
                                        {student.name?.firstName?.[0]}{student.name?.lastName?.[0]}
                                    </div>
                                    <div className="student-info">
                                        <h3>{student.name?.firstName} {student.name?.lastName}</h3>
                                        <p>{student.department} • {student.batch}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        icon={Star}
                                        className="shortlist-btn"
                                        onClick={() => handleShortlist(student)}
                                        disabled={shortlistingId === student._id}
                                    >
                                        {shortlistingId === student._id ? 'Adding...' : 'Shortlist'}
                                    </Button>
                                </div>

                                <div className="student-details">
                                    <div className="detail-item">
                                        <span className="detail-label">CGPA</span>
                                        <span className="detail-value cgpa-badge">{student.cgpa?.toFixed(2) || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">College</span>
                                        <span className="detail-value">{student.college?.name || '-'}</span>
                                    </div>
                                </div>

                                {student.skills?.length > 0 && (
                                    <div className="student-skills">
                                        {student.skills.slice(0, 5).map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                        {student.skills.length > 5 && (
                                            <span className="skill-more">+{student.skills.length - 5}</span>
                                        )}
                                    </div>
                                )}

                                <div className="student-actions">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        icon={Eye}
                                        onClick={() => viewStudentDetails(student._id)}
                                    >
                                        View Details
                                    </Button>
                                </div>

                                <div className="student-links">
                                    {student.email && (
                                        <a href={`mailto:${student.email}`} title="Email" className="link-btn">
                                            <Mail size={16} />
                                        </a>
                                    )}
                                    {student.linkedinUrl && (
                                        <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="link-btn linkedin">
                                            <Linkedin size={16} />
                                        </a>
                                    )}
                                    {student.githubUrl && (
                                        <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub" className="link-btn github">
                                            <Github size={16} />
                                        </a>
                                    )}
                                    {student.resumeUrl && (
                                        <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" title="Resume" className="link-btn resume">
                                            <FileText size={16} />
                                        </a>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <Button
                                variant="secondary"
                                disabled={pagination.current === 1}
                                onClick={() => searchStudents(pagination.current - 1)}
                            >
                                Previous
                            </Button>
                            <span className="page-info">Page {pagination.current} of {pagination.pages}</span>
                            <Button
                                variant="secondary"
                                disabled={pagination.current === pagination.pages}
                                onClick={() => searchStudents(pagination.current + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="no-results">
                    <div className="no-results-icon">
                        <Search size={48} />
                    </div>
                    <h3>Discover Top Talent</h3>
                    <p>Use the filters above to find candidates matching your requirements</p>
                </div>
            )}

            {/* Shortlist Modal - Select Job */}
            <Modal
                isOpen={shortlistModal.open}
                onClose={() => setShortlistModal({ open: false, student: null })}
                title="Shortlist Candidate"
                size="md"
            >
                <div className="shortlist-modal">
                    <p className="modal-subtitle">
                        Shortlist <strong>{shortlistModal.student?.name?.firstName} {shortlistModal.student?.name?.lastName}</strong> for a position
                    </p>

                    <div className="input-wrapper" style={{ marginTop: 'var(--spacing-4)' }}>
                        <label className="input-label"><Briefcase size={14} /> Select Job *</label>
                        <select
                            className="input"
                            value={selectedJobForShortlist}
                            onChange={(e) => setSelectedJobForShortlist(e.target.value)}
                        >
                            <option value="">-- Select a Job --</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>
                                    {job.title} ({job.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-wrapper" style={{ marginTop: 'var(--spacing-3)' }}>
                        <label className="input-label">Notes (optional)</label>
                        <textarea
                            className="input"
                            value={shortlistNotes}
                            onChange={(e) => setShortlistNotes(e.target.value)}
                            placeholder="Add any notes about this candidate..."
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions" style={{ marginTop: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => setShortlistModal({ open: false, student: null })}>
                            Cancel
                        </Button>
                        <Button onClick={confirmShortlist} icon={Star}>
                            Shortlist
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Student Detail Modal */}
            <Modal
                isOpen={studentDetailModal.open}
                onClose={() => setStudentDetailModal({ open: false, student: null, loading: false })}
                title="Student Profile"
                size="lg"
            >
                {studentDetailModal.loading ? (
                    <div className="loading-screen" style={{ padding: 'var(--spacing-8)' }}>
                        <div className="loading-spinner" />
                    </div>
                ) : studentDetailModal.student && (
                    <div className="student-detail-modal">
                        {/* Header Section */}
                        <div className="detail-header">
                            <div className="detail-avatar">
                                {studentDetailModal.student.name?.firstName?.[0]}
                                {studentDetailModal.student.name?.lastName?.[0]}
                            </div>
                            <div className="detail-header-info">
                                <h2>{studentDetailModal.student.name?.firstName} {studentDetailModal.student.name?.lastName}</h2>
                                <p>{studentDetailModal.student.department} • Batch {studentDetailModal.student.batch}</p>
                                <p className="college-name">{studentDetailModal.student.college?.name}</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="detail-section">
                            <h4><Mail size={16} /> Contact Information</h4>
                            <div className="detail-grid">
                                <div className="detail-field">
                                    <span className="field-label">Email</span>
                                    <span className="field-value">{studentDetailModal.student.email}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="field-label">Phone</span>
                                    <span className="field-value">{studentDetailModal.student.phone || 'Not provided'}</span>
                                </div>
                                {studentDetailModal.student.dateOfBirth && (
                                    <div className="detail-field">
                                        <span className="field-label">Date of Birth</span>
                                        <span className="field-value">{new Date(studentDetailModal.student.dateOfBirth).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {studentDetailModal.student.gender && (
                                    <div className="detail-field">
                                        <span className="field-label">Gender</span>
                                        <span className="field-value" style={{ textTransform: 'capitalize' }}>{studentDetailModal.student.gender.replace('_', ' ')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="detail-section">
                            <h4><GraduationCap size={16} /> Academic Information</h4>
                            <div className="detail-grid">
                                <div className="detail-field">
                                    <span className="field-label">Roll Number</span>
                                    <span className="field-value">{studentDetailModal.student.rollNumber}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="field-label">CGPA</span>
                                    <span className="field-value cgpa-highlight">{studentDetailModal.student.cgpa?.toFixed(2) || '-'}</span>
                                </div>
                                {studentDetailModal.student.percentage && (
                                    <div className="detail-field">
                                        <span className="field-label">Percentage</span>
                                        <span className="field-value">{studentDetailModal.student.percentage}%</span>
                                    </div>
                                )}
                                <div className="detail-field">
                                    <span className="field-label">Active Backlogs</span>
                                    <span className="field-value">{studentDetailModal.student.backlogs?.active || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Education History */}
                        {studentDetailModal.student.education && (
                            <div className="detail-section">
                                <h4><Award size={16} /> Education History</h4>
                                <div className="education-grid">
                                    {studentDetailModal.student.education.tenth?.percentage && (
                                        <div className="education-card">
                                            <span className="edu-level">10th</span>
                                            <span className="edu-percent">{studentDetailModal.student.education.tenth.percentage}%</span>
                                            <span className="edu-board">{studentDetailModal.student.education.tenth.board}</span>
                                            <span className="edu-year">{studentDetailModal.student.education.tenth.yearOfPassing}</span>
                                        </div>
                                    )}
                                    {studentDetailModal.student.education.twelfth?.percentage && (
                                        <div className="education-card">
                                            <span className="edu-level">12th</span>
                                            <span className="edu-percent">{studentDetailModal.student.education.twelfth.percentage}%</span>
                                            <span className="edu-board">{studentDetailModal.student.education.twelfth.board}</span>
                                            <span className="edu-year">{studentDetailModal.student.education.twelfth.yearOfPassing}</span>
                                        </div>
                                    )}
                                    {studentDetailModal.student.education.diploma?.percentage && (
                                        <div className="education-card">
                                            <span className="edu-level">Diploma</span>
                                            <span className="edu-percent">{studentDetailModal.student.education.diploma.percentage}%</span>
                                            <span className="edu-board">{studentDetailModal.student.education.diploma.branch}</span>
                                            <span className="edu-year">{studentDetailModal.student.education.diploma.yearOfPassing}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {studentDetailModal.student.skills?.length > 0 && (
                            <div className="detail-section">
                                <h4><Sparkles size={16} /> Skills</h4>
                                <div className="skills-list">
                                    {studentDetailModal.student.skills.map((skill, i) => (
                                        <span key={i} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {studentDetailModal.student.certifications?.length > 0 && (
                            <div className="detail-section">
                                <h4><Award size={16} /> Certifications</h4>
                                <div className="certifications-list">
                                    {studentDetailModal.student.certifications.map((cert, i) => (
                                        <div key={i} className="cert-item">
                                            <strong>{cert.name}</strong>
                                            <span>{cert.issuer}</span>
                                            {cert.credentialUrl && (
                                                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">View Credential</a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {studentDetailModal.student.projects?.length > 0 && (
                            <div className="detail-section">
                                <h4><Briefcase size={16} /> Projects</h4>
                                <div className="projects-list">
                                    {studentDetailModal.student.projects.map((project, i) => (
                                        <div key={i} className="project-item">
                                            <h5>{project.title}</h5>
                                            <p>{project.description}</p>
                                            {project.technologies?.length > 0 && (
                                                <div className="project-tech">
                                                    {project.technologies.map((tech, j) => (
                                                        <span key={j} className="tech-tag">{tech}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="project-links">
                                                {project.projectUrl && (
                                                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink size={14} /> Live Demo
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                                        <Github size={14} /> Source Code
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        <div className="detail-section">
                            <h4><ExternalLink size={16} /> Links & Resume</h4>
                            <div className="links-grid">
                                {studentDetailModal.student.resumeUrl && (
                                    <a href={studentDetailModal.student.resumeUrl} target="_blank" rel="noopener noreferrer" className="profile-link resume">
                                        <FileText size={18} /> Resume
                                    </a>
                                )}
                                {studentDetailModal.student.linkedinUrl && (
                                    <a href={studentDetailModal.student.linkedinUrl} target="_blank" rel="noopener noreferrer" className="profile-link linkedin">
                                        <Linkedin size={18} /> LinkedIn
                                    </a>
                                )}
                                {studentDetailModal.student.githubUrl && (
                                    <a href={studentDetailModal.student.githubUrl} target="_blank" rel="noopener noreferrer" className="profile-link github">
                                        <Github size={18} /> GitHub
                                    </a>
                                )}
                                {studentDetailModal.student.portfolioUrl && (
                                    <a href={studentDetailModal.student.portfolioUrl} target="_blank" rel="noopener noreferrer" className="profile-link portfolio">
                                        <ExternalLink size={18} /> Portfolio
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Placement Status */}
                        <div className="detail-section">
                            <h4><User size={16} /> Placement Status</h4>
                            <span className={`placement-status-badge status-${studentDetailModal.student.placementStatus}`}>
                                {studentDetailModal.student.placementStatus?.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Footer Actions */}
                        <div className="detail-footer">
                            <Button variant="secondary" onClick={() => setStudentDetailModal({ open: false, student: null, loading: false })}>
                                Close
                            </Button>
                            <Button icon={Star} onClick={() => {
                                setStudentDetailModal({ open: false, student: null, loading: false });
                                handleShortlist(studentDetailModal.student);
                            }}>
                                Shortlist
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SearchStudents;
