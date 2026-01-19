import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Eye, Edit, Trash2, Users, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './Jobs.css';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, job: null });

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    const fetchJobs = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, status: filter || undefined };
            const response = await jobAPI.getJobs(params);
            setJobs(response.data.data.jobs);
            setPagination(response.data.data.pagination);
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async (id) => {
        try {
            await jobAPI.closeJob(id, 'closed');
            toast.success('Job closed successfully');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to close job');
        }
    };

    const handleDelete = async () => {
        try {
            await jobAPI.deleteJob(deleteModal.job._id);
            toast.success('Job deleted successfully');
            setDeleteModal({ open: false, job: null });
            fetchJobs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete job');
        }
    };

    const columns = [
        { header: 'Title', accessor: 'title' },
        {
            header: 'Type',
            accessor: 'type',
            render: (val) => (
                <span className={`job-type-badge type-${val}`}>
                    {val?.replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (val) => (
                <span className={`status-badge status-${val}`}>
                    {val}
                </span>
            )
        },
        {
            header: 'Applications',
            accessor: 'stats',
            render: (val) => val?.totalApplications || 0
        },
        {
            header: 'Deadline',
            accessor: 'applicationDeadline',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (id, row) => (
                <div className="action-buttons">
                    <Link to={`/company/jobs/${id}/applicants`}>
                        <button className="action-btn" title="View Applicants">
                            <Users size={16} />
                        </button>
                    </Link>
                    <Link to={`/company/jobs/${id}/edit`}>
                        <button className="action-btn" title="Edit">
                            <Edit size={16} />
                        </button>
                    </Link>
                    {row.status === 'open' && (
                        <button
                            className="action-btn action-btn-warning"
                            title="Close Job"
                            onClick={() => handleClose(id)}
                        >
                            <XCircle size={16} />
                        </button>
                    )}
                    {row.stats?.totalApplications === 0 && (
                        <button
                            className="action-btn action-btn-danger"
                            title="Delete"
                            onClick={() => setDeleteModal({ open: true, job: row })}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="jobs-page">
            <div className="page-header">
                <div>
                    <h1>My Jobs</h1>
                    <p>Manage your job postings and view applications</p>
                </div>
                <Link to="/company/jobs/new">
                    <Button icon={Plus}>Post New Job</Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === '' ? 'active' : ''}`}
                    onClick={() => setFilter('')}
                >
                    All
                </button>
                <button
                    className={`filter-tab ${filter === 'open' ? 'active' : ''}`}
                    onClick={() => setFilter('open')}
                >
                    Open
                </button>
                <button
                    className={`filter-tab ${filter === 'closed' ? 'active' : ''}`}
                    onClick={() => setFilter('closed')}
                >
                    Closed
                </button>
                <button
                    className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
                    onClick={() => setFilter('draft')}
                >
                    Draft
                </button>
            </div>

            {/* Jobs Table */}
            <div className="table-container">
                <Table
                    columns={columns}
                    data={jobs}
                    loading={loading}
                    emptyMessage="No jobs yet. Post your first job!"
                />
                <Pagination
                    current={pagination.current}
                    total={pagination.total}
                    onPageChange={(page) => fetchJobs(page)}
                />
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, job: null })}
                title="Delete Job"
                size="sm"
            >
                <div className="delete-modal">
                    <p>Are you sure you want to delete <strong>{deleteModal.job?.title}</strong>?</p>
                    <p className="warning-text">This action cannot be undone.</p>
                    <div className="modal-actions">
                        <Button variant="secondary" onClick={() => setDeleteModal({ open: false, job: null })}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Jobs;
