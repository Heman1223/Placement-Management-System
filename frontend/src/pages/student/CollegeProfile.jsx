import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Globe, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';
import './CollegeProfile.css';

const CollegeProfile = () => {
    const [college, setCollege] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollegeProfile = async () => {
            try {
                const response = await api.get('/student/profile');
                setCollege(response.data.data.college);
            } catch (error) {
                console.error('Error fetching college profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollegeProfile();
    }, []);

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    if (!college) {
        return <div className="error-state">College information not available.</div>;
    }

    return (
        <div className="college-profile-page">
            <div className="cp-header">
                <div className="cp-banner">
                    <div className="cp-logo-container">
                        {college.logo ? (
                            <img src={college.logo} alt={college.name} className="cp-logo" />
                        ) : (
                            <div className="cp-logo-placeholder">
                                <Building2 size={48} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="cp-info-basic">
                    <h1 className="flex items-center gap-4">
                        {college.name}
                        <span className="text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">Dynamic V2</span>
                    </h1>
                    <p className="cp-code">College Code: {college.code}</p>
                    <div className="cp-university">
                        <GraduationCap size={18} />
                        <span>{college.university}</span>
                    </div>
                </div>
            </div>

            <div className="cp-grid">
                <div className="cp-main-col">
                    {/* About Section */}
                    <div className="cp-card about-card mb-6">
                        <h3>About the Institution</h3>
                        <p className="description-text">
                            {college.description || "The institution provides a comprehensive learning environment focused on academic excellence and professional growth."}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="cp-stats-row mb-6">
                        <div className="stat-plate">
                            <span className="s-val">{college.stats?.totalStudents || 0}</span>
                            <span className="s-lab">Total Students</span>
                        </div>
                        <div className="stat-plate">
                            <span className="s-val">{college.stats?.placedStudents || 0}</span>
                            <span className="s-lab">Placed</span>
                        </div>
                        <div className="stat-plate">
                            <span className="s-val">
                                {college.stats?.totalStudents > 0 
                                    ? Math.round((college.stats.placedStudents / college.stats.totalStudents) * 100) 
                                    : 0}%
                            </span>
                            <span className="s-lab">Placement Rate</span>
                        </div>
                    </div>

                    {/* Placement Rules */}
                    <div className="cp-card rules-card">
                        <h3>Official Placement Rules</h3>
                        <div className="rules-grid">
                            <div className="rule-item">
                                <span className="r-label">Minimum CGPA Required</span>
                                <span className="r-value">{college.settings?.placementRules?.minCGPA || '6.0'}</span>
                            </div>
                            <div className="rule-item">
                                <span className="r-label">Max Active Backlogs</span>
                                <span className="r-value">{college.settings?.placementRules?.maxActiveBacklogs ?? '0'}</span>
                            </div>
                            <div className="rule-item">
                                <span className="r-label">Multiple Offers</span>
                                <span className="r-value">{college.settings?.placementRules?.allowMultipleOffers ? 'Allowed' : 'One Offer Only'}</span>
                            </div>
                            <div className="rule-item">
                                <span className="r-label">Resume Required</span>
                                <span className="r-value">{college.settings?.placementRules?.requireResumeUpload ? 'Mandatory' : 'Optional'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cp-side-col">
                    <div className="cp-card contact-card mb-6">
                        <h3>Contact Details</h3>
                        <div className="contact-list">
                            <div className="contact-item">
                                <Mail size={18} />
                                <span>{college.contactEmail}</span>
                            </div>
                            <div className="contact-item">
                                <Phone size={18} />
                                <span>{college.phone}</span>
                            </div>
                            {college.website && (
                                <div className="contact-item">
                                    <Globe size={18} />
                                    <a href={college.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="cp-card location-card mb-6">
                        <h3>Location</h3>
                        <div className="location-info">
                            <MapPin size={18} />
                            <span>{college.address?.city}, {college.address?.state}</span>
                            <p className="full-address text-xs mt-2 opacity-60">
                                {college.address?.street}, {college.address?.pincode}
                            </p>
                        </div>
                    </div>

                    <div className="cp-card departments-card">
                        <h3>Departments</h3>
                        <div className="dept-tags">
                            {college.departments?.map((dept, i) => (
                                <span key={i} className="dept-pill">{dept}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeProfile;
