import { useState, useEffect } from 'react';
import api, { uploadAPI } from '../../services/api';
import { Eye, Camera, Upload, Award, Github, Globe, Trash2, Plus } from 'lucide-react';
import './Profile.css';

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/student/profile');
            const profileData = response.data.data;
            setProfile(profileData);
            setFormData({
                ...profileData,
                projects: profileData.projects || [],
                certifications: profileData.certifications || []
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleArrayChange = (field, value) => {
        const array = value.split(',').map(item => item.trim()).filter(Boolean);
        setFormData(prev => ({
            ...prev,
            [field]: array
        }));
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Accept PDF, DOC, and DOCX files
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF, DOC, or DOCX file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            // Upload resume to Cloudinary
            const uploadResponse = await uploadAPI.resume(formData);
            
            const resumeUrl = uploadResponse.data.data.url;
            
            // Save resume URL to student profile
            const updateResponse = await api.put('/student/profile', { resumeUrl });
            
            // Update local state
            setProfile(updateResponse.data.data);
            setFormData(updateResponse.data.data);
            
            alert('Resume uploaded successfully!');
        } catch (error) {
            console.error('Error uploading resume:', error);
            const errorMessage = error.response?.data?.message || 'Failed to upload resume';
            alert(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const uploadResponse = await uploadAPI.image(formData);
            
            const imageUrl = uploadResponse.data.data.url;
            setProfile(prev => ({ ...prev, profilePicture: imageUrl }));
            setFormData(prev => ({ ...prev, profilePicture: imageUrl }));
            
            alert('Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleCertificateUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('certificate', file);

        try {
            const response = await uploadAPI.certificate(uploadData);
            const updatedCerts = [...formData.certifications];
            updatedCerts[index].fileUrl = response.data.data.url;
            setFormData(prev => ({ ...prev, certifications: updatedCerts }));
            alert('Certificate uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload certificate');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/student/profile', formData);
            setProfile(response.data.data);
            setEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    if (loading) {
        return <div className="loading">Loading profile...</div>;
    }

    const completeness = profile?.profileCompleteness || 0;

    return (
        <div className="student-profile">
            <div className="profile-header">
                <div className="profile-image-container">
                    <div className="profile-avatar-large">
                        {profile?.profilePicture ? (
                            <img src={profile.profilePicture} alt="Profile" />
                        ) : (
                            <div className="initials-large">
                                {profile?.name?.firstName?.[0]}{profile?.name?.lastName?.[0]}
                            </div>
                        )}
                        <label htmlFor="profile-image-upload" className="image-upload-overlay">
                            <Camera size={24} />
                            <span>{uploading ? '...' : 'Change'}</span>
                        </label>
                        <input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                    </div>
                </div>
                <div className="profile-header-info flex items-center gap-4">
                    {profile?.college?.logo && (
                        <div className="w-12 h-12 rounded-lg bg-slate-800/50 overflow-hidden flex-shrink-0 border border-white/10 shadow-sm">
                            <img src={profile.college.logo} alt={profile.college.name} className="w-full h-full object-contain p-1" />
                        </div>
                    )}
                    <div>
                        <h1 className="flex items-center gap-3">
                            {profile?.name?.firstName} {profile?.name?.lastName}
                            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">Theme V2</span>
                        </h1>
                        <p className="student-identifier">
                            {profile?.college?.name && <span className="college-name-tag">{profile.college.name}</span>}
                            <span className="dept-batch-tag">{profile?.department} • Batch {profile?.batch}</span>
                        </p>
                    </div>
                </div>
                <div className="profile-actions">
                    <div className="completeness-badge">
                        <span className="completeness-value">{completeness}%</span>
                        <span className="completeness-label">Complete</span>
                    </div>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} className="btn btn-primary">
                            Edit Profile
                        </button>
                    ) : (
                        <button onClick={() => setEditing(false)} className="btn btn-secondary">
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="profile-content">
                {/* Basic Information */}
                <div className="profile-section">
                    <h2>Basic Information</h2>
                    {editing ? (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={formData.name?.firstName || ''}
                                    onChange={(e) => handleNestedChange('name', 'firstName', e.target.value)}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.name?.lastName || ''}
                                    onChange={(e) => handleNestedChange('name', 'lastName', e.target.value)}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={formData.email || ''} disabled />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth?.split('T')[0] || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select name="gender" value={formData.gender || ''} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Name:</span>
                                <span className="value">{profile?.name?.firstName} {profile?.name?.lastName}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Email:</span>
                                <span className="value">{profile?.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Phone:</span>
                                <span className="value">{profile?.phone || 'Not provided'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Date of Birth:</span>
                                <span className="value">
                                    {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* About Me Section */}
                <div className="profile-section">
                    <h2>About Me</h2>
                    {editing ? (
                        <div className="form-group">
                            <textarea
                                name="about"
                                value={formData.about || ''}
                                onChange={handleChange}
                                placeholder="Tell companies about yourself..."
                                rows={4}
                                className="w-full p-3 mt-2"
                            />
                        </div>
                    ) : (
                        <p className="about-text">
                            {profile?.about || 'No description provided yet.'}
                        </p>
                    )}
                </div>

                {/* Academic Information */}
                <div className="profile-section">
                    <h2>Academic Information</h2>
                    {editing ? (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" value={formData.department || ''} disabled />
                            </div>
                            <div className="form-group">
                                <label>Batch</label>
                                <input type="number" value={formData.batch || ''} disabled />
                            </div>
                            <div className="form-group">
                                <label>Roll Number</label>
                                <input type="text" value={formData.rollNumber || ''} disabled />
                            </div>
                            <div className="form-group">
                                <label>CGPA</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cgpa"
                                    value={formData.cgpa || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Department:</span>
                                <span className="value">{profile?.department}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Batch:</span>
                                <span className="value">{profile?.batch}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Roll Number:</span>
                                <span className="value">{profile?.rollNumber}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">CGPA:</span>
                                <span className="value">{profile?.cgpa || 'Not provided'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div className="profile-section">
                    <h2>Skills</h2>
                    {editing ? (
                        <div className="form-group">
                            <label>Skills (comma separated)</label>
                            <input
                                type="text"
                                value={formData.skills?.join(', ') || ''}
                                onChange={(e) => handleArrayChange('skills', e.target.value)}
                                placeholder="e.g., JavaScript, React, Node.js"
                            />
                        </div>
                    ) : (
                        <div className="skills-list">
                            {profile?.skills?.length > 0 ? (
                                profile.skills.map((skill, index) => (
                                    <span key={index} className="skill-tag">{skill}</span>
                                ))
                            ) : (
                                <p className="empty-state">No skills added yet</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Certifications Section */}
                <div className="profile-section">
                    <h2>Certifications</h2>
                    {editing ? (
                        <div className="space-y-4 mt-4">
                            {formData.certifications?.map((cert, index) => (
                                <div key={index} className="certificate-form-card relative mb-4">
                                    <button 
                                        type="button" 
                                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                        onClick={() => {
                                            const updated = formData.certifications.filter((_, i) => i !== index);
                                            setFormData(prev => ({ ...prev, certifications: updated }));
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label>Certificate Name</label>
                                            <input
                                                type="text"
                                                value={cert.name || ''}
                                                onChange={(e) => {
                                                    const updated = [...formData.certifications];
                                                    updated[index].name = e.target.value;
                                                    setFormData(prev => ({ ...prev, certifications: updated }));
                                                }}
                                                placeholder="e.g. AWS Certified Solutions Architect"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Issuer / Organization</label>
                                            <input
                                                type="text"
                                                value={cert.issuer || ''}
                                                onChange={(e) => {
                                                    const updated = [...formData.certifications];
                                                    updated[index].issuer = e.target.value;
                                                    setFormData(prev => ({ ...prev, certifications: updated }));
                                                }}
                                                placeholder="e.g. Amazon Web Services"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Certificate File (PDF)</label>
                                            <div className="flex items-center gap-2">
                                                <label className="flex-1 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg cursor-pointer hover:bg-slate-800 text-sm text-slate-300 flex items-center gap-2">
                                                    <Upload size={14} />
                                                    {cert.fileUrl ? 'Change Certificate' : 'Upload PDF'}
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf" 
                                                        className="hidden" 
                                                        onChange={(e) => handleCertificateUpload(e, index)}
                                                    />
                                                </label>
                                                {cert.fileUrl && (
                                                    <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg">
                                                        <Eye size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-slate-400 hover:border-blue-400/50 hover:text-blue-400 flex items-center justify-center gap-2 text-sm"
                                onClick={() => {
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        certifications: [...(prev.certifications || []), { name: '', issuer: '', fileUrl: '' }] 
                                    }));
                                }}
                            >
                                <Plus size={16} /> Add New Certification
                            </button>
                        </div>
                    ) : (
                        <div className="certificates-grid">
                            {profile?.certifications?.length > 0 ? (
                                profile.certifications.map((cert, index) => (
                                    <div key={index} className="certificate-card">
                                        <Award className="cert-icon" />
                                        <div className="cert-info">
                                            <span className="cert-name">{cert.name}</span>
                                            {cert.fileUrl && (
                                                <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="cert-link">
                                                    <Eye size={14} /> View Document
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">No certifications added yet</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Projects Section */}
                <div className="profile-section">
                    <h2>Projects</h2>
                    {editing ? (
                        <div className="space-y-6 mt-4">
                            {formData.projects?.map((project, index) => (
                                <div key={index} className="project-form-card relative mb-6">
                                    <button 
                                        type="button" 
                                        className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={() => {
                                            const updated = formData.projects.filter((_, i) => i !== index);
                                            setFormData(prev => ({ ...prev, projects: updated }));
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="form-group">
                                            <label>Project Title</label>
                                            <input
                                                type="text"
                                                value={project.title}
                                                onChange={(e) => {
                                                    const updated = [...formData.projects];
                                                    updated[index].title = e.target.value;
                                                    setFormData(prev => ({ ...prev, projects: updated }));
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Technologies</label>
                                            <input
                                                type="text"
                                                value={project.technologies}
                                                onChange={(e) => {
                                                    const updated = [...formData.projects];
                                                    updated[index].technologies = e.target.value;
                                                    setFormData(prev => ({ ...prev, projects: updated }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group mb-4">
                                        <label>Description</label>
                                        <textarea
                                            value={project.description}
                                            onChange={(e) => {
                                                const updated = [...formData.projects];
                                                updated[index].description = e.target.value;
                                                setFormData(prev => ({ ...prev, projects: updated }));
                                            }}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label>Project URL</label>
                                            <input
                                                type="url"
                                                value={project.projectUrl}
                                                onChange={(e) => {
                                                    const updated = [...formData.projects];
                                                    updated[index].projectUrl = e.target.value;
                                                    setFormData(prev => ({ ...prev, projects: updated }));
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>GitHub URL</label>
                                            <input
                                                type="url"
                                                value={project.githubUrl}
                                                onChange={(e) => {
                                                    const updated = [...formData.projects];
                                                    updated[index].githubUrl = e.target.value;
                                                    setFormData(prev => ({ ...prev, projects: updated }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                className="w-full py-3 border-2 border-dashed border-white/10 rounded-2xl text-slate-400 hover:border-blue-400/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                                onClick={() => {
                                    const newProject = { title: '', description: '', technologies: '', projectUrl: '', githubUrl: '' };
                                    setFormData(prev => ({ ...prev, projects: [...(prev.projects || []), newProject] }));
                                }}
                            >
                                <Plus size={20} /> Add New Project
                            </button>
                        </div>
                    ) : (
                        <div className="projects-list space-y-4">
                            {profile?.projects?.length > 0 ? (
                                profile.projects.map((project, index) => (
                                    <div key={index} className="project-card">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-white">{project.title}</h3>
                                            <div className="flex gap-3">
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                                                        <Github size={20} />
                                                    </a>
                                                )}
                                                {project.projectUrl && (
                                                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                                                        <Globe size={20} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-slate-400 mb-4">{project.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(project.technologies) 
                                                ? project.technologies 
                                                : (project.technologies?.split(',') || [])
                                            ).map((tech, i) => (
                                                <span key={i} className="px-3 py-1 bg-slate-800/50 border border-white/10 rounded-lg text-xs font-semibold text-slate-300">
                                                    {typeof tech === 'string' ? tech.trim() : tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state">No projects added yet</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Resume Section (Standalone) */}
                <div className="profile-section">
                    <h2>Resume</h2>
                    <div className="resume-section">
                        {profile?.resumeUrl ? (
                            <div className="resume-preview">
                                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                                    <Eye size={16} style={{ marginRight: '8px' }} />
                                    View Resume
                                </a>
                            </div>
                        ) : (
                            <p className="empty-state">No resume uploaded</p>
                        )}
                        <div className="upload-section">
                            <label htmlFor="resume-upload" className="btn btn-primary">
                                {uploading ? 'Uploading...' : 'Upload Resume (PDF, DOC, DOCX)'}
                            </label>
                            <input
                                id="resume-upload"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Links */}
                <div className="profile-section">
                    <h2>Professional Links</h2>
                    {editing ? (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>LinkedIn URL</label>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    value={formData.linkedinUrl || ''}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                            <div className="form-group">
                                <label>GitHub URL</label>
                                <input
                                    type="url"
                                    name="githubUrl"
                                    value={formData.githubUrl || ''}
                                    onChange={handleChange}
                                    placeholder="https://github.com/yourusername"
                                />
                            </div>
                            <div className="form-group">
                                <label>Portfolio URL</label>
                                <input
                                    type="url"
                                    name="portfolioUrl"
                                    value={formData.portfolioUrl || ''}
                                    onChange={handleChange}
                                    placeholder="https://yourportfolio.com"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="links-list">
                            {profile?.linkedinUrl && (
                                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="link-item">
                                    LinkedIn
                                </a>
                            )}
                            {profile?.githubUrl && (
                                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="link-item">
                                    GitHub
                                </a>
                            )}
                            {profile?.portfolioUrl && (
                                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="link-item">
                                    Portfolio
                                </a>
                            )}
                            {!profile?.linkedinUrl && !profile?.githubUrl && !profile?.portfolioUrl && (
                                <p className="empty-state">No links added yet</p>
                            )}
                        </div>
                    )}
                </div>

                {editing && (
                    <div className="form-actions">
                        <button onClick={handleSubmit} className="btn btn-primary">
                            Save Changes
                        </button>
                        <button onClick={() => setEditing(false)} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfile;
