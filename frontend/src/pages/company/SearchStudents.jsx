import { useState, useEffect } from 'react';
import { companyAPI, jobAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Search, Filter, Star, ExternalLink, Mail, Github, Linkedin, Building2, GraduationCap, Sparkles } from 'lucide-react';
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

    const handleShortlist = async (student) => {
        // Get first available job or shortlist without job
        const defaultJob = jobs.length > 0 ? jobs[0]._id : null;

        if (!defaultJob) {
            toast.error('No active jobs available. Please create a job first.');
            return;
        }

        setShortlistingId(student._id);
        try {
            await companyAPI.shortlist(student._id, defaultJob, '');
            toast.success(`${student.name?.firstName} shortlisted successfully!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to shortlist');
        } finally {
            setShortlistingId(null);
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
        </div>
    );
};

export default SearchStudents;
