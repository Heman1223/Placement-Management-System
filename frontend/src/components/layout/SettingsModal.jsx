import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { Save, RotateCcw, Shield, Eye, Bell, Wrench, Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('registration');

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await superAdminAPI.getSettings();
            setSettings(response.data.data);
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await superAdminAPI.updateSettings(settings);
            toast.success('Settings saved successfully');
            fetchSettings();
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset all settings to default? This cannot be undone.')) return;

        try {
            await superAdminAPI.resetSettings();
            toast.success('Settings reset to default');
            fetchSettings();
        } catch (error) {
            toast.error('Failed to reset settings');
        }
    };

    const updateSetting = (section, field, value) => {
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [field]: value
            }
        });
    };

    const updateNestedSetting = (section, subsection, field, value) => {
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [subsection]: {
                    ...settings[section][subsection],
                    [field]: value
                }
            }
        });
    };

    if (loading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Platform Settings" size="xl">
                <div className="settings-loading">
                    <div className="loading-spinner" />
                    <p>Loading settings...</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Platform Settings" size="xl">
            <div className="settings-modal-container">
                {/* Tabs */}
                <div className="settings-tabs">
                    <button
                        className={`settings-tab ${activeTab === 'registration' ? 'active' : ''}`}
                        onClick={() => setActiveTab('registration')}
                    >
                        <Shield size={18} />
                        Registration
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'approval' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approval')}
                    >
                        <SettingsIcon size={18} />
                        Approval Rules
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'maintenance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('maintenance')}
                    >
                        <Bell size={18} />
                        Maintenance
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'visibility' ? 'active' : ''}`}
                        onClick={() => setActiveTab('visibility')}
                    >
                        <Eye size={18} />
                        Data Visibility
                    </button>
                </div>

                {/* Content */}
                <div className="settings-modal-content">
                    {/* Registration Tab */}
                    {activeTab === 'registration' && (
                        <div className="settings-tab-content">
                            <h3>Registration Controls</h3>

                            {/* Student Self-Signup */}
                            <div className="settings-group">
                                <h4>Student Self-Signup</h4>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Enable Student Self-Signup</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.studentSelfSignup?.enabled || false}
                                            onChange={(e) => updateSetting('studentSelfSignup', 'enabled', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Require Approval</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.studentSelfSignup?.requireApproval || false}
                                            onChange={(e) => updateSetting('studentSelfSignup', 'requireApproval', e.target.checked)}
                                            disabled={!settings?.studentSelfSignup?.enabled}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Agency Registration */}
                            <div className="settings-group">
                                <h4>Agency Registration</h4>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Enable Agency Registration</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.agencyRegistration?.enabled || false}
                                            onChange={(e) => updateSetting('agencyRegistration', 'enabled', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Require Approval</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.agencyRegistration?.requireApproval || false}
                                            onChange={(e) => updateSetting('agencyRegistration', 'requireApproval', e.target.checked)}
                                            disabled={!settings?.agencyRegistration?.enabled}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Approval Rules Tab */}
                    {activeTab === 'approval' && (
                        <div className="settings-tab-content">
                            <h3>Approval Rules</h3>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Auto-Approve Colleges</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.approvalRules?.autoApproveColleges || false}
                                            onChange={(e) => updateSetting('approvalRules', 'autoApproveColleges', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Auto-Approve Companies</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.approvalRules?.autoApproveCompanies || false}
                                            onChange={(e) => updateSetting('approvalRules', 'autoApproveCompanies', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Auto-Approve Students</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.approvalRules?.autoApproveStudents || false}
                                            onChange={(e) => updateSetting('approvalRules', 'autoApproveStudents', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Auto-Approve Agencies</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.approvalRules?.autoApproveAgencies || false}
                                            onChange={(e) => updateSetting('approvalRules', 'autoApproveAgencies', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Maintenance Tab */}
                    {activeTab === 'maintenance' && (
                        <div className="settings-tab-content">
                            <h3>Maintenance Mode</h3>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Enable Maintenance Mode</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.maintenanceMode?.enabled || false}
                                            onChange={(e) => updateSetting('maintenanceMode', 'enabled', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    {settings?.maintenanceMode?.enabled && (
                                        <p className="setting-warning">⚠️ System is in maintenance mode</p>
                                    )}
                                </div>
                                <Input
                                    label="Maintenance Message"
                                    value={settings?.maintenanceMode?.message || ''}
                                    onChange={(e) => updateSetting('maintenanceMode', 'message', e.target.value)}
                                    placeholder="System is under maintenance..."
                                    disabled={!settings?.maintenanceMode?.enabled}
                                />
                            </div>
                        </div>
                    )}

                    {/* Data Visibility Tab */}
                    {activeTab === 'visibility' && (
                        <div className="settings-tab-content">
                            <h3>Data Visibility Policies</h3>
                            <div className="settings-group">
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Visible to Companies</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.dataVisibility?.studentDataVisibleToCompanies || false}
                                            onChange={(e) => updateSetting('dataVisibility', 'studentDataVisibleToCompanies', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Visible to Agencies</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.dataVisibility?.studentDataVisibleToAgencies || false}
                                            onChange={(e) => updateSetting('dataVisibility', 'studentDataVisibleToAgencies', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <div className="setting-item">
                                    <label className="toggle-label">
                                        <span className="toggle-text">Allow Bulk Download</span>
                                        <input
                                            type="checkbox"
                                            checked={settings?.dataVisibility?.allowBulkDownload || false}
                                            onChange={(e) => updateSetting('dataVisibility', 'allowBulkDownload', e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <Input
                                    label="Max Downloads Per Day"
                                    type="number"
                                    min="0"
                                    value={settings?.dataVisibility?.maxDownloadsPerDay || 100}
                                    onChange={(e) => updateSetting('dataVisibility', 'maxDownloadsPerDay', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="settings-modal-footer">
                    <Button variant="outline" onClick={handleReset} icon={RotateCcw}>
                        Reset
                    </Button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving} icon={Save}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
