import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { companyAPI, jobAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Search, Filter, Star, ExternalLink, Mail, Github, Linkedin, Building2, GraduationCap, Sparkles, Briefcase, Eye, ChevronDown, ChevronUp, Clock, MapPin, X, Award, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import './SearchStudents.css';

const SearchStudents = () => {
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [hasSearched, setHasSearched] = useState(false);
    
    // Data for dropdowns
    const [jobs, setJobs] = useState([]);
    const [colleges, setColleges] = useState([]);
    
    // UI States
    const [showFilters, setShowFilters] = useState(true);
    const [selectedCollege, setSelectedCollege] = useState(null); // New state for selected college
    
    // Action States
    const [shortlistingId, setShortlistingId] = useState(null);
    const [shortlistModal, setShortlistModal] = useState({ open: false, student: null });
    const [selectedJobForShortlist, setSelectedJobForShortlist] = useState('');
    const [shortlistNotes, setShortlistNotes] = useState('');
    const [studentDetailModal, setStudentDetailModal] = useState({ open: false, student: null, loading: false });

    // Filter States
    const [filters, setFilters] = useState({
        keyword: '',
        department: '',
        batch: '',
        minCgpa: '',
        maxBacklogs: '',
        skills: '',
        // college: '', // Removing college from generic filters as it's now a primary selection
        placementStatus: 'not_placed',
        experience: ''
    });

    // Saved Filters
    const [savedFilters, setSavedFilters] = useState([]);
    const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
    const [filterName, setFilterName] = useState('');
    const [showSavedFilters, setShowSavedFilters] = useState(false);

    useEffect(() => {
        fetchJobs();
        fetchColleges();
        fetchSavedFilters();
    }, []);

    // Effect to handle navigation from Partnerships page
    useEffect(() => {
        if (location.state?.collegeId && colleges.length > 0) {
            const college = colleges.find(c => c._id === location.state.collegeId);
            if (college) {
                setSelectedCollege(college);
                setHasSearched(true);
            }
        }
    }, [location.state, colleges]);

    // Effect for Real-time Search
    useEffect(() => {
        if (selectedCollege) {
            const timeoutId = setTimeout(() => {
                searchStudents(1);
            }, 500); // Debounce search by 500ms
            return () => clearTimeout(timeoutId);
        }
    }, [filters, selectedCollege]);


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

    const fetchSavedFilters = async () => {
        try {
            const response = await companyAPI.getSavedFilters();
            setSavedFilters(response.data.data);
        } catch (error) {
            console.error('Failed to fetch saved filters');
        }
    };

    const handleCollegeSelect = (collegeId) => {
        if (!collegeId) return;
        const college = colleges.find(c => c._id === collegeId);
        setSelectedCollege(college);
        // Initial search is handled by useEffect
    };

    const handleBackToCollegeSelect = () => {
        setSelectedCollege(null);
        setStudents([]);
        setHasSearched(false);
        setFilters({
            keyword: '',
            department: '',
            batch: '',
            minCgpa: '',
            maxBacklogs: '',
            skills: '',
            placementStatus: 'not_placed',
            experience: ''
        });
    };

    const handleSaveFilter = async () => {
        if (!filterName.trim()) {
            toast.error('Please enter a filter name');
            return;
        }

        try {
            await companyAPI.saveSearchFilter(filterName, { ...filters, college: selectedCollege?._id });
            toast.success('Filter saved successfully');
            setShowSaveFilterModal(false);
            setFilterName('');
            fetchSavedFilters();
        } catch (error) {
            toast.error('Failed to save filter');
        }
    };

    const handleLoadFilter = (savedFilter) => {
        const { college, ...restFilters } = savedFilter.filters;
        setFilters(restFilters);
        setShowSavedFilters(false);
        setHasSearched(true); 
        toast.success(`Loaded filter: ${savedFilter.name}`);
    };

    const handleDeleteFilter = async (name) => {
        if (!confirm(`Delete filter "${name}"?`)) return;

        try {
            await companyAPI.deleteSearchFilter(name);
            toast.success('Filter deleted');
            fetchSavedFilters();
        } catch (error) {
            toast.error('Failed to delete filter');
        }
    };

    const searchStudents = async (page = 1, searchFilters = filters) => {
        if (!selectedCollege) return;
        
        setLoading(true);
        setHasSearched(true);
        try {
            const params = {
                ...searchFilters,
                college: selectedCollege?._id, // Enforce selected college
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
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            keyword: '',
            department: '',
            batch: '',
            minCgpa: '',
            maxBacklogs: '',
            skills: '',
            placementStatus: '',
            experience: ''
        });
        // Search triggered by useEffect
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
        const modalStudentName = student.name?.firstName; 
        setShortlistModal({ open: false, student: null });

        try {
            await companyAPI.shortlist(student._id, selectedJobForShortlist, shortlistNotes);
            toast.success(`${modalStudentName} shortlisted successfully!`);
        } catch (error) {
            console.error('Shortlist error:', error);
            const msg = error.response?.data?.message || 'Failed to shortlist';
            toast.error(msg);
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
                        <p>Search and filter to find the perfect candidates</p>
                    </div>
                </div>
            </div>

            {/* College Selection View (Initial State) */}
            {!selectedCollege ? (
                <div className="college-selection-container">
                    <Card className="college-select-card">
                        <div className="select-icon-wrapper">
                            <Building2 size={48} />
                        </div>
                        <h2>Select a College to Begin</h2>
                        <p>Choose a college from the list below to view and filter their students.</p>
                        
                        <div className="college-select-wrapper">
                            <select 
                                className="college-main-select"
                                onChange={(e) => handleCollegeSelect(e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>Select College / Institute</option>
                                {colleges.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="select-arrow" size={20} />
                        </div>
                    </Card>
                </div>
            ) : (
                /* Main Search Section (After Selection) */
                <div className="search-container">
                    <div className="active-college-banner">
                        <div className="college-info">
                            <Building2 size={20} />
                            <span>Viewing students from: <strong>{selectedCollege.name}</strong></span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleBackToCollegeSelect}>Change College</Button>
                    </div>

                    {/* Search Bar & Filters */}
                    <Card className="search-card">
                        <div className="keyword-search-bar">
                            <Input
                                placeholder="Search by name, skills, or keywords..."
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                icon={Search}
                                className="main-search-input"
                            />
                            {/* Removed explicit Search button, search is now real-time */}
                            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={Filter}>
                                Filters
                            </Button>
                            {savedFilters.length > 0 && (
                                <Button variant="ghost" onClick={() => setShowSavedFilters(!showSavedFilters)}>
                                    Saved
                                </Button>
                            )}
                        </div>

                        {/* Expanded Filters */}
                        {showFilters && (
                            <div className="expanded-filters">
                                <div className="filters-grid">
                                    <div className="filter-column">
                                        <label>Academic</label>
                                        <select
                                            className="filter-select"
                                            value={filters.department}
                                            onChange={(e) => handleFilterChange('department', e.target.value)}
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <select
                                            className="filter-select mt-2"
                                            value={filters.batch}
                                            onChange={(e) => handleFilterChange('batch', e.target.value)}
                                        >
                                            <option value="">All Batches</option>
                                            {batches.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div className="filter-column">
                                        <label>Criteria</label>
                                        <div className="row-inputs">
                                            <Input
                                                type="number"
                                                placeholder="Min CGPA"
                                                value={filters.minCgpa}
                                                onChange={(e) => handleFilterChange('minCgpa', e.target.value)}
                                                step="0.1"
                                                max="10"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Max Backlogs"
                                                value={filters.maxBacklogs}
                                                onChange={(e) => handleFilterChange('maxBacklogs', e.target.value)}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="filter-column">
                                        <label>Details</label>
                                        {/* College select removed from here as it's global now */}
                                        <select
                                            className="filter-select"
                                            value={filters.placementStatus}
                                            onChange={(e) => handleFilterChange('placementStatus', e.target.value)}
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="not_placed">Not Placed</option>
                                            <option value="in_process">In Process</option>
                                        </select>
                                        <select
                                            className="filter-select mt-2"
                                            value={filters.experience}
                                            onChange={(e) => handleFilterChange('experience', e.target.value)}
                                        >
                                            <option value="">Any Experience</option>
                                            <option value="internship">Has Internship</option>
                                            <option value="projects">Has Projects</option>
                                        </select>
                                    </div>
                                    <div className="filter-column">
                                        <label>Skills & Experience</label>
                                        <Input
                                            placeholder="Specific Skills (comma separated)"
                                            value={filters.skills}
                                            onChange={(e) => handleFilterChange('skills', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="filter-footer">
                                    <Button variant="ghost" onClick={handleClearFilters} size="sm">
                                        Clear All
                                    </Button>
                                    <Button variant="ghost" onClick={() => setShowSaveFilterModal(true)} size="sm">
                                        Save as Preset
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Saved Filters Panel */}
                    {showSavedFilters && (
                        <div className="saved-filters-panel">
                            <div className="panel-header">
                                <h3>Saved Filters</h3>
                                <button onClick={() => setShowSavedFilters(false)}><X size={16} /></button>
                            </div>
                            <div className="saved-list">
                                {savedFilters.length === 0 ? (
                                    <p className="empty-msg">No saved filters</p>
                                ) : (
                                    savedFilters.map((sf, index) => (
                                        <div key={index} className="saved-filter-item">
                                            <span onClick={() => handleLoadFilter(sf)}>{sf.name}</span>
                                            <button onClick={() => handleDeleteFilter(sf.name)} className="delete-btn">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Results Area */}
                    <div className="results-container">
                        {loading ? (
                            <div className="loading-screen"><div className="loading-spinner" /></div>
                        ) : students.length === 0 ? (
                            <div className="no-results-state">
                                <h3>No candidates found</h3>
                                <p>Try adjusting your search filters to see more results.</p>
                                <Button variant="secondary" onClick={handleClearFilters}>Clear Filters</Button>
                            </div>
                        ) : (
                            <>
                                <div className="results-header">
                                    <span>Found {pagination.total} candidates</span>
                                </div>
                                <div className="students-grid">
                                    {students.map(student => (
                                        <Card key={student._id} className="student-card" hoverable>
                                            <div className="student-header">
                                                <div className="student-avatar-placeholder">
                                                    {student.name?.firstName?.[0]}{student.name?.lastName?.[0]}
                                                </div>
                                                <div className="student-basic-info">
                                                    <div className="flex items-center gap-2">
                                                        <h3>{student.name?.firstName} {student.name?.lastName}</h3>
                                                        {student.isStarStudent && (
                                                            <div className="group relative">
                                                                <Star size={16} className="text-amber-400 fill-amber-400" />
                                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                    Star Student
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p>{student.department}</p>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    className="shortlist-icon-btn"
                                                    onClick={() => handleShortlist(student)}
                                                    title="Shortlist"
                                                    disabled={shortlistingId === student._id}
                                                >
                                                    <Star size={18} />
                                                </Button>
                                            </div>
                                            <div className="student-tags">
                                                <span className="tag batch-tag">Batch {student.batch}</span>
                                                <span className="tag cgpa-tag">CGPA: {student.cgpa?.toFixed(2)}</span>
                                            </div>
                                            <div className="student-skills-preview">
                                                {student.skills?.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="skill-pill">{skill}</span>
                                                ))}
                                                {student.skills?.length > 3 && <span>+{student.skills.length - 3}</span>}
                                            </div>
                                            <div className="student-card-actions">
                                                <Button variant="secondary" fullWidth onClick={() => viewStudentDetails(student._id)}>
                                                    View Profile
                                                </Button>
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
                        )}
                    </div>
                </div>
            )}

            {/* Shortlist Modal */}
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
            
            <Modal
                isOpen={showSaveFilterModal}
                onClose={() => setShowSaveFilterModal(false)}
                title="Save Filter Preset"
                size="sm"
            >
                <div className="save-filter-modal">
                    <Input
                        label="Filter Name"
                        placeholder="e.g., CS High CGPA"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                    <div className="modal-actions mt-4">
                        <Button variant="secondary" onClick={() => setShowSaveFilterModal(false)}>Cancel</Button>
                        <Button onClick={handleSaveFilter}>Save Filter</Button>
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

                        {/* Contact */}
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

                        {/* Academic */}
                        <div className="detail-section">
                            <h4><GraduationCap size={16} /> Academic Information</h4>
                            <div className="detail-grid">
                                <div className="detail-field">
                                    <span className="field-label">CGPA</span>
                                    <span className="field-value cgpa-highlight">{studentDetailModal.student.cgpa?.toFixed(2) || '-'}</span>
                                </div>
                                <div className="detail-field">
                                    <span className="field-label">Backlogs</span>
                                    <span className="field-value">{studentDetailModal.student.backlogs?.active || 0}</span>
                                </div>
                            </div>
                        </div>

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
                                            <div className="project-links">
                                                {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Demo</a>}
                                                {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer"><Github size={14}/> Code</a>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resume */}
                        <div className="detail-section">
                            <h4><FileText size={16} /> Documents</h4>
                            {studentDetailModal.student.resumeUrl ? (
                                <a 
                                    href={studentDetailModal.student.resumeUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="profile-link resume"
                                >
                                    <FileText size={18}/> View Resume
                                </a>
                            ) : (
                                <p className="text-muted">No resume uploaded</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SearchStudents;
