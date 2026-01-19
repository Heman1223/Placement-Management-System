import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './StudentForm.css';

const StudentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState([]);

    const [formData, setFormData] = useState({
        name: { firstName: '', lastName: '' },
        email: '',
        phone: '',
        gender: '',
        department: '',
        batch: new Date().getFullYear(),
        rollNumber: '',
        cgpa: '',
        backlogs: { active: 0, history: 0 },
        education: {
            tenth: { percentage: '', board: '' },
            twelfth: { percentage: '', board: '', stream: '' }
        },
        skills: [],
        linkedinUrl: '',
        githubUrl: '',
        resumeUrl: ''
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        fetchDepartments();
        if (isEdit) fetchStudent();
    }, [id]);

    const fetchDepartments = async () => {
        try {
            const response = await collegeAPI.getDepartments();
            setDepartments(response.data.data);
        } catch (error) {
            console.error('Failed to load departments');
        }
    };

    const fetchStudent = async () => {
        setLoading(true);
        try {
            const response = await collegeAPI.getStudent(id);
            setFormData(response.data.data);
        } catch (error) {
            toast.error('Failed to load student data');
            navigate('/college/students');
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

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const removeSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (isEdit) {
                await collegeAPI.updateStudent(id, formData);
                toast.success('Student updated successfully');
            } else {
                await collegeAPI.addStudent(formData);
                toast.success('Student added successfully');
            }
            navigate('/college/students');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save student');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    const batches = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 4 + i);

    return (
        <div className="student-form-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/college/students')}>
                    <ArrowLeft size={20} />
                    <span>Back to Students</span>
                </button>
                <h1>{isEdit ? 'Edit Student' : 'Add New Student'}</h1>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <Card title="Personal Information" className="form-card">
                    <div className="form-grid">
                        <Input
                            label="First Name"
                            value={formData.name.firstName}
                            onChange={(e) => handleChange('name.firstName', e.target.value)}
                            required
                        />
                        <Input
                            label="Last Name"
                            value={formData.name.lastName}
                            onChange={(e) => handleChange('name.lastName', e.target.value)}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                        />
                        <Input
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            required
                        />
                        <div className="input-wrapper">
                            <label className="input-label">Gender</label>
                            <select
                                className="input"
                                value={formData.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Academic Information */}
                <Card title="Academic Information" className="form-card">
                    <div className="form-grid">
                        <div className="input-wrapper">
                            <label className="input-label">Department <span className="input-required">*</span></label>
                            <select
                                className="input"
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                                <option value="__new">+ Add New</option>
                            </select>
                        </div>
                        <div className="input-wrapper">
                            <label className="input-label">Batch <span className="input-required">*</span></label>
                            <select
                                className="input"
                                value={formData.batch}
                                onChange={(e) => handleChange('batch', parseInt(e.target.value))}
                                required
                            >
                                {batches.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Roll Number"
                            value={formData.rollNumber}
                            onChange={(e) => handleChange('rollNumber', e.target.value)}
                            required
                        />
                        <Input
                            label="CGPA"
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={formData.cgpa}
                            onChange={(e) => handleChange('cgpa', parseFloat(e.target.value))}
                        />
                        <Input
                            label="Active Backlogs"
                            type="number"
                            min="0"
                            value={formData.backlogs.active}
                            onChange={(e) => handleChange('backlogs.active', parseInt(e.target.value))}
                        />
                        <Input
                            label="Backlog History"
                            type="number"
                            min="0"
                            value={formData.backlogs.history}
                            onChange={(e) => handleChange('backlogs.history', parseInt(e.target.value))}
                        />
                    </div>
                </Card>

                {/* Education History */}
                <Card title="Education History" className="form-card">
                    <div className="education-section">
                        <h4>10th Standard</h4>
                        <div className="form-grid">
                            <Input
                                label="Percentage"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.education.tenth.percentage}
                                onChange={(e) => handleChange('education.tenth.percentage', parseFloat(e.target.value))}
                            />
                            <Input
                                label="Board"
                                value={formData.education.tenth.board}
                                onChange={(e) => handleChange('education.tenth.board', e.target.value)}
                                placeholder="e.g., CBSE, ICSE, State Board"
                            />
                        </div>
                    </div>
                    <div className="education-section">
                        <h4>12th Standard</h4>
                        <div className="form-grid">
                            <Input
                                label="Percentage"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.education.twelfth.percentage}
                                onChange={(e) => handleChange('education.twelfth.percentage', parseFloat(e.target.value))}
                            />
                            <Input
                                label="Board"
                                value={formData.education.twelfth.board}
                                onChange={(e) => handleChange('education.twelfth.board', e.target.value)}
                            />
                            <Input
                                label="Stream"
                                value={formData.education.twelfth.stream}
                                onChange={(e) => handleChange('education.twelfth.stream', e.target.value)}
                                placeholder="e.g., Science, Commerce"
                            />
                        </div>
                    </div>
                </Card>

                {/* Skills */}
                <Card title="Skills" className="form-card">
                    <div className="skills-input">
                        <Input
                            placeholder="Add a skill..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill} icon={Plus}>Add</Button>
                    </div>
                    <div className="skills-list">
                        {formData.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                                <button type="button" onClick={() => removeSkill(index)}>
                                    <Trash2 size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </Card>

                {/* Links */}
                <Card title="Profile Links" className="form-card">
                    <div className="form-grid">
                        <Input
                            label="LinkedIn URL"
                            type="url"
                            value={formData.linkedinUrl}
                            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                            placeholder="https://linkedin.com/in/..."
                        />
                        <Input
                            label="GitHub URL"
                            type="url"
                            value={formData.githubUrl}
                            onChange={(e) => handleChange('githubUrl', e.target.value)}
                            placeholder="https://github.com/..."
                        />
                        <Input
                            label="Resume URL"
                            type="url"
                            value={formData.resumeUrl}
                            onChange={(e) => handleChange('resumeUrl', e.target.value)}
                            placeholder="Link to resume"
                            fullWidth
                        />
                    </div>
                </Card>

                {/* Actions */}
                <div className="form-actions">
                    <Button type="button" variant="secondary" onClick={() => navigate('/college/students')}>
                        Cancel
                    </Button>
                    <Button type="submit" icon={Save} loading={saving}>
                        {isEdit ? 'Update Student' : 'Add Student'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
