import { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import { Briefcase, Users, Star, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await companyAPI.getStats();
            setStats(response.data.data.stats);
            setRecentJobs(response.data.data.recentJobs || []);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Company Dashboard</h1>
                    <p>Manage jobs and find talent</p>
                </div>
                <Link to="/company/jobs/new">
                    <Button icon={Briefcase}>Post New Job</Button>
                </Link>
            </div>

            <div className="stats-grid">
                <StatsCard
                    title="Total Jobs Posted"
                    value={stats?.jobs?.total || 0}
                    icon={Briefcase}
                    color="primary"
                />
                <StatsCard
                    title="Active Jobs"
                    value={stats?.jobs?.active || 0}
                    icon={Briefcase}
                    color="success"
                />
                <StatsCard
                    title="Total Applications"
                    value={stats?.applications?.total || 0}
                    icon={Users}
                    color="warning"
                />
                <StatsCard
                    title="Hired"
                    value={stats?.applications?.hired || 0}
                    icon={CheckCircle}
                    color="success"
                />
            </div>

            <div className="dashboard-sections">
                {/* Recent Jobs */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recent Jobs</h2>
                        <Link to="/company/jobs">View All</Link>
                    </div>

                    <div className="jobs-list">
                        {recentJobs.length === 0 ? (
                            <p className="empty-message">No jobs posted yet</p>
                        ) : (
                            recentJobs.map((job) => (
                                <div key={job._id} className="job-card">
                                    <div className="job-info">
                                        <h3>{job.title}</h3>
                                        <span className={`job-type job-type-${job.type}`}>{job.type}</span>
                                    </div>
                                    <div className="job-stats">
                                        <span>{job.stats?.totalApplications || 0} applications</span>
                                        <span className={`job-status job-status-${job.status}`}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <Link to="/company/search" className="quick-action">
                            <Users size={24} />
                            <span>Search Talent</span>
                        </Link>
                        <Link to="/company/shortlist" className="quick-action">
                            <Star size={24} />
                            <span>View Shortlist</span>
                        </Link>
                        <Link to="/company/jobs/new" className="quick-action">
                            <Briefcase size={24} />
                            <span>Post Job</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
