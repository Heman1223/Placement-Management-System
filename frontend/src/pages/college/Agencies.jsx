import { useState, useEffect } from 'react';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { Building2, Eye, Activity, Calendar, Download, AlertCircle, CheckCircle, XCircle, Plus, Settings, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './Agencies.css';

const Agencies = () => {
    const [agencies, setAgencies] = useState([]);
    const [availableAgencies, setAvailableAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // active, available
    const [activityModal, setActivityModal] = useState({ open: false, agency: null, data: null });
    const [grantAccessModal, setGrantAccessModal] = useState({ open: false, agency: null });
    const [settingsModal, setSettingsModal] = useState({ open: false, agency: null });
    const [revokeModal, setRevokeModal] = useState({ open: false, agency: null });
    
    const [accessSettings, setAccessSettings] = useState({
        accessExpiryDate: '',
        downloadLimit: 100
    });

    useEffect(() => {
        fetchAgencies();
        fetchAvailableAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const response = await collegeAPI.getAgencies();
            setAgencies(response.data.data);
        } catch (error) {
            toast.error('Failed to load agencies');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableAgencies = async () => {
        try {
            const response = await collegeAPI.getAgencyRequests();
            setAvailableAgencies(response.data.data);
        } catch (error) {
            console.error('Failed to load available agencies');
        }
    };

    const viewAgencyActivity = async (agency) => {
        try {
            const response = await collegeAPI.getAgencyActivity(agency._id);
            setActivityModal({
                open: true,
                agency,
                data: response.data.data
            });
        } catch (error) {
            toast.error('Failed to load agency activity');
        }
    };

    const handleGrantAccess = async () => {
        try {
            await collegeAPI.grantAgencyAccess(grantAccessModal.agency._id, accessSettings);
            toast.success('Agency access granted successfully');
            setGrantAccessModal({ open: false, agency: null });
            setAccessSettings({ accessExpiryDate: '', downloadLimit: 100 });
            fetchAgencies();
            fetchAvailableAgencies();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to grant access');
        }
    };

    const handleRevokeAccess = async () => {
        try {
            await collegeAPI.revokeAgencyAccess(revokeModal.agency._id);
            toast.success('Agency access revoked successfully');
            setRevokeModal({ open: false, agency: null });
            fetchAgencies();
            fetchAvailableAgencies();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to revoke access');
        }
    };

    const handleUpdateSettings = async () => {
        try {
            await collegeAPI.updateAgencyAccessSettings(settingsModal.agency._id, accessSettings);
            toast.success('Access settings updated successfully');
            setSettingsModal({ open: false, agency: null });
            setAccessSettings({ accessExpiryDate: '', downloadLimit: 100 });
            fetchAgencies();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        }
    };

    const formatDate = (date) => {
        if (!date) return 'No expiry';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isAccessExpired = (date) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="agencies-page">
            <div className="page-header">
                <div>
                    <h1>Placement Agencies</h1>
                    <p>Manage agencies with access to your students</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Agencies ({agencies.length})
                </button>
                <button
                    className={`tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    Available Agencies ({availableAgencies.length})
                </button>
            </div>

            {loading ? (
                <div className="loading-screen"><div className="loading-spinner" /></div>
            ) : (
                <>
                    {/* Active Agencies Tab */}
                    {activeTab === 'active' && (
                        <>
                            {agencies.length === 0 ? (
                                <div className="empty-state-card">
                                    <Building2 size={48} />
                                    <h3>No Active Agencies</h3>
                                    <p>No placement agencies have been granted access to your college students.</p>
                                    <p className="info-text">Grant access to agencies from the "Available Agencies" tab.</p>
                                </div>
                            ) : (
                                <div className="agencies-grid">
                                    {agencies.map((agency) => (
                                        <div key={agency._id} className="agency-card">
                                            <div className="agency-header">
                                                <div className="agency-icon">
                                                    <Building2 size={24} />
                                                </div>
                                                <div className="agency-info">
                                                    <h3>{agency.name}</h3>
                                                    <p>{agency.industry || 'Not specified'}</p>
                                                </div>
                                                <div className="agency-status">
                                                    {!agency.isActive ? (
                                                        <span className="status-badge status-inactive">
                                                            <XCircle size={14} /> Inactive
                                                        </span>
                                                    ) : agency.isSuspended ? (
                                                        <span className="status-badge status-suspended">
                                                            <AlertCircle size={14} /> Suspended
                                                        </span>
                                                    ) : isAccessExpired(agency.activity?.accessExpiryDate) ? (
                                                        <span className="status-badge status-expired">
                                                            <AlertCircle size={14} /> Expired
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge status-active">
                                                            <CheckCircle size={14} /> Active
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="agency-contact">
                                                <div className="contact-item">
                                                    <span className="contact-label">Contact Person</span>
                                                    <span className="contact-value">{agency.contactPerson?.name || 'Not provided'}</span>
                                                </div>
                                                <div className="contact-item">
                                                    <span className="contact-label">Email</span>
                                                    <span className="contact-value">{agency.contactPerson?.email || 'Not provided'}</span>
                                                </div>
                                            </div>

                                            <div className="agency-stats">
                                                <div className="stat-item">
                                                    <Eye size={18} />
                                                    <div>
                                                        <span className="stat-value">{agency.activity?.profilesAccessed || 0}</span>
                                                        <span className="stat-label">Profiles Viewed</span>
                                                    </div>
                                                </div>
                                                <div className="stat-item">
                                                    <CheckCircle size={18} />
                                                    <div>
                                                        <span className="stat-value">{agency.activity?.shortlistsMade || 0}</span>
                                                        <span className="stat-label">Shortlisted</span>
                                                    </div>
                                                </div>
                                                <div className="stat-item">
                                                    <Download size={18} />
                                                    <div>
                                                        <span className="stat-value">
                                                            {agency.activity?.downloadsCount || 0}
                                                            {agency.activity?.downloadLimit && ` / ${agency.activity.downloadLimit}`}
                                                        </span>
                                                        <span className="stat-label">Downloads</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="agency-access-info">
                                                <Calendar size={16} />
                                                <span>Access expires: {formatDate(agency.activity?.accessExpiryDate)}</span>
                                            </div>

                                            <div className="agency-actions">
                                                <Button
                                                    variant="secondary"
                                                    icon={Activity}
                                                    onClick={() => viewAgencyActivity(agency)}
                                                    size="sm"
                                                >
                                                    Activity
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    icon={Settings}
                                                    onClick={() => {
                                                        setSettingsModal({ open: true, agency });
                                                        setAccessSettings({
                                                            accessExpiryDate: agency.activity?.accessExpiryDate 
                                                                ? new Date(agency.activity.accessExpiryDate).toISOString().split('T')[0]
                                                                : '',
                                                            downloadLimit: agency.activity?.downloadLimit || 100
                                                        });
                                                    }}
                                                    size="sm"
                                                >
                                                    Settings
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    icon={Trash2}
                                                    onClick={() => setRevokeModal({ open: true, agency })}
                                                    size="sm"
                                                >
                                                    Revoke
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Available Agencies Tab */}
                    {activeTab === 'available' && (
                        <>
                            {availableAgencies.length === 0 ? (
                                <div className="empty-state-card">
                                    <Building2 size={48} />
                                    <h3>No Available Agencies</h3>
                                    <p>All approved agencies already have access to your college, or there are no approved agencies yet.</p>
                                </div>
                            ) : (
                                <div className="agencies-grid">
                                    {availableAgencies.map((agency) => (
                                        <div key={agency._id} className="agency-card available">
                                            <div className="agency-header">
                                                <div className="agency-icon">
                                                    <Building2 size={24} />
                                                </div>
                                                <div className="agency-info">
                                                    <h3>{agency.name}</h3>
                                                    <p>{agency.industry || 'Not specified'}</p>
                                                </div>
                                            </div>

                                            <div className="agency-contact">
                                                <div className="contact-item">
                                                    <span className="contact-label">Contact Person</span>
                                                    <span className="contact-value">{agency.contactPerson?.name || 'Not provided'}</span>
                                                </div>
                                                <div className="contact-item">
                                                    <span className="contact-label">Email</span>
                                                    <span className="contact-value">{agency.contactPerson?.email || 'Not provided'}</span>
                                                </div>
                                            </div>

                                            <div className="agency-actions">
                                                <Button
                                                    icon={Plus}
                                                    onClick={() => setGrantAccessModal({ open: true, agency })}
                                                    fullWidth
                                                >
                                                    Grant Access
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Activity Modal */}
            <Modal
                isOpen={activityModal.open}
                onClose={() => setActivityModal({ open: false, agency: null, data: null })}
                title={`${activityModal.agency?.name} - Activity Details`}
                size="lg"
            >
                {activityModal.data && (
                    <div className="activity-modal">
                        <div className="activity-stats-grid">
                            <div className="activity-stat-card">
                                <Eye size={24} />
                                <div>
                                    <span className="activity-stat-value">{activityModal.data.stats.profilesAccessed}</span>
                                    <span className="activity-stat-label">Profiles Accessed</span>
                                </div>
                            </div>
                            <div className="activity-stat-card">
                                <CheckCircle size={24} />
                                <div>
                                    <span className="activity-stat-value">{activityModal.data.stats.shortlistsMade}</span>
                                    <span className="activity-stat-label">Students Shortlisted</span>
                                </div>
                            </div>
                            <div className="activity-stat-card">
                                <Download size={24} />
                                <div>
                                    <span className="activity-stat-value">
                                        {activityModal.data.stats.downloadsCount}
                                        {activityModal.data.stats.downloadLimit && ` / ${activityModal.data.stats.downloadLimit}`}
                                    </span>
                                    <span className="activity-stat-label">Data Downloads</span>
                                </div>
                            </div>
                        </div>

                        <div className="recent-activity-section">
                            <h4>Recent Activity</h4>
                            {activityModal.data.recentActivity.length === 0 ? (
                                <p className="empty-text">No recent activity</p>
                            ) : (
                                <div className="activity-list">
                                    {activityModal.data.recentActivity.map((log, index) => (
                                        <div key={index} className="activity-item">
                                            <div className="activity-icon">
                                                {log.action === 'view_student' && <Eye size={16} />}
                                                {log.action === 'shortlist_student' && <CheckCircle size={16} />}
                                                {log.action === 'download_student_data' && <Download size={16} />}
                                            </div>
                                            <div className="activity-details">
                                                <span className="activity-action">
                                                    {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                <span className="activity-time">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <Button onClick={() => setActivityModal({ open: false, agency: null, data: null })}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Grant Access Modal */}
            <Modal
                isOpen={grantAccessModal.open}
                onClose={() => {
                    setGrantAccessModal({ open: false, agency: null });
                    setAccessSettings({ accessExpiryDate: '', downloadLimit: 100 });
                }}
                title="Grant Agency Access"
                size="md"
            >
                <div className="grant-access-modal">
                    <p>Grant <strong>{grantAccessModal.agency?.name}</strong> access to your college students.</p>
                    
                    <div className="form-group">
                        <label>Access Expiry Date (Optional)</label>
                        <Input
                            type="date"
                            value={accessSettings.accessExpiryDate}
                            onChange={(e) => setAccessSettings({ ...accessSettings, accessExpiryDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <span className="help-text">Leave empty for no expiry</span>
                    </div>

                    <div className="form-group">
                        <label>Download Limit</label>
                        <Input
                            type="number"
                            value={accessSettings.downloadLimit}
                            onChange={(e) => setAccessSettings({ ...accessSettings, downloadLimit: parseInt(e.target.value) })}
                            min="1"
                        />
                        <span className="help-text">Maximum number of student profiles they can download</span>
                    </div>

                    <div className="modal-actions">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setGrantAccessModal({ open: false, agency: null });
                                setAccessSettings({ accessExpiryDate: '', downloadLimit: 100 });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleGrantAccess}>
                            Grant Access
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Settings Modal */}
            <Modal
                isOpen={settingsModal.open}
                onClose={() => {
                    setSettingsModal({ open: false, agency: null });
                    setAccessSettings({ accessExpiryDate: '', downloadLimit: 100 });
                }}
                title="Update Access Settings"
                size="md"
            >
                <div className="settings-modal">
                    <p>Update access settings for <strong>{settingsModal.agency?.name}</strong></p>
                    
                    <div className="form-group">
                        <label>Access Expiry Date</label>
                        <Input
                            type="date"
                            value={accessSettings.accessExpiryDate}
                            onChange={(e) => setAccessSettings({ ...accessSettings, accessExpiryDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <span className="help-text">Leave empty for no expiry</span>
                    </div>

                    <div className="form-group">
                        <label>Download Limit</label>
                        <Input
                            type="number"
                            value={accessSettings.downloadLimit}
                            onChange={(e) => setAccessSettings({ ...accessSettings, downloadLimit: parseInt(e.target.value) })}
                            min="1"
                        />
                    </div>

                    <div className="modal-actions">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSettingsModal({ open: false, agency: null });
                                setAccessSettings({ accessExpiryDate: '', downloadLimit: 100 });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateSettings}>
                            Update Settings
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Revoke Access Modal */}
            <Modal
                isOpen={revokeModal.open}
                onClose={() => setRevokeModal({ open: false, agency: null })}
                title="Revoke Agency Access"
                size="sm"
            >
                <div className="revoke-modal">
                    <p>Are you sure you want to revoke access for <strong>{revokeModal.agency?.name}</strong>?</p>
                    <p className="warning-text">They will no longer be able to view or download your student profiles.</p>
                    
                    <div className="modal-actions">
                        <Button
                            variant="secondary"
                            onClick={() => setRevokeModal({ open: false, agency: null })}
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleRevokeAccess}>
                            Revoke Access
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Agencies;
