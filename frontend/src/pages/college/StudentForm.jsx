import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Plus, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './StudentForm.css';

const StudentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    console.log('StudentForm mounted:', { id, isEdit });

    const [loading, setLoading] = useState(isEdit); // Start with loading=true if editing
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState([]);

    const [formData, setFormData] = useState({
        name: { firstName: '', lastName: '' },
        email: '',
        phone: '',
        gender: '',
        department: '',
        course: '',
        batch: new Date().getFullYear(),
        admissionYear: new Date().getFullYear() - 4,
        section: '',
        rollNumber: '',
        cgpa: '',
        backlogs: { active: 0, history: 0 },
        city: '',
        state: '',
        enrollmentStatus: 'active',
        placementEligible: true,
        education: {
            tenth: { percentage: '', board: '' },
            twelfth: { percentage: '', board: '', stream: '' },
            ug: { institution: '', degree: '', percentage: '', year: '' },
            pg: { institution: '', degree: '', percentage: '', year: '' }
        },
        skills: [],
        linkedinUrl: '',
        githubUrl: '',
        resumeUrl: ''
    });

    // Common technical skills list
    const COMMON_SKILLS = [
        // Programming Languages
        'JavaScript', 'Python', 'Java', 'C++', 'C', 'TypeScript', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'C#', 'Scala', 'R',
        // Frontend
        'React', 'Angular', 'Vue.js', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'SASS', 'jQuery',
        // Backend
        'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Laravel', 'FastAPI', 'Ruby on Rails',
        // Databases
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Firebase', 'Cassandra', 'Elasticsearch',
        // Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Terraform', 'Ansible',
        // Mobile
        'React Native', 'Flutter', 'Android Development', 'iOS Development', 'SwiftUI',
        // Data Science & ML
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Data Analysis', 'NLP', 'Computer Vision',
        // Tools & Other
        'Linux', 'REST APIs', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'JIRA', 'Figma', 'UI/UX Design'
    ];

    const [newSkill, setNewSkill] = useState('');
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const skillInputRef = useRef(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadingResume, setUploadingResume] = useState(false);

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
            const studentData = response.data.data;

            // Ensure all nested objects are properly initialized
            setFormData({
                name: studentData.name || { firstName: '', lastName: '' },
                email: studentData.email || '',
                phone: studentData.phone || '',
                gender: studentData.gender || '',
                department: studentData.department || '',
                course: studentData.course || '',
                batch: studentData.batch || new Date().getFullYear(),
                admissionYear: studentData.admissionYear || new Date().getFullYear() - 4,
                section: studentData.section || '',
                rollNumber: studentData.rollNumber || '',
                cgpa: studentData.cgpa || '',
                backlogs: studentData.backlogs || { active: 0, history: 0 },
                city: studentData.city || '',
                state: studentData.state || '',
                enrollmentStatus: studentData.enrollmentStatus || 'active',
                placementEligible: studentData.placementEligible !== undefined ? studentData.placementEligible : true,
                education: {
                    tenth: studentData.education?.tenth || { percentage: '', board: '' },
                    twelfth: studentData.education?.twelfth || { percentage: '', board: '', stream: '' }
                },
                skills: studentData.skills || [],
                linkedinUrl: studentData.linkedinUrl || '',
                githubUrl: studentData.githubUrl || '',
                resumeUrl: studentData.resumeUrl || ''
            });
        } catch (error) {
            console.error('Error loading student:', error);
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

    // Skills dropdown handlers
    const handleSkillInputChange = (value) => {
        setNewSkill(value);
        if (value.trim()) {
            const filtered = COMMON_SKILLS.filter(
                skill => skill.toLowerCase().includes(value.toLowerCase()) &&
                    !formData.skills.includes(skill)
            ).slice(0, 10);
            setFilteredSkills(filtered);
            setShowSkillDropdown(true);
        } else {
            setFilteredSkills([]);
            setShowSkillDropdown(false);
        }
    };

    const selectSkill = (skill) => {
        if (!formData.skills.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }));
        }
        setNewSkill('');
        setShowSkillDropdown(false);
    };

    const addCustomSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
            setShowSkillDropdown(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // First upload resume if file is selected
            if (resumeFile) {
                setUploadingResume(true);
                const resumeFormData = new FormData();
                if (id) resumeFormData.append('studentId', id);
                resumeFormData.append('resume', resumeFile);

                try {
                    const uploadResponse = await collegeAPI.uploadResume(resumeFormData);
                    formData.resumeUrl = uploadResponse.data.data.url;
                } catch (uploadError) {
                    toast.error('Failed to upload resume');
                    setSaving(false);
                    setUploadingResume(false);
                    return;
                }
                setUploadingResume(false);
            }

            // Then save student data
            if (isEdit) {
                await collegeAPI.updateStudent(id, formData);
                toast.success('Student updated successfully');
            } else {
                const response = await collegeAPI.addStudent(formData);

                // Show credentials if provided
                if (response.data.data.credentials) {
                    const { email, password } = response.data.data.credentials;
                    toast.success(
                        `Student added successfully!\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}`,
                        { duration: 8000 }
                    );
                } else {
                    toast.success('Student added successfully');
                }
            }
            navigate('/college/students');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save student');
        } finally {
            setSaving(false);
        }
    };

    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a PDF or Word document');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setResumeFile(file);
        toast.success('Resume selected: ' + file.name);
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
                {/* 1. Basic Identity (Mandatory) */}
                <Card title="1️⃣ Basic Identity (Mandatory)" className="form-card">
                    <p className="text-sm text-gray-600 mb-4">These come from college records</p>
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
                            label="Roll Number / Registration Number"
                            value={formData.rollNumber}
                            onChange={(e) => handleChange('rollNumber', e.target.value)}
                            required
                        />
                        <Input
                            label="College Email ID"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                        />
                        <div className="input-wrapper">
                            <label className="input-label">Branch / Department <span className="input-required">*</span></label>
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
                            </select>
                        </div>
                        <div className="input-wrapper">
                            <label className="input-label">Course / Degree <span className="input-required">*</span></label>
                            <select
                                className="input"
                                value={formData.course}
                                onChange={(e) => handleChange('course', e.target.value)}
                                required
                            >
                                <option value="">Select Course</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="MBA">MBA</option>
                                <option value="MCA">MCA</option>
                                <option value="B.Sc">B.Sc</option>
                                <option value="M.Sc">M.Sc</option>
                                <option value="BBA">BBA</option>
                                <option value="BCA">BCA</option>
                                <option value="B.Com">B.Com</option>
                                <option value="M.Com">M.Com</option>
                                <option value="BA">BA</option>
                                <option value="MA">MA</option>
                                <option value="B.Pharm">B.Pharm</option>
                                <option value="M.Pharm">M.Pharm</option>
                                <option value="MBBS">MBBS</option>
                                <option value="BDS">BDS</option>
                                <option value="LLB">LLB</option>
                                <option value="LLM">LLM</option>
                            </select>
                        </div>
                        <div className="input-wrapper">
                            <label className="input-label">Graduation Year / Batch <span className="input-required">*</span></label>
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
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 2. Academic Information (Verified Data) */}
                <Card title="2️⃣ Academic Information (Verified Data)" className="form-card">
                    <p className="text-sm text-gray-600 mb-4">Data the college already trusts</p>
                    <div className="form-grid">
                        <Input
                            label="Current CGPA / Percentage"
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={formData.cgpa}
                            onChange={(e) => handleChange('cgpa', parseFloat(e.target.value))}
                            placeholder="Enter CGPA (0-10)"
                        />
                        <Input
                            label="Admission Year"
                            type="number"
                            min="2000"
                            max={new Date().getFullYear()}
                            value={formData.admissionYear}
                            onChange={(e) => handleChange('admissionYear', parseInt(e.target.value))}
                        />
                        <Input
                            label="Section (if applicable)"
                            value={formData.section}
                            onChange={(e) => handleChange('section', e.target.value)}
                            placeholder="e.g., A, B, C"
                        />
                        <div className="input-wrapper">
                            <label className="input-label">Enrollment Status</label>
                            <select
                                className="input"
                                value={formData.enrollmentStatus}
                                onChange={(e) => handleChange('enrollmentStatus', e.target.value)}
                            >
                                <option value="active">Active</option>
                                <option value="passed_out">Passed Out</option>
                                <option value="on_hold">On Hold</option>
                                <option value="dropped">Dropped</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 3. Contact Information (Basic) */}
                <Card title="3️⃣ Contact Information (Basic)" className="form-card">
                    <p className="text-sm text-gray-600 mb-4">Keep this minimal</p>
                    <div className="form-grid">
                        <Input
                            label="Student Mobile Number"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="Optional but helpful"
                        />
                        <Input
                            label="City"
                            value={formData.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            placeholder="Optional"
                        />
                        <Input
                            label="State"
                            value={formData.state}
                            onChange={(e) => handleChange('state', e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">📌 Personal address is NOT required</p>
                </Card>

                {/* 4. Placement Eligibility Flags (Very Important) */}
                <Card title="4️⃣ Placement Eligibility Flags (Very Important)" className="form-card">
                    <p className="text-sm text-gray-600 mb-4">These save time later</p>
                    <div className="form-grid">
                        <div className="input-wrapper">
                            <label className="input-label">Placement Eligible</label>
                            <select
                                className="input"
                                value={formData.placementEligible.toString()}
                                onChange={(e) => handleChange('placementEligible', e.target.value === 'true')}
                            >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <Input
                            label="Active Backlogs"
                            type="number"
                            min="0"
                            value={formData.backlogs.active}
                            onChange={(e) => handleChange('backlogs.active', parseInt(e.target.value) || 0)}
                        />
                        <Input
                            label="Backlog History (Total)"
                            type="number"
                            min="0"
                            value={formData.backlogs.history}
                            onChange={(e) => handleChange('backlogs.history', parseInt(e.target.value) || 0)}
                        />
                    </div>
                </Card>

                {/* Education History - 10th & 12th Mandatory */}
                <Card title="📚 Education History (10th & 12th Required)" className="form-card">
                    <p className="text-sm text-gray-600 mb-4">10th and 12th details are mandatory. UG/PG are optional.</p>
                    <div className="education-section">
                        <h4>10th Standard *</h4>
                        <div className="form-grid">
                            <Input
                                label="Percentage"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.education.tenth.percentage}
                                onChange={(e) => handleChange('education.tenth.percentage', parseFloat(e.target.value))}
                                required
                            />
                            <Input
                                label="Board"
                                value={formData.education.tenth.board}
                                onChange={(e) => handleChange('education.tenth.board', e.target.value)}
                                placeholder="e.g., CBSE, ICSE, State Board"
                                required
                            />
                        </div>
                    </div>
                    <div className="education-section">
                        <h4>12th Standard *</h4>
                        <div className="form-grid">
                            <Input
                                label="Percentage"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.education.twelfth.percentage}
                                onChange={(e) => handleChange('education.twelfth.percentage', parseFloat(e.target.value))}
                                required
                            />
                            <Input
                                label="Board"
                                value={formData.education.twelfth.board}
                                onChange={(e) => handleChange('education.twelfth.board', e.target.value)}
                                required
                            />
                            <Input
                                label="Stream"
                                value={formData.education.twelfth.stream}
                                onChange={(e) => handleChange('education.twelfth.stream', e.target.value)}
                                placeholder="e.g., Science, Commerce"
                                required
                            />
                        </div>
                    </div>
                    <div className="education-section">
                        <h4>UG (Undergraduate) - Optional</h4>
                        <div className="form-grid">
                            <Input
                                label="Institution"
                                value={formData.education.ug?.institution || ''}
                                onChange={(e) => handleChange('education.ug.institution', e.target.value)}
                                placeholder="College/University name"
                            />
                            <Input
                                label="Degree"
                                value={formData.education.ug?.degree || ''}
                                onChange={(e) => handleChange('education.ug.degree', e.target.value)}
                                placeholder="e.g., B.Tech, BCA, B.Sc"
                            />
                            <Input
                                label="Percentage/CGPA"
                                value={formData.education.ug?.percentage || ''}
                                onChange={(e) => handleChange('education.ug.percentage', e.target.value)}
                                placeholder="e.g., 8.5 CGPA or 85%"
                            />
                            <Input
                                label="Year of Completion"
                                type="number"
                                min="1990"
                                max={new Date().getFullYear() + 5}
                                value={formData.education.ug?.year || ''}
                                onChange={(e) => handleChange('education.ug.year', e.target.value)}
                                placeholder="e.g., 2024"
                            />
                        </div>
                    </div>
                    <div className="education-section">
                        <h4>PG (Postgraduate) - Optional</h4>
                        <div className="form-grid">
                            <Input
                                label="Institution"
                                value={formData.education.pg?.institution || ''}
                                onChange={(e) => handleChange('education.pg.institution', e.target.value)}
                                placeholder="College/University name"
                            />
                            <Input
                                label="Degree"
                                value={formData.education.pg?.degree || ''}
                                onChange={(e) => handleChange('education.pg.degree', e.target.value)}
                                placeholder="e.g., M.Tech, MBA, M.Sc"
                            />
                            <Input
                                label="Percentage/CGPA"
                                value={formData.education.pg?.percentage || ''}
                                onChange={(e) => handleChange('education.pg.percentage', e.target.value)}
                                placeholder="e.g., 8.5 CGPA or 85%"
                            />
                            <Input
                                label="Year of Completion"
                                type="number"
                                min="1990"
                                max={new Date().getFullYear() + 5}
                                value={formData.education.pg?.year || ''}
                                onChange={(e) => handleChange('education.pg.year', e.target.value)}
                                placeholder="e.g., 2026"
                            />
                        </div>
                    </div>
                </Card>

                {/* Skills - With Dropdown */}
                <Card title="💡 Skills" className="form-card">
                    <p className="text-sm text-gray-600 mb-4">Search and select from common technical skills, or add your own</p>
                    <div className="skills-input">
                        <div className="skills-dropdown-container" ref={skillInputRef}>
                            <Input
                                placeholder="Search skills (e.g., React, Python, AWS)..."
                                value={newSkill}
                                onChange={(e) => handleSkillInputChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (filteredSkills.length > 0) {
                                            selectSkill(filteredSkills[0]);
                                        } else if (newSkill.trim()) {
                                            addCustomSkill();
                                        }
                                    }
                                }}
                                onFocus={() => {
                                    if (newSkill.trim()) {
                                        setShowSkillDropdown(true);
                                    }
                                }}
                            />
                            {showSkillDropdown && (
                                <div className="skills-dropdown">
                                    {filteredSkills.length > 0 ? (
                                        filteredSkills.map((skill, idx) => (
                                            <div
                                                key={skill}
                                                className={`skill-option ${idx === 0 ? 'highlighted' : ''}`}
                                                onClick={() => selectSkill(skill)}
                                            >
                                                {skill}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-skills-found">
                                            No matching skills found
                                        </div>
                                    )}
                                    {newSkill.trim() && !COMMON_SKILLS.includes(newSkill.trim()) && (
                                        <button
                                            type="button"
                                            className="custom-skill-btn"
                                            onClick={addCustomSkill}
                                        >
                                            + Add "{newSkill.trim()}" as custom skill
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <Button type="button" onClick={addCustomSkill} icon={Plus}>Add</Button>
                    </div>
                    <div className="skills-list">
                        {formData.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                                <button type="button" onClick={() => removeSkill(index)}>
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </Card>

                {/* Links & Resume - Optional */}
                <Card title="🔗 Profile Links & Resume (Optional)" className="form-card">
                    <p className="text-sm text-gray-600 mb-4">Students can complete this later</p>
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
                    </div>

                    {/* Resume Upload */}
                    <div className="resume-upload-section" style={{ marginTop: 'var(--spacing-4)' }}>
                        <label className="input-label text-xs md:text-sm">Resume Upload</label>
                        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeChange}
                                className="text-sm md:text-base"
                                style={{ flex: 1 }}
                            />
                            {resumeFile && (
                                <span className="text-xs md:text-sm text-green-600">
                                    ✓ {resumeFile.name}
                                </span>
                            )}
                            {formData.resumeUrl && !resumeFile && (
                                <a
                                    href={formData.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs md:text-sm text-blue-600 hover:underline"
                                >
                                    View Current Resume
                                </a>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Accepted formats: PDF, DOC, DOCX (Max 5MB)
                        </p>
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
