import { useState, useEffect } from 'react';
import api from '../../services/api';
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
            setProfile(response.data.data);
            setFormData(response.data.data);
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

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
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
            const response = await api.post('/upload/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(prev => ({ ...prev, resumeUrl: response.data.data.url }));
            alert('Resume uploaded successfully!');
        } catch (error) {
            console.error('Error uploading resume:', error);
            alert('Failed to upload resume');
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
                <h1>My Profile</h1>
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
                                <span className="label">Gender:</span>
                                <span className="value">{profile?.gender || 'Not provided'}</span>
                            </div>
                        </div>
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

                {/* Resume */}
                <div className="profile-section">
                    <h2>Resume</h2>
                    <div className="resume-section">
                        {profile?.resumeUrl ? (
                            <div className="resume-preview">
                                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                                    View Resume
                                </a>
                            </div>
                        ) : (
                            <p className="empty-state">No resume uploaded</p>
                        )}
                        <div className="upload-section">
                            <label htmlFor="resume-upload" className="btn btn-primary">
                                {uploading ? 'Uploading...' : 'Upload Resume (PDF)'}
                            </label>
                            <input
                                id="resume-upload"
                                type="file"
                                accept=".pdf"
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
