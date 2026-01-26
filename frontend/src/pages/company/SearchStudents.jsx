import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { companyAPI, jobAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Search, Filter, Star, ExternalLink, Mail, Github, Linkedin, Building2, GraduationCap, Sparkles, Briefcase, Eye, ChevronDown, ChevronUp, Clock, MapPin, X, Award, FileText, Lock, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import './SearchStudents.css';

const StudentCard = ({ student, onShortlist, onInvite, viewDetails, shortlistingId }) => (
    <Card className="student-card" hoverable>
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
                        </div>
                    )}
                </div>
                <p>{student.department}</p>
                {student.college && (
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                        {student.college.logo ? (
                            <img src={student.college.logo} alt="" className="w-3.5 h-3.5 object-contain opacity-70" />
                        ) : (
                            <Building2 size={12} className="opacity-70" />
                        )}
                        <span>{student.college.name}</span>
                    </div>
                )}
            </div>
            {student.registeredJob ? (
                <Button
                    size="sm"
                    className="shortlist-icon-btn bg-blue-600"
                    onClick={() => onShortlist(student)}
                    title="Move to Pipeline"
                    disabled={shortlistingId === student._id}
                >
                    <Star size={18} className="fill-current" />
                </Button>
            ) : student.hasInvitation ? (
                <div className="invitation-sent-badge" title={`Offer sent for ${student.invitationJob}`}>
                    <Mail size={16} className="text-green-400" />
                    <span className="text-xs font-bold text-green-400">Sent</span>
                </div>
            ) : (
                <Button
                    size="sm"
                    className="shortlist-icon-btn bg-slate-700"
                    onClick={() => onInvite(student)}
                    title="Send Recruitment Offer"
                    disabled={shortlistingId === student._id}
                >
                    <Sparkles size={18} />
                </Button>
            )}
        </div>
        <div className="student-tags">
            <span className="tag batch-tag">Batch {student.batch}</span>
            <span className="tag cgpa-tag">CGPA: {student.cgpa?.toFixed(2)}</span>
        </div>
        {student.registeredJob && (
            <div className="registered-for-pill">
                <div className="dot-blink" />
                <span>Registered For: <strong>{student.registeredJob}</strong></span>
            </div>
        )}
        {student.hasInvitation && !student.registeredJob && (
            <div className="invitation-pill">
                <Mail size={14} className="text-green-400" />
                <span>Offer Sent: <strong>{student.invitationJob}</strong></span>
            </div>
        )}
        <div className="student-skills-preview">
            {student.skills?.slice(0, 3).map((skill, i) => (
                <span key={i} className="skill-pill">{skill}</span>
            ))}
            {student.skills?.length > 3 && <span>+{student.skills.length - 3}</span>}
        </div>
        <div className="student-card-actions">
            <Button variant="secondary" fullWidth onClick={() => viewDetails(student._id)}>
                View Profile
            </Button>
        </div>
    </Card>
);

