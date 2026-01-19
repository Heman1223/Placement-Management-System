import { useState, useEffect } from 'react';
import { collegeAPI } from '../../services/api';
import { StatsCard } from '../../components/common/Card';
import { GraduationCap, UserCheck, Briefcase, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import './CollegeDashboard.css';

const CollegeDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await collegeAPI.getStats();
            setStats(response.data.data);
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
                <h1>College Dashboard</h1>
                <p>Manage your students and track placements</p>
            </div>

            <div className="stats-grid">
                <StatsCard
                    title="Total Students"
                    value={stats?.overview?.total || 0}
                    icon={GraduationCap}
                    color="primary"
                />
                <StatsCard
                    title="Verified Students"
                    value={stats?.overview?.verified || 0}
                    icon={UserCheck}
                    color="success"
                />
                <StatsCard
                    title="Placed Students"
                    value={stats?.overview?.placed || 0}
                    icon={Briefcase}
                    color="warning"
                />
                <StatsCard
                    title="Placement Rate"
                    value={`${stats?.overview?.placementRate || 0}%`}
                    icon={TrendingUp}
                    color="primary"
                />
            </div>

            <div className="dashboard-sections">
                {/* Department Stats */}
                <div className="dashboard-section">
                    <h2>Department-wise Statistics</h2>
                    <div className="dept-stats">
                        {stats?.departmentStats?.map((dept) => (
                            <div key={dept._id} className="dept-stat-card">
                                <div className="dept-info">
                                    <span className="dept-name">{dept._id}</span>
                                    <span className="dept-count">{dept.total} students</span>
                                </div>
                                <div className="dept-progress">
                                    <div
                                        className="dept-progress-bar"
                                        style={{ width: `${(dept.placed / dept.total) * 100}%` }}
                                    />
                                </div>
                                <span className="dept-placed">{dept.placed} placed</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Batch Stats */}
                <div className="dashboard-section">
                    <h2>Batch-wise Statistics</h2>
                    <div className="batch-stats">
                        {stats?.batchStats?.map((batch) => (
                            <div key={batch._id} className="batch-card">
                                <div className="batch-year">{batch._id}</div>
                                <div className="batch-details">
                                    <div className="batch-stat">
                                        <span className="batch-value">{batch.total}</span>
                                        <span className="batch-label">Total</span>
                                    </div>
                                    <div className="batch-stat">
                                        <span className="batch-value">{batch.placed}</span>
                                        <span className="batch-label">Placed</span>
                                    </div>
                                    <div className="batch-stat">
                                        <span className="batch-value">
                                            {batch.total > 0 ? Math.round((batch.placed / batch.total) * 100) : 0}%
                                        </span>
                                        <span className="batch-label">Rate</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeDashboard;
