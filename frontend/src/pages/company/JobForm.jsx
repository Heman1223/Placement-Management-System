import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './JobForm.css';

const JobForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'full_time',
        category: '',
        locations: [''],
        workMode: 'onsite',
        salary: { min: '', max: '', period: 'per_annum' },
        duration: { value: '', unit: 'months' },
        eligibility: {
            minCgpa: '',
            maxBacklogs: 0,
            allowedDepartments: [],
            allowedBatches: [],
            requiredSkills: []
        },
        applicationDeadline: '',
        status: 'draft'
    });

    const [newDept, setNewDept] = useState('');
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (isEdit) fetchJob();
    }, [id]);

    const fetchJob = async () => {
        setLoading(true);
        try {
            const response = await jobAPI.getJob(id);
            const job = response.data.data;
            setFormData({
                ...job,
                applicationDeadline: job.applicationDeadline?.split('T')[0] || ''
            });
        } catch (error) {
            toast.error('Failed to load job');
            navigate('/company/jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (path, value) => {
        setFormData(prev => {
            const keys = path.split('.');
            const newData = { ...prev };
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const addLocation = () => {
        setFormData(prev => ({
            ...prev,
            locations: [...prev.locations, '']
        }));
    };

    const updateLocation = (index, value) => {
        setFormData(prev => ({
            ...prev,
            locations: prev.locations.map((loc, i) => i === index ? value : loc)
        }));
    };

    const removeLocation = (index) => {
        setFormData(prev => ({
            ...prev,
            locations: prev.locations.filter((_, i) => i !== index)
        }));
    };

    const addDepartment = () => {
        if (newDept.trim() && !formData.eligibility.allowedDepartments.includes(newDept.trim())) {
            setFormData(prev => ({
                ...prev,
                eligibility: {
                    ...prev.eligibility,
                    allowedDepartments: [...prev.eligibility.allowedDepartments, newDept.trim()]
                }
            }));
            setNewDept('');
        }
    };

    const removeDepartment = (index) => {
        setFormData(prev => ({
            ...prev,
            eligibility: {
                ...prev.eligibility,
                allowedDepartments: prev.eligibility.allowedDepartments.filter((_, i) => i !== index)
            }
        }));
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.eligibility.requiredSkills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                eligibility: {
                    ...prev.eligibility,
                    requiredSkills: [...prev.eligibility.requiredSkills, newSkill.trim()]
                }
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            eligibility: {
                ...prev.eligibility,
                requiredSkills: prev.eligibility.requiredSkills.filter((_, i) => i !== index)
            }
        }));
    };

    const toggleBatch = (year) => {
        setFormData(prev => ({
            ...prev,
            eligibility: {
                ...prev.eligibility,
                allowedBatches: prev.eligibility.allowedBatches.includes(year)
                    ? prev.eligibility.allowedBatches.filter(y => y !== year)
                    : [...prev.eligibility.allowedBatches, year]
            }
        }));
    };

    const handleSubmit = async (e, publish = false) => {
        e.preventDefault();
        setSaving(true);

        const data = {
            ...formData,
            status: publish ? 'open' : formData.status,
            locations: formData.locations.filter(l => l.trim())
        };

        try {
            if (isEdit) {
                await jobAPI.updateJob(id, data);
                toast.success('Job updated successfully');
            } else {
                await jobAPI.createJob(data);
                toast.success(publish ? 'Job published successfully' : 'Job saved as draft');
            }
            navigate('/company/jobs');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save job');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    const currentYear = new Date().getFullYear();
    const batches = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

    return (
        <div className="job-form-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/company/jobs')}>
                    <ArrowLeft size={20} />
                    <span>Back to Jobs</span>
                </button>
                <h1>{isEdit ? 'Edit Job' : 'Post New Job'}</h1>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)}>
                {/* Basic Info */}
                <Card title="Job Details" className="form-card">
                    <div className="form-grid">
                        <Input
                            label="Job Title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="e.g., Software Engineer"
                            required
                        />
                        <div className="input-wrapper">
                            <label className="input-label">Job Type <span className="input-required">*</span></label>
                            <select
                                className="input"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                required
                            >
                                <option value="full_time">Full Time</option>
                                <option value="internship">Internship</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>
                        <Input
                            label="Category"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            placeholder="e.g., Software Development"
                        />
                        <div className="input-wrapper">
                            <label className="input-label">Work Mode</label>
                            <select
                                className="input"
                                value={formData.workMode}
                                onChange={(e) => handleChange('workMode', e.target.value)}
                            >
                                <option value="onsite">On-site</option>
                                <option value="remote">Remote</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-wrapper" style={{ marginTop: 'var(--spacing-4)' }}>
                        <label className="input-label">Description <span className="input-required">*</span></label>
                        <textarea
                            className="input"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe the role, responsibilities, and requirements..."
                            rows={5}
                            required
                        />
                    </div>
                </Card>

                {/* Locations */}
                <Card title="Locations" className="form-card">
                    <div className="locations-list">
                        {formData.locations.map((loc, index) => (
                            <div key={index} className="location-item">
                                <Input
                                    value={loc}
                                    onChange={(e) => updateLocation(index, e.target.value)}
                                    placeholder="e.g., Mumbai, Bangalore"
                                />
                                {formData.locations.length > 1 && (
                                    <button type="button" className="remove-btn" onClick={() => removeLocation(index)}>
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="ghost" icon={Plus} onClick={addLocation}>
                            Add Location
                        </Button>
                    </div>
                </Card>

                {/* Compensation */}
                <Card title="Compensation" className="form-card">
                    <div className="form-grid">
                        <Input
                            label={formData.type === 'internship' ? 'Stipend (per month)' : 'Min Salary'}
                            type="number"
                            value={formData.type === 'internship' ? formData.stipend?.amount : formData.salary.min}
                            onChange={(e) => handleChange(
                                formData.type === 'internship' ? 'stipend.amount' : 'salary.min',
                                e.target.value
                            )}
                            placeholder="Amount in INR"
                        />
                        {formData.type !== 'internship' && (
                            <Input
                                label="Max Salary"
                                type="number"
                                value={formData.salary.max}
                                onChange={(e) => handleChange('salary.max', e.target.value)}
                                placeholder="Amount in INR"
                            />
                        )}
                        {formData.type === 'internship' && (
                            <div className="form-grid">
                                <Input
                                    label="Duration"
                                    type="number"
                                    value={formData.duration.value}
                                    onChange={(e) => handleChange('duration.value', e.target.value)}
                                    placeholder="e.g., 3"
                                />
                                <div className="input-wrapper">
                                    <label className="input-label">Unit</label>
                                    <select
                                        className="input"
                                        value={formData.duration.unit}
                                        onChange={(e) => handleChange('duration.unit', e.target.value)}
                                    >
                                        <option value="weeks">Weeks</option>
                                        <option value="months">Months</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Eligibility */}
                <Card title="Eligibility Criteria" className="form-card">
                    <div className="form-grid">
                        <Input
                            label="Minimum CGPA"
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={formData.eligibility.minCgpa}
                            onChange={(e) => handleChange('eligibility.minCgpa', parseFloat(e.target.value))}
                            placeholder="e.g., 7.0"
                        />
                        <Input
                            label="Maximum Backlogs Allowed"
                            type="number"
                            min="0"
                            value={formData.eligibility.maxBacklogs}
                            onChange={(e) => handleChange('eligibility.maxBacklogs', parseInt(e.target.value))}
                        />
                    </div>

                    {/* Departments */}
                    <div className="eligibility-section">
                        <label className="input-label">Allowed Departments</label>
                        <div className="tag-input">
                            <Input
                                value={newDept}
                                onChange={(e) => setNewDept(e.target.value)}
                                placeholder="e.g., Computer Science"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDepartment())}
                            />
                            <Button type="button" onClick={addDepartment}>Add</Button>
                        </div>
                        <div className="tags-list">
                            {formData.eligibility.allowedDepartments.map((dept, i) => (
                                <span key={i} className="tag">
                                    {dept}
                                    <button type="button" onClick={() => removeDepartment(i)}><Trash2 size={12} /></button>
                                </span>
                            ))}
                            {formData.eligibility.allowedDepartments.length === 0 && (
                                <span className="tag-hint">All departments allowed</span>
                            )}
                        </div>
                    </div>

                    {/* Batches */}
                    <div className="eligibility-section">
                        <label className="input-label">Allowed Batches</label>
                        <div className="batch-selector">
                            {batches.map(year => (
                                <button
                                    key={year}
                                    type="button"
                                    className={`batch-btn ${formData.eligibility.allowedBatches.includes(year) ? 'selected' : ''}`}
                                    onClick={() => toggleBatch(year)}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="eligibility-section">
                        <label className="input-label">Required Skills</label>
                        <div className="tag-input">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="e.g., JavaScript"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            />
                            <Button type="button" onClick={addSkill}>Add</Button>
                        </div>
                        <div className="tags-list">
                            {formData.eligibility.requiredSkills.map((skill, i) => (
                                <span key={i} className="tag tag-skill">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(i)}><Trash2 size={12} /></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Deadline */}
                <Card title="Timeline" className="form-card">
                    <Input
                        label="Application Deadline"
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={(e) => handleChange('applicationDeadline', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </Card>

                {/* Actions */}
                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={() => navigate('/company/jobs')}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="secondary" loading={saving}>
                        Save as Draft
                    </Button>
                    <Button type="button" icon={Save} loading={saving} onClick={(e) => handleSubmit(e, true)}>
                        {isEdit ? 'Update & Publish' : 'Publish Job'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default JobForm;