const SearchStudents = () => {
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    // Data for dropdowns
    const [jobs, setJobs] = useState([]);
    const [colleges, setColleges] = useState([]);

    // UI States
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState(null); 

    // Action States
    const [shortlistingId, setShortlistingId] = useState(null);
    const [shortlistModal, setShortlistModal] = useState({ open: false, student: null });
    const [inviteModal, setInviteModal] = useState({ open: false, student: null });
    const [selectedJobForInvite, setSelectedJobForInvite] = useState('');
    const [shortlistNotes, setShortlistNotes] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [isInviting, setIsInviting] = useState(false);

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
        experience: '',
        isStarStudent: ''
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
        // Load all students initially
        searchStudents(1);
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

    // Effect for Real-time Search - now works with or without college selection
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchStudents(1);
        }, 500); // Debounce search by 500ms
        return () => clearTimeout(timeoutId);
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
            experience: '',
            isStarStudent: ''
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
        setLoading(true);
        setHasSearched(true);
        try {
            const params = {
                ...searchFilters,
                page,
                limit: 12
            };

            // Add college filter only if a college is selected
            if (selectedCollege?._id) {
                params.college = selectedCollege._id;
            }

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
            experience: '',
            isStarStudent: ''
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
        const student = shortlistModal.student;
        setShortlistingId(student._id);
        const modalStudentName = student.name?.firstName;
        setShortlistModal({ open: false, student: null });

        try {
            await companyAPI.shortlist(student._id, student.registeredJobId, shortlistNotes);
            toast.success(`${modalStudentName} moved to selection pipeline!`);
        } catch (error) {
            console.error('Shortlist error:', error);
            const msg = error.response?.data?.message || 'Failed to shortlist';
            toast.error(msg);
        } finally {
            setShortlistingId(null);
        }
    };

    const handleInvite = (student) => {
        if (jobs.length === 0) {
            toast.error('No active job drives available to send offers for.');
            return;
        }
        setSelectedJobForInvite('');
        setInviteMessage('');
        setInviteModal({ open: true, student });
    };

    const confirmInvite = async () => {
        if (!selectedJobForInvite) {
            toast.error('Please select a job drive');
            return;
        }

        setIsInviting(true);
        const student = inviteModal.student;
        try {
            await companyAPI.inviteToRegister(student._id, selectedJobForInvite, inviteMessage);
            toast.success(`Recruitment offer sent to ${student.name?.firstName}!`);
            setInviteModal({ open: false, student: null });
        } catch (error) {
            toast.error('Failed to send recruitment offer');
        } finally {
            setIsInviting(false);
        }
    };

    const viewStudentDetails = (studentId) => {
        navigate(`/company/students/${studentId}`);
    };

    const departments = [
        'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
        'Civil', 'Electrical', 'Chemical', 'Biotechnology'
    ];

    const batches = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

    const handleRequestAccess = async () => {
        if (!selectedCollege) return;
        try {
            await companyAPI.requestCollegeAccess({ collegeId: selectedCollege._id });
            toast.success('Partnership request sent successfully');
            // Optimistically update UI
            setColleges(prev => prev.map(c => 
                c._id === selectedCollege._id ? { ...c, accessStatus: 'pending' } : c
            ));
            // Update selected college object to reflect new status immediately
            setSelectedCollege(prev => ({ ...prev, accessStatus: 'pending' }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    // Check lock status
    const isCollegeLocked = selectedCollege?.isLocked;
    const accessStatus = selectedCollege?.accessStatus;

    return (
        <div className="search-page">
            <div className="search-header-simple">
                <div className="flex flex-col">
                    <h1>Talent Pool</h1>
                    <p className="text-slate-500 text-sm font-medium">Discover and identify high-potential candidates across all partner colleges</p>
                </div>
            </div>

            {/* Main Search Section - Always Visible */}
            <div className="search-container">
                {/* Selected College Banner (if any) */}
                {selectedCollege && (
                    <div className="active-college-banner">
                        <div className="college-info">
                            <Building2 size={20} />
                            <span>Filtering by college: <strong>{selectedCollege.name}</strong></span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleBackToCollegeSelect}>Clear Filter</Button>
                    </div>
                )}

                {/* Search Bar & Filters */}
                <Card className="search-card">
                    <div className="keyword-search-bar">
                        <Input
                            placeholder="Search by name, skills, or keywords..."
                            value={filters.keyword}
                            onChange={(e) => handleFilterChange('keyword', e.target.value)}
                            onClick={() => setShowFilters(!showFilters)}
                            icon={Search}
                            className="main-search-input"
                        />
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
                                    <label>College</label>
                                    <select
                                        className="filter-select"
                                        value={selectedCollege?._id || ''}
                                        onChange={(e) => handleCollegeSelect(e.target.value)}
                                    >
                                        <option value="">All Colleges</option>
                                        {colleges.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
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
                                    <select
                                        className="filter-select mt-2"
                                        value={filters.isStarStudent}
                                        onChange={(e) => handleFilterChange('isStarStudent', e.target.value)}
                                    >
                                        <option value="">All Students</option>
                                        <option value="true">⭐ Star Students Only</option>
                                        <option value="false">Non-Star Students</option>
                                    </select>
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
                    {isCollegeLocked ? (
                         <div className="locked-college-state p-12 text-center bg-slate-800/50 rounded-2xl border border-white/10">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Restricted</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                {selectedCollege.name} does not share student data publicly. You must request a partnership to view their candidates.
                            </p>
                            
                            {accessStatus === 'pending' ? (
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/10 text-yellow-600 rounded-xl font-bold border border-yellow-500/20">
                                    <Clock size={20} />
                                    Request Pending Approval
                                </div>
                            ) : (
                                <button 
                                    onClick={handleRequestAccess}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25"
                                >
                                    Request Partnership
                                </button>
                            )}
                        </div>
                    ) : loading ? (
                        <div className="loading-screen"><div className="loading-spinner" /></div>
                    ) : students.length === 0 ? (
                        <div className="no-results-state">
                            <h3>No candidates found</h3>
                            <p>Try adjusting your search filters to see more results.</p>
                            <Button variant="secondary" onClick={handleClearFilters}>Clear Filters</Button>
                        </div>
                    ) : (
                        <>
                            <div className="results-header pt-4">
                                <span className="font-bold text-slate-500 text-xs uppercase tracking-widest">Search Results ({pagination.total})</span>
                            </div>

                            {/* Section: Direct Applicants */}
                            {students.some(s => s.registeredJob) && (
                                <div className="applicants-section mt-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                <Briefcase size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-white leading-tight">Direct Applicants</h2>
                                                <p className="text-xs text-slate-500 font-medium tracking-tight">Candidates who have already registered for your placement drives</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="students-grid mb-12">
                                        {students.filter(s => s.registeredJob).map(student => (
                                            <StudentCard 
                                                key={`applicant-${student._id}`} 
                                                student={student} 
                                                onShortlist={handleShortlist}
                                                onInvite={handleInvite}
                                                viewDetails={viewStudentDetails}
                                                shortlistingId={shortlistingId}
                                            />
                                        ))}
                                    </div>
                                    <div className="section-divider-premium mb-12" style={{ height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0))' }} />
                                </div>
                            )}

                            {/* Section: Talent Discovery */}
                            <div className="discovery-section">
                                {students.some(s => s.registeredJob) && (
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white leading-tight">Talent Discovery</h2>
                                            <p className="text-xs text-slate-500 font-medium tracking-tight">Discover potential candidates and send direct recruitment offers</p>
                                        </div>
                                    </div>
                                )}
                                <div className="students-grid">
                                    {students.filter(s => !s.registeredJob).map(student => (
                                        <StudentCard 
                                            key={`discovery-${student._id}`} 
                                            student={student} 
                                            onShortlist={handleShortlist}
                                            onInvite={handleInvite}
                                            viewDetails={viewStudentDetails}
                                            shortlistingId={shortlistingId}
                                        />
                                    ))}
                                    {students.filter(s => !s.registeredJob).length === 0 && students.some(s => s.registeredJob) && (
                                        <div className="p-12 text-center bg-slate-800/20 rounded-2xl border border-dashed border-white/5">
                                            <p className="text-slate-500 text-sm">All students in these results have already registered for your drives.</p>
                                        </div>
                                    )}
                                </div>
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

            {/* Shortlist Modal */}
            <Modal
                isOpen={shortlistModal.open}
                onClose={() => setShortlistModal({ open: false, student: null })}
                title="Shortlist Candidate"
                size="md"
            >
                <div className="shortlist-modal">
                    <p className="modal-subtitle">
                        Move <strong>{shortlistModal.student?.name?.firstName} {shortlistModal.student?.name?.lastName}</strong> to the selection pipeline for a drive they've registered for.
                    </p>

                    {shortlistModal.student?.registeredJob && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold">
                                <Briefcase size={16} />
                                <span>Registered For: {shortlistModal.student.registeredJob}</span>
                            </div>
                        </div>
                    )}

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

            {/* Invite Modal */}
            <Modal
                isOpen={inviteModal.open}
                onClose={() => setInviteModal({ open: false, student: null })}
                title="Send Recruitment Offer"
                size="md"
            >
                <div className="invite-modal p-4">
                    <p className="text-slate-400 mb-6 text-sm">
                        Send a high-priority recruitment offer to <strong>{inviteModal.student?.name?.firstName} {inviteModal.student?.name?.lastName}</strong>. 
                        They will receive a notification to register for your selected drive.
                    </p>

                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Link to Job Drive *</label>
                            <select
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 transition-all text-sm"
                                value={selectedJobForInvite}
                                onChange={(e) => setSelectedJobForInvite(e.target.value)}
                            >
                                <option value="">-- Select Drive --</option>
                                {jobs.map(job => (
                                    <option key={job._id} value={job._id}>{job.title} ({job.type})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Offer Details / Personal Message</label>
                            <textarea
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 transition-all text-sm"
                                value={inviteMessage}
                                onChange={(e) => setInviteMessage(e.target.value)}
                                placeholder="We've reviewed your profile and think you'd be a great fit for this role..."
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="secondary" onClick={() => setInviteModal({ open: false, student: null })}>
                            Cancel
                        </Button>
                        <Button onClick={confirmInvite} loading={isInviting} icon={Sparkles}>
                            Send Offer
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

        </div>
    );
};

export default SearchStudents;
