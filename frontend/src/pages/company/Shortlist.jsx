import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI, jobAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Star, Download, Calendar, MessageSquare, CheckCircle, XCircle, Building2, Users, Sparkles, TrendingUp, Eye, GraduationCap, Award, Briefcase, Mail, Phone, ExternalLink, Linkedin, Github, FileText, User, Search, Trash2, Send, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Shortlist.css';

const Shortlist = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedCollege, setSelectedCollege] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [starFilter, setStarFilter] = useState(''); // Added
    const [actionModal, setActionModal] = useState({ open: false, application: null, action: '' });
    const [remarks, setRemarks] = useState('');
    const [notesModal, setNotesModal] = useState({ open: false, application: null });
    const [newNote, setNewNote] = useState('');
    const [downloadLimits, setDownloadLimits] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        fetchJobs();
        fetchColleges();
        fetchDownloadLimits();
    }, []);

    useEffect(() => {
        fetchShortlist();
    }, [selectedJob, selectedCollege, statusFilter, starFilter, keyword]);

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
                status: statusFilter || undefined,
                isStarStudent: starFilter || undefined,
                search: keyword || undefined
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

    const viewStudentDetails = (studentId) => {
        navigate(`/company/students/${studentId}`);
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
                        <div className="flex items-center gap-2">
                            <span className="student-name">
                                {student?.name?.firstName} {student?.name?.lastName}
                            </span>
                            {student?.isStarStudent && (
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                            )}
                        </div>
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
        <div className="shortlist-page-new">
            <div className="shortlist-main-header">
                <div className="header-left-group">
                    <h1 className="header-primary-title">Selection Pipeline</h1>
                    <div className="p-badge badge-status ml-4 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold rounded flex items-center gap-1">
                        <TrendingUp size={12} />
                        FOR NEXT PROCESS
                    </div>
                    {downloadLimits && (
                        <div className="limit-badge-green">
                            {downloadLimits.dailyRemaining}/{downloadLimits.dailyLimit} DAILY
                        </div>
                    )}
                </div>
                
                <div className="header-right-controls">
                    <div className="input-with-icon-wrapper search-top">
                        <Search size={18} className="input-icon-left" />
                        <input 
                            type="text" 
                            className="search-input-premium"
                            placeholder="Find in shortlisted..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onFocus={() => setShowFilters(true)}
                        />
                    </div>
                    <Button
                        icon={Download}
                        onClick={handleExportCSV}
                        disabled={exporting || applications.length === 0}
                        variant="secondary"
                    >
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="shortlist-stats-grid">
                <div className="stat-card-premium shortlist-total-card">
                    <span className="stat-label">SHORTLISTED</span>
                    <div className="stat-main-row">
                        <span className="stat-count-main">{pipelineStats.shortlisted || 0}</span>
                        <div className="flex flex-col">
                            <span className="stat-trend-blue">+0 today</span>
                        </div>
                    </div>
                    <div className="stat-progress-track">
                        <div className="stat-progress-fill" style={{ width: '40%' }}></div>
                    </div>
                </div>

                <div className="stat-card-premium interviewed-card">
                    <span className="stat-label">INTERVIEWED</span>
                    <div className="stat-main-row">
                        <span className="stat-count-main">{pipelineStats.interviewed || 0}</span>
                        <div className="flex flex-col">
                            <span className="stat-trend-blue">+0 today</span>
                        </div>
                    </div>
                    <div className="stat-progress-track">
                        <div className="stat-progress-fill" style={{ width: '20%', background: '#60a5fa' }}></div>
                    </div>
                </div>

                <div className="stat-card-premium offered-card">
                    <span className="stat-label">OFFERED</span>
                    <div className="stat-main-row">
                        <span className="stat-count-main">{pipelineStats.offered || 0}</span>
                        <div className="flex flex-col">
                            <span className="stat-trend-blue">+0 today</span>
                        </div>
                    </div>
                    <div className="stat-progress-track">
                        <div className="stat-progress-fill" style={{ width: '15%', background: '#a78bfa' }}></div>
                    </div>
                </div>

                <div className="stat-card-premium hired-card">
                    <span className="stat-label">HIRED</span>
                    <div className="stat-main-row">
                        <span className="stat-count-main">{pipelineStats.hired || 0}</span>
                        <div className="flex flex-col">
                            <span className="stat-trend-blue">+0 today</span>
                        </div>
                    </div>
                    <div className="stat-progress-track">
                        <div className="stat-progress-fill" style={{ width: '10%', background: '#10b981' }}></div>
                    </div>
                </div>
            </div>

            {/* Candidates Section */}
            <div className="candidates-section-card glass-card">
                <div className="candidates-card-header">
                    <h2>Candidates</h2>
                </div>
                
                <div className="candidates-list-wrapper">
                    {showFilters && (
                        <div className="list-filters-premium animate-in fade-in slide-in-from-top-2">
                            <div className="filters-row-3">
                                <div className="filter-group">
                                    <label>College</label>
                                    <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}>
                                        <option value="">All Colleges</option>
                                        {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Job</label>
                                    <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                                        <option value="">All Jobs</option>
                                        {jobs.map(job => <option key={job._id} value={job._id}>{job.title}</option>)}
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Status</label>
                                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="candidates-table-premium">
                        <div className="table-column-header-premium">
                            <span className="col-info">STUDENT INFORMATION</span>
                            <span className="col-job">JOB APPLIED</span>
                            <span className="col-cgpa">CGPA</span>
                            <span className="col-status">STATUS</span>
                            <span className="col-date">APPLIED DATE</span>
                            <span className="col-actions">ACTIONS</span>
                        </div>
                        {loading ? (
                            <div className="flex justify-center p-12"><div className="loading-spinner" /></div>
                        ) : applications.length === 0 ? (
                            <div className="empty-state-card-mini">No shortlisted candidates found.</div>
                        ) : (
                            applications.map((app) => (
                                <div key={app._id} className="student-row-premium">
                                    <div className="col-info student-info-cell">
                                        <div className="student-avatar-premium">
                                            {app.student?.name?.firstName?.[0]}{app.student?.name?.lastName?.[0]}
                                        </div>
                                        <div className="student-text-group">
                                            <h4>{app.student?.name?.firstName} {app.student?.name?.lastName}</h4>
                                            <p>{app.student?.department} • {app.student?.batch}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-job">
                                        <div className="job-tag-premium">{app.job?.title}</div>
                                    </div>

                                    <div className="col-cgpa">
                                        <span className="cgpa-badge">{app.student?.cgpa?.toFixed(2) || '-'}</span>
                                    </div>

                                    <div className="col-status">
                                        <div className={`status-pill-premium status-${app.status}`}>
                                            {app.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    <div className="col-date">
                                        <span className="date-text">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}</span>
                                    </div>

                                    <div className="col-actions">
                                        <div className="action-button-group">
                                            <button className="row-action-btn view" title="View Profile" onClick={() => viewStudentDetails(app.student?._id)}><Eye size={16} /></button>
                                            <button className="row-action-btn note" title="Add Note" onClick={() => setNotesModal({ open: true, application: app })}><MessageSquare size={16} /></button>
                                            
                                            {getStatusOptions(app.status).includes('interviewed') && (
                                                <button className="row-action-btn interview" title="Mark Interviewed" onClick={() => setActionModal({ open: true, application: app, action: 'interviewed' })}><PlayCircle size={16} /></button>
                                            )}
                                            {getStatusOptions(app.status).includes('offered') && (
                                                <button className="row-action-btn offer" title="Send Offer" onClick={() => setActionModal({ open: true, application: app, action: 'offered' })}><Send size={16} /></button>
                                            )}
                                            {getStatusOptions(app.status).includes('hired') && (
                                                <button className="row-action-btn hire" title="Mark Hired" onClick={() => setActionModal({ open: true, application: app, action: 'hired' })}><Award size={16} /></button>
                                            )}
                                            
                                            {app.status !== 'rejected' && (
                                                <button className="row-action-btn reject" title="Reject Candidate" onClick={() => setActionModal({ open: true, application: app, action: 'rejected' })}><XCircle size={16} /></button>
                                            )}
                                            
                                            {app.status !== 'hired' && (
                                                <button className="row-action-btn remove" title="Remove from Shortlist" onClick={() => handleRemoveFromShortlist(app)}><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="pagination-premium">
                    <Pagination
                        current={pagination.current}
                        total={pagination.total}
                        onPageChange={(page) => fetchShortlist(page)}
                    />
                </div>
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
        </div>
    );
};

export default Shortlist;
