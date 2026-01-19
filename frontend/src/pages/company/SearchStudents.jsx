import { useState, useEffect } from 'react';
import { companyAPI, jobAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Search, Filter, Star, ExternalLink, Mail, Phone, Github, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import './SearchStudents.css';

const SearchStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [jobs, setJobs] = useState([]);
    const [showFilters, setShowFilters] = useState(true);
    const [shortlistModal, setShortlistModal] = useState({ open: false, student: null });
    const [selectedJob, setSelectedJob] = useState('');
    const [shortlistNote, setShortlistNote] = useState('');

    const [filters, setFilters] = useState({
        search: '',
        department: '',
        batch: '',
        minCgpa: '',
        maxBacklogs: '',
        skills: '',
        placementStatus: 'not_placed'
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await jobAPI.getJobs({ status: 'open' });
            setJobs(response.data.data.jobs);
        } catch (error) {
            console.error('Failed to fetch jobs');
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

    const handleShortlist = async () => {
        if (!selectedJob) {
            toast.error('Please select a job');
            return;
        }

        try {
            await companyAPI.shortlist(shortlistModal.student._id, selectedJob, shortlistNote);
            toast.success('Student shortlisted successfully');
            setShortlistModal({ open: false, student: null });
            setSelectedJob('');
            setShortlistNote('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to shortlist');
        }
    };

    const departments = [
        'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
        'Civil', 'Electrical', 'Chemical', 'Biotechnology'
    ];

    const batches = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

    return (
        <div className="search-page">
            <div className="page-header">
                <h1>Find Talent</h1>
                <p>Search and filter students based on your requirements</p>
            </div>

            {/* Filters */}
            <Card className="filters-card">
                <div className="filters-header">
                    <h3><Filter size={18} /> Filters</h3>
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
                                label="Search"
                                placeholder="Name, skills..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                icon={Search}
                            />
                        </div>

                        <div className="filter-row">
                            <div className="input-wrapper">
                                <label className="input-label">Department</label>
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

                        <div className="filter-row">
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
                        </div>

                        <div className="filter-row">
                            <Input
                                label="Skills (comma separated)"
                                placeholder="JavaScript, React, Python"
                                value={filters.skills}
                                onChange={(e) => handleFilterChange('skills', e.target.value)}
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
                                search: '', department: '', batch: '', minCgpa: '', maxBacklogs: '', skills: '', placementStatus: ''
                            })}>
                                Clear
                            </Button>
                            <Button onClick={handleSearch} icon={Search}>
                                Search
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
                        <span>{pagination.total} students found</span>
                    </div>

                    <div className="students-grid">
                        {students.map(student => (
                            <Card key={student._id} className="student-card" hoverable>
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
                                        onClick={() => setShortlistModal({ open: true, student })}
                                    >
                                        Shortlist
                                    </Button>
                                </div>

                                <div className="student-details">
                                    <div className="detail-item">
                                        <span className="detail-label">CGPA</span>
                                        <span className="detail-value">{student.cgpa?.toFixed(2) || '-'}</span>
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

                                <div className="student-links">
                                    {student.email && (
                                        <a href={`mailto:${student.email}`} title="Email">
                                            <Mail size={16} />
                                        </a>
                                    )}
                                    {student.linkedinUrl && (
                                        <a href={student.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                            <Linkedin size={16} />
                                        </a>
                                    )}
                                    {student.githubUrl && (
                                        <a href={student.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub">
                                            <Github size={16} />
                                        </a>
                                    )}
                                    {student.resumeUrl && (
                                        <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" title="Resume">
                                            <ExternalLink size={16} />
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
                            <span>Page {pagination.current} of {pagination.pages}</span>
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
                    <Search size={48} />
                    <h3>Search for students</h3>
                    <p>Use the filters above to find candidates matching your requirements</p>
                </div>
            )}

            {/* Shortlist Modal */}
            <Modal
                isOpen={shortlistModal.open}
                onClose={() => setShortlistModal({ open: false, student: null })}
                title="Shortlist Student"
                size="sm"
            >
                <div className="shortlist-modal">
                    <p>Shortlist <strong>{shortlistModal.student?.name?.firstName} {shortlistModal.student?.name?.lastName}</strong> for:</p>

                    <div className="input-wrapper">
                        <label className="input-label">Select Job *</label>
                        <select
                            className="input"
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                        >
                            <option value="">Choose a job</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-wrapper" style={{ marginTop: 'var(--spacing-4)' }}>
                        <label className="input-label">Notes (optional)</label>
                        <textarea
                            className="input"
                            value={shortlistNote}
                            onChange={(e) => setShortlistNote(e.target.value)}
                            placeholder="Add any notes about this candidate..."
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        <Button variant="secondary" onClick={() => setShortlistModal({ open: false, student: null })}>
                            Cancel
                        </Button>
                        <Button icon={Star} onClick={handleShortlist}>
                            Shortlist
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SearchStudents;
