import { useState, useEffect } from 'react';
import { companyAPI, jobAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Star, Download, Calendar, MessageSquare, CheckCircle, XCircle, Building2, Users, Sparkles, TrendingUp } from 'lucide-react';
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

    useEffect(() => {
        fetchJobs();
        fetchColleges();
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
        } catch (error) {
            toast.error('Failed to export CSV');
        } finally {
            setExporting(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await companyAPI.updateApplication(actionModal.application._id, {
                status: actionModal.action,
                remarks
            });
            toast.success(`Status updated to ${actionModal.action}`);
            setActionModal({ open: false, application: null, action: '' });
            setRemarks('');
            fetchShortlist();
        } catch (error) {
            toast.error('Failed to update status');
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
                if (options.length === 0) return null;

                return (
                    <div className="action-buttons">
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
                                <MessageSquare size={16} />
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
        </div>
    );
};

export default Shortlist;
