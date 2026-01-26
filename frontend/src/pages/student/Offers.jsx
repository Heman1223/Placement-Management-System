import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { 
    Briefcase, Building2, Calendar, CheckCircle, Clock, XCircle, 
    ChevronRight, Mail, Bell, Target, ArrowRight, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Offers.css';

const Offers = () => {
    const [applications, setApplications] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('invitations');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appRes, invRes] = await Promise.all([
                studentAPI.getApplications(),
                studentAPI.getInvitations()
            ]);
            
            // Selection Status: Filter only those with progress
            const selectionApps = appRes.data.data.filter(app => 
                ['shortlisted', 'interviewed', 'offered', 'hired', 'rejected'].includes(app.status)
            );
            
            setApplications(selectionApps);
            setInvitations(invRes.data.data);
            
            // Auto switch tab if no invitations but has selection updates
            if (invRes.data.data.length === 0 && selectionApps.length > 0) {
                setActiveTab('selection');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load recruitment updates');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'hired': return 'status-hired';
            case 'offered': return 'status-offered';
            case 'interviewed': return 'status-interviewed';
            case 'shortlisted': return 'status-shortlisted';
            case 'rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="offers-page">
            <header className="offers-header">
                <div>
                    <h1>Recruitment Hub</h1>
                    <p>Manage your direct offers and track selection progress</p>
                </div>
                <div className="tab-switcher">
                    <button 
                        className={`tab-btn ${activeTab === 'invitations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('invitations')}
                    >
                        Direct Offers
                        {invitations.length > 0 && <span className="tab-count">{invitations.length}</span>}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'selection' ? 'active' : ''}`}
                        onClick={() => setActiveTab('selection')}
                    >
                        Selection Pipeline
                        {applications.length > 0 && <span className="tab-count">{applications.length}</span>}
                    </button>
                </div>
            </header>

            <div className="offers-container">
                {activeTab === 'invitations' ? (
                    <div className="invitations-section">
                        {invitations.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon-box">
                                    <Mail size={40} />
                                </div>
                                <h3>No Direct Offers Yet</h3>
                                <p>Companies can send you direct recruitment offers if your profile matches their requirements. Keep your profile updated!</p>
                            </div>
                        ) : (
                            <div className="offers-grid">
                                {invitations.map((inv) => (
                                    <div key={inv._id} className="invitation-card">
                                        <div className="inv-header">
                                            <div className="inv-company">
                                                <div className="inv-logo">
                                                    {inv.company?.logo ? <img src={inv.company.logo} alt="" /> : <Building2 size={24} />}
                                                </div>
                                                <div>
                                                    <h4>{inv.job?.title}</h4>
                                                    <p>{inv.company?.name}</p>
                                                </div>
                                            </div>
                                            <div className="inv-date">
                                                {new Date(inv.sentAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="inv-body">
                                            <p className="inv-message">
                                                {inv.message || `${inv.company?.name} has invited you to register for their ${inv.job?.title} recruitment drive.`}
                                            </p>
                                            <div className="inv-meta">
                                                <div className="meta-pill">
                                                    <Award size={14} />
                                                    {inv.job?.type?.replace('_', ' ')}
                                                </div>
                                                <div className="meta-pill">
                                                    <Target size={14} />
                                                    Priority Match
                                                </div>
                                            </div>
                                        </div>
                                        <div className="inv-footer">
                                            <Link to={`/student/jobs/${inv.job?._id}`} className="btn-view-invite">
                                                View Drive & Register
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="selection-section">
                        {applications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon-box">
                                    <Target size={40} />
                                </div>
                                <h3>No Selection Updates</h3>
                                <p>Progress in recruitment drives you've registered for will appear here (Shortlists, Interviews, Offers).</p>
                            </div>
                        ) : (
                            <div className="selection-list">
                                {applications.map((app) => (
                                    <div key={app._id} className="selection-card">
                                        <div className="sel-left">
                                            <div className="sel-comp-logo">
                                                {app.job?.company?.logo ? <img src={app.job.company.logo} alt="" /> : <Building2 size={24} />}
                                            </div>
                                            <div className="sel-info">
                                                <h4>{app.job?.title}</h4>
                                                <p className="sel-comp-name">{app.job?.company?.name}</p>
                                                <div className="sel-meta">
                                                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                                                    <span className="dot">•</span>
                                                    <span className="capitalize">{app.job?.type?.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sel-right">
                                            <div className={`sel-status ${getStatusColor(app.status)}`}>
                                                {app.status === 'hired' ? <CheckCircle size={16} /> : 
                                                 app.status === 'rejected' ? <XCircle size={16} /> : 
                                                 <Clock size={16} />}
                                                <span>{app.status.toUpperCase()}</span>
                                            </div>
                                            <Link to={`/student/jobs/${app.job?._id}`} className="sel-link">
                                                <ChevronRight size={20} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Offers;
