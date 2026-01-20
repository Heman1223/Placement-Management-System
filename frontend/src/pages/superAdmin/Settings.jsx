import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // API call would go here
            alert('Password updated successfully');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            alert('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Settings</h1>
                <p className="subtitle">Manage your account settings</p>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button
                    className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Security
                </button>
                <button
                    className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notifications
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'profile' && (
                    <div className="settings-section">
                        <h2>Profile Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Email:</span>
                                <span className="value">{user?.email}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Role:</span>
                                <span className="value">{user?.role?.replace('_', ' ')}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Status:</span>
                                <span className="value">
                                    <span className="status-badge status-active">Active</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="settings-section">
                        <h2>Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="settings-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    required
                                    className="input"
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    className="input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                    className="input"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="settings-section">
                        <h2>Notification Preferences</h2>
                        <div className="notification-settings">
                            <div className="notification-item">
                                <div>
                                    <h4>Email Notifications</h4>
                                    <p>Receive email notifications for important updates</p>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="notification-item">
                                <div>
                                    <h4>Application Updates</h4>
                                    <p>Get notified when application status changes</p>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="notification-item">
                                <div>
                                    <h4>New Job Postings</h4>
                                    <p>Receive alerts for new job opportunities</p>
                                </div>
                                <label className="toggle">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
