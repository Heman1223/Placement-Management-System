import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, profileRes] = await Promise.all([
                api.get('/student/stats'),
                api.get('/student/profile')
            ]);
            setStats(statsRes.data.data);
            setProfile(profileRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    const profileCompleteness = stats?.profileCompleteness || 0;
    const isProfileIncomplete = profileCompleteness < 80;

    return (
        <div className="student-dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {profile?.name?.firstName}!</h1>
                <p className="subtitle">Track your placement journey</p>
            </div>

            {isProfileIncomplete && (
                <div className="alert alert-warning">
                    <strong>Complete Your Profile!</strong>
                    <p>Your profile is {profileCompleteness}% complete. Complete it to increase your chances of getting hired.</p>
                    <button onClick={() => navigate('/student/profile')} className="btn btn-primary">
                        Complete Profile
                    </button>
                </div>
            )}

            {!profile?.isVerified && (
                <div className="alert alert-info">
                    <strong>Profile Pending Verification</strong>
                    <p>Your profile is awaiting verification from your college admin.</p>
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{stats?.totalApplications || 0}</h3>
                        <p>Total Applications</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💼</div>
                    <div className="stat-content">
                        <h3>{stats?.eligibleJobs || 0}</h3>
                        <p>Eligible Jobs</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats?.applicationsByStatus?.shortlisted || 0}</h3>
                        <p>Shortlisted</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>{profileCompleteness}%</h3>
                        <p>Profile Complete</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-actions">
                <div className="action-card" onClick={() => navigate('/student/jobs')}>
                    <div className="action-icon">🔍</div>
                    <h3>Browse Jobs</h3>
                    <p>Find jobs matching your profile</p>
                </div>

                <div className="action-card" onClick={() => navigate('/student/applications')}>
                    <div className="action-icon">📝</div>
                    <h3>My Applications</h3>
                    <p>Track your application status</p>
                </div>

                <div className="action-card" onClick={() => navigate('/student/profile')}>
                    <div className="action-icon">👤</div>
                    <h3>My Profile</h3>
                    <p>Update your information</p>
                </div>
            </div>

            {stats?.applicationsByStatus && Object.keys(stats.applicationsByStatus).length > 0 && (
                <div className="application-status-section">
                    <h2>Application Status Breakdown</h2>
                    <div className="status-grid">
                        {Object.entries(stats.applicationsByStatus).map(([status, count]) => (
                            <div key={status} className="status-item">
                                <span className="status-label">{status.replace('_', ' ')}</span>
                                <span className="status-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
