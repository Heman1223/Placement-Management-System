import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import Table, { Pagination } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Eye, Edit, Trash2, Users, XCircle, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import './Jobs.css';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [filter, setFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, job: null });
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-dropdown-wrapper')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        { 
            header: 'Title', 
            accessor: 'title',
            render: (val, row) => (
                <Link to={`/company/jobs/${row._id}`} className="text-primary-600 hover:text-primary-800 font-medium">
                    {val}
                </Link>
            )
        },
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
                <div className="action-dropdown-wrapper">
                    <button
                        className="action-dropdown-trigger"
                        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
                    >
                        <MoreVertical size={18} />
                    </button>
                    {openDropdown === id && (
                        <div className="action-dropdown-menu">
                            <Link 
                                to={`/company/jobs/${id}?tab=applicants`}
                                className="action-dropdown-item"
                                onClick={() => setOpenDropdown(null)}
                            >
                                <Users size={16} />
                                <span>View Applicants ({row.stats?.totalApplications || 0})</span>
                            </Link>
                            <Link 
                                to={`/company/jobs/${id}/edit`}
                                className="action-dropdown-item"
                                onClick={() => setOpenDropdown(null)}
                            >
                                <Edit size={16} />
                                <span>Edit Job</span>
                            </Link>
                            {row.status === 'open' && (
                                <button
                                    className="action-dropdown-item warning"
                                    onClick={() => {
                                        handleClose(id);
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <XCircle size={16} />
                                    <span>Close Job</span>
                                </button>
                            )}
                            {row.stats?.totalApplications === 0 && (
                                <button
                                    className="action-dropdown-item danger"
                                    onClick={() => {
                                        setDeleteModal({ open: true, job: row });
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <Trash2 size={16} />
                                    <span>Delete Job</span>
                                </button>
                            )}
                        </div>
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
