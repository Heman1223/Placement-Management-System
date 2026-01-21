import { useState, useEffect } from 'react';
import { companyAPI, jobAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Star, Download, Calendar, MessageSquare, CheckCircle, XCircle, Building2, Users, Sparkles, TrendingUp, Eye, GraduationCap, Award, Briefcase, Mail, Phone, ExternalLink, Linkedin, Github, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';
import './Shortlist.css';

const Shortlist = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [jobs, setJobs] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedCollege, setSelectedCollege] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [actionModal, setActionModal] = useState({ open: false, application: null, action: '' });
    const [remarks, setRemarks] = useState('');
    const [studentDetailModal, setStudentDetailModal] = useState({ open: false, student: null, loading: false });
    const [notesModal, setNotesModal] = useState({ open: false, application: null });
    const [newNote, setNewNote] = useState('');
    const [downloadLimits, setDownloadLimits] = useState(null);

    useEffect(() => {
        fetchJobs();
        fetchColleges();
        fetchDownloadLimits();
    }, []);

    useEffect(() => {
        fetchShortlist();
    }, [selectedJob, selectedCollege, statusFilter]);

    const fetchJobs = async () => {
        try {
            const response = await jobAPI.getJobs({});
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

    const fetchDownloadLimits = async () => {
        try {
            const response = await companyAPI.getDownloadStats();
            setDownloadLimits(response.data.data.limits);
        } catch (error) {
            console.error('Failed to fetch download limits');
        }
    };

    const fetchShortlist = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                jobId: selectedJob || undefined,
                status: statusFilter || undefined
            };
            const response = await companyAPI.getShortlist(params);
            let apps = response.data.data.applications;

            // Client-side college filter (since backend may not support it directly)
            if (selectedCollege) {
                apps = apps.filter(app => app.student?.college?._id === selectedCollege || app.student?.college === selectedCollege);
            }

            setApplications(apps);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load shortlist');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        // Check if export would exceed limits
        if (downloadLimits && applications.length > 0) {
            const canExport = applications.length <= downloadLimits.dailyRemaining && 
                            applications.length <= downloadLimits.monthlyRemaining;
            
            if (!canExport) {
                toast.error(`Cannot export ${applications.length} records. Daily remaining: ${downloadLimits.dailyRemaining}, Monthly remaining: ${downloadLimits.monthlyRemaining}`);
                return;
            }
        }

        setExporting(true);
        try {
            const params = {
                jobId: selectedJob || undefined,
                status: statusFilter || undefined
            };
            const response = await companyAPI.exportShortlist(params);

            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `shortlist_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('CSV downloaded successfully!');
            
            // Refresh download limits
            fetchDownloadLimits();
        } catch (error) {
            if (error.response?.status === 429) {
                toast.error(error.response.data.message || 'Download limit exceeded');
            } else {
                toast.error('Failed to export CSV');
            }
        } finally {
            setExporting(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await companyAPI.updateShortlistStatus(actionModal.application._id, {
                status: actionModal.action,
                notes: remarks
            });
            toast.success(`Status updated to ${actionModal.action}`);
            setActionModal({ open: false, application: null, action: '' });
            setRemarks('');
            fetchShortlist();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error('Please enter a note');
            return;
        }

        try {
            await companyAPI.addShortlistNote(notesModal.application._id, newNote);
            toast.success('Note added successfully');
            setNotesModal({ open: false, application: null });
            setNewNote('');
            fetchShortlist();
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    const handleRemoveFromShortlist = async (application) => {
        if (!confirm(`Remove ${application.student?.name?.firstName} ${application.student?.name?.lastName} from shortlist?`)) {
            return;
        }

        try {
            await companyAPI.removeFromShortlist(application._id);
            toast.success('Removed from shortlist');
            fetchShortlist();
        } catch (error) {
            toast.error('Failed to remove from shortlist');
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

    const getStatusOptions = (currentStatus) => {
        const flow = {
            'shortlisted': ['interviewed', 'rejected'],
            'interviewed': ['offered', 'rejected'],
            'offered': ['hired', 'rejected'],
            'hired': [],
            'rejected': []
        };
        return flow[currentStatus] || [];
    };

    const columns = [
        {
            header: 'Student',
            accessor: 'student',
            render: (student) => (
                <div className="student-cell">
                    <div className="student-avatar-sm">
                        {student?.name?.firstName?.[0]}{student?.name?.lastName?.[0]}
                    </div>
                    <div>
                        <span className="student-name">
                            {student?.name?.firstName} {student?.name?.lastName}
                        </span>
                        <span className="student-dept">{student?.department} • {student?.batch}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Job',
            accessor: 'job',
            render: (job) => (
                <span className="job-badge">{job?.title || '-'}</span>
            )
        },
        {
            header: 'CGPA',
            accessor: 'student',
            render: (student) => (
                <span className="cgpa-value">{student?.cgpa?.toFixed(2) || '-'}</span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (val) => (
                <span className={`status-badge status-${val}`}>
                    {val?.replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Applied',
            accessor: 'appliedAt',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (id, row) => {
                const options = getStatusOptions(row.status);

                return (
                    <div className="action-buttons">
                        <button
                            className="action-btn action-btn-view"
                            title="View Details"
                            onClick={() => viewStudentDetails(row.student?._id)}
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            className="action-btn action-btn-secondary"
                            title="Add Note"
                            onClick={() => setNotesModal({ open: true, application: row })}
                        >
                            <MessageSquare size={16} />
                        </button>
                        {options.includes('interviewed') && (
                            <button
                                className="action-btn action-btn-info"
                                title="Mark as Interviewed"
                                onClick={() => setActionModal({ open: true, application: row, action: 'interviewed' })}
                            >
                                <Calendar size={16} />
                            </button>
                        )}
                        {options.includes('offered') && (
                            <button
                                className="action-btn action-btn-warning"
                                title="Send Offer"
                                onClick={() => setActionModal({ open: true, application: row, action: 'offered' })}
                            >
                                <CheckCircle size={16} />
                            </button>
                        )}
                        {options.includes('hired') && (
                            <button
                                className="action-btn action-btn-success"
                                title="Mark as Hired"
                                onClick={() => setActionModal({ open: true, application: row, action: 'hired' })}
                            >
                                <CheckCircle size={16} />
                            </button>
                        )}
                        {options.includes('rejected') && (
                            <button
                                className="action-btn action-btn-danger"
                                title="Reject"
                                onClick={() => setActionModal({ open: true, application: row, action: 'rejected' })}
                            >
                                <XCircle size={16} />
                            </button>
                        )}
                        {row.status !== 'hired' && row.status !== 'rejected' && (
                            <button
                                className="action-btn action-btn-danger"
                                title="Remove from Shortlist"
                                onClick={() => handleRemoveFromShortlist(row)}
                            >
                                <XCircle size={16} />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'interviewed', label: 'Interviewed' },
        { value: 'offered', label: 'Offered' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' }
    ];

    // Calculate pipeline stats
    const pipelineStats = {
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
        interviewed: applications.filter(a => a.status === 'interviewed').length,
        offered: applications.filter(a => a.status === 'offered').length,
        hired: applications.filter(a => a.status === 'hired').length
    };

    return (
        <div className="shortlist-page">
            <div className="page-header shortlist-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Star size={28} />
                    </div>
                    <div className="header-text">
                        <h1>Shortlisted Candidates</h1>
                        <p>Manage your hiring pipeline efficiently</p>
                        {downloadLimits && (
                            <div className="download-limits-info">
                                <span>Daily: {downloadLimits.dailyRemaining}/{downloadLimits.dailyLimit}</span>
                                <span>•</span>
                                <span>Monthly: {downloadLimits.monthlyRemaining}/{downloadLimits.monthlyLimit}</span>
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    icon={Download}
                    onClick={handleExportCSV}
                    disabled={exporting || applications.length === 0}
                    className="export-btn"
                >
                    {exporting ? 'Exporting...' : 'Download CSV'}
                </Button>
            </div>

            {/* Filters */}
            <div className="shortlist-filters glass-card">
                <div className="input-wrapper">
                    <label className="input-label"><Building2 size={14} /> College</label>
                    <select
                        className="input"
                        value={selectedCollege}
                        onChange={(e) => setSelectedCollege(e.target.value)}
                    >
                        <option value="">All Colleges</option>
                        {colleges.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="input-wrapper">
                    <label className="input-label">Filter by Job</label>
                    <select
                        className="input"
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                    >
                        <option value="">All Jobs</option>
                        {jobs.map(job => (
                            <option key={job._id} value={job._id}>{job.title}</option>
                        ))}
                    </select>
                </div>
                <div className="input-wrapper">
                    <label className="input-label">Status</label>
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Pipeline Summary */}
            <div className="pipeline-summary">
                <div className="pipeline-stage stage-shortlisted">
                    <div className="stage-icon"><Star size={20} /></div>
                    <div className="stage-content">
                        <span className="stage-count">{pipelineStats.shortlisted}</span>
                        <span className="stage-label">Shortlisted</span>
                    </div>
                </div>
                <div className="pipeline-connector"></div>
                <div className="pipeline-stage stage-interviewed">
                    <div className="stage-icon"><Calendar size={20} /></div>
                    <div className="stage-content">
                        <span className="stage-count">{pipelineStats.interviewed}</span>
                        <span className="stage-label">Interviewed</span>
                    </div>
                </div>
                <div className="pipeline-connector"></div>
                <div className="pipeline-stage stage-offered">
                    <div className="stage-icon"><MessageSquare size={20} /></div>
                    <div className="stage-content">
                        <span className="stage-count">{pipelineStats.offered}</span>
                        <span className="stage-label">Offered</span>
                    </div>
                </div>
                <div className="pipeline-connector"></div>
                <div className="pipeline-stage stage-hired">
                    <div className="stage-icon"><CheckCircle size={20} /></div>
                    <div className="stage-content">
                        <span className="stage-count">{pipelineStats.hired}</span>
                        <span className="stage-label">Hired</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container glass-card">
                <Table
                    columns={columns}
                    data={applications}
                    loading={loading}
                    emptyMessage="No shortlisted candidates yet"
                />
                <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    onPageChange={(page) => fetchShortlist(page)}
                />
            </div>

            {/* Action Modal */}
            <Modal
                isOpen={actionModal.open}
                onClose={() => setActionModal({ open: false, application: null, action: '' })}
                title={`Update Status to "${actionModal.action}"`}
                size="sm"
            >
                <div className="action-modal">
                    <p>
                        Update status for <strong>
                            {actionModal.application?.student?.name?.firstName} {actionModal.application?.student?.name?.lastName}
                        </strong> to <strong className={`status-text-${actionModal.action}`}>{actionModal.action}</strong>?
                    </p>

                    <div className="input-wrapper" style={{ marginTop: 'var(--spacing-4)' }}>
                        <label className="input-label">Remarks (optional)</label>
                        <textarea
                            className="input"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add any notes..."
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        <Button variant="secondary" onClick={() => setActionModal({ open: false, application: null, action: '' })}>
                            Cancel
                        </Button>
                        <Button
                            variant={actionModal.action === 'rejected' ? 'danger' : 'primary'}
                            onClick={handleStatusUpdate}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Notes Modal */}
            <Modal
                isOpen={notesModal.open}
                onClose={() => setNotesModal({ open: false, application: null })}
                title="Add Note"
                size="sm"
            >
                <div className="notes-modal">
                    <p>
                        Add a note for <strong>
                            {notesModal.application?.student?.name?.firstName} {notesModal.application?.student?.name?.lastName}
                        </strong>
                    </p>

                    {notesModal.application?.companyNotes && (
                        <div className="existing-notes">
                            <h4>Previous Notes:</h4>
                            <div className="notes-content">
                                {notesModal.application.companyNotes}
                            </div>
                        </div>
                    )}

                    <div className="input-wrapper" style={{ marginTop: 'var(--spacing-4)' }}>
                        <label className="input-label">New Note *</label>
                        <textarea
                            className="input"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Enter your note here..."
                            rows={4}
                        />
                    </div>

                    <div className="modal-actions">
                        <Button variant="secondary" onClick={() => setNotesModal({ open: false, application: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddNote}>
                            Add Note
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
                                        </div>
                                    )}
                                    {studentDetailModal.student.education.twelfth?.percentage && (
                                        <div className="education-card">
                                            <span className="edu-level">12th</span>
                                            <span className="edu-percent">{studentDetailModal.student.education.twelfth.percentage}%</span>
                                            <span className="edu-board">{studentDetailModal.student.education.twelfth.board}</span>
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
                            </div>
                        </div>

                        {/* Placement Status */}
                        <div className="detail-section">
                            <h4><User size={16} /> Placement Status</h4>
                            <span className={`placement-status-badge status-${studentDetailModal.student.placementStatus}`}>
                                {studentDetailModal.student.placementStatus?.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Footer */}
                        <div className="detail-footer">
                            <Button variant="secondary" onClick={() => setStudentDetailModal({ open: false, student: null, loading: false })}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Shortlist;
