import { useState, useEffect } from 'react';
import { collegeAPI } from '../../services/api';
import { Building2, Users, UserCheck, Briefcase, TrendingUp, Eye, Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import './CompanyActivity.css';
import './CompanyActivity.css';

const CompanyActivity = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompanyActivity();
    }, []);

    const fetchCompanyActivity = async () => {
        try {
            const response = await collegeAPI.getCompanyActivity();
            setData(response.data.data);
        } catch (error) {
            toast.error('Failed to load company activity');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString();
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="company-activity-page">
            <div className="page-header">
                <div>
                    <h1>Company Recruitment Activity</h1>
                    <p>Track which companies are engaging with your students</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="activity-summary">
                <div className="summary-card">
                    <div className="summary-icon">
                        <Building2 size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{data?.summary?.totalCompaniesEngaged || 0}</span>
                        <span className="summary-label">Companies Engaged</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">
                        <Users size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{data?.summary?.totalApplications || 0}</span>
                        <span className="summary-label">Total Applications</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">
                        <UserCheck size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{data?.summary?.totalShortlisted || 0}</span>
                        <span className="summary-label">Students Shortlisted</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">
                        <Award size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{data?.summary?.totalOffered || 0}</span>
                        <span className="summary-label">Offers Made</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">
                        <Briefcase size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-value">{data?.summary?.totalHired || 0}</span>
                        <span className="summary-label">Students Hired</span>
                    </div>
                </div>
            </div>


            {/* Recent Activity */}
            <div className="recent-activity-section">
                <h2>Recent Activity</h2>
                {data?.recentActivity?.length === 0 ? (
                    <div className="empty-state-small">
                        <p>No recent activity</p>
                    </div>
                ) : (
                    <div className="activity-timeline">
                        {data?.recentActivity?.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon">
                                    {activity.action === 'view_student' && <Eye size={16} />}
                                    {activity.action === 'shortlist_student' && <UserCheck size={16} />}
                                    {activity.action === 'download_student_data' && <TrendingUp size={16} />}
                                </div>
                                <div className="activity-content">
                                    <span className="activity-company">
                                        {activity.user?.companyProfile?.name || 'Company'}
                                    </span>
                                    <span className="activity-action">
                                        {activity.action === 'view_student' && 'viewed a student profile'}
                                        {activity.action === 'shortlist_student' && 'shortlisted a student'}
                                        {activity.action === 'download_student_data' && 'downloaded student data'}
                                    </span>
                                </div>
                                <div className="activity-time">
                                    {formatDate(activity.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyActivity;
