import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Save, RotateCcw, Settings as SettingsIcon, Shield, Eye, Bell, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPages.css';
import './Settings.css';

const Settings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

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
        if (!window.confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) return;

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
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Platform Settings</h1>
                    <p>Configure system-wide settings and controls</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" onClick={handleReset} icon={RotateCcw}>
                        Reset to Default
                    </Button>
                    <Button onClick={handleSave} disabled={saving} icon={Save}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="settings-container">
                {/* Student Self-Signup */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <Shield size={24} />
                        <div>
                            <h3>Student Self-Signup</h3>
                            <p>Control student registration settings</p>
                        </div>
                    </div>
                    <div className="settings-content">
                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.studentSelfSignup?.enabled || false}
                                    onChange={(e) => updateSetting('studentSelfSignup', 'enabled', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Enable Student Self-Signup</span>
                            </label>
                            <p className="setting-description">Allow students to register themselves</p>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.studentSelfSignup?.requireApproval || false}
                                    onChange={(e) => updateSetting('studentSelfSignup', 'requireApproval', e.target.checked)}
                                    disabled={!settings?.studentSelfSignup?.enabled}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Require Approval</span>
                            </label>
                            <p className="setting-description">Self-registered students need admin approval</p>
                        </div>
                    </div>
                </div>

                {/* Agency Registration */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <Wrench size={24} />
                        <div>
                            <h3>Agency Registration</h3>
                            <p>Control placement agency registration</p>
                        </div>
                    </div>
                    <div className="settings-content">
                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.agencyRegistration?.enabled || false}
                                    onChange={(e) => updateSetting('agencyRegistration', 'enabled', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Enable Agency Registration</span>
                            </label>
                            <p className="setting-description">Allow placement agencies to register</p>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.agencyRegistration?.requireApproval || false}
                                    onChange={(e) => updateSetting('agencyRegistration', 'requireApproval', e.target.checked)}
                                    disabled={!settings?.agencyRegistration?.enabled}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Require Approval</span>
                            </label>
                            <p className="setting-description">Agencies need super admin approval</p>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.agencyRegistration?.autoApprove || false}
                                    onChange={(e) => updateSetting('agencyRegistration', 'autoApprove', e.target.checked)}
                                    disabled={!settings?.agencyRegistration?.enabled}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Auto-Approve</span>
                            </label>
                            <p className="setting-description">Automatically approve agency registrations</p>
                        </div>
                    </div>
                </div>

                {/* Approval Rules */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <SettingsIcon size={24} />
                        <div>
                            <h3>Approval Rules</h3>
                            <p>Configure automatic approval settings</p>
                        </div>
                    </div>
                    <div className="settings-content">
                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.approvalRules?.autoApproveColleges || false}
                                    onChange={(e) => updateSetting('approvalRules', 'autoApproveColleges', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Auto-Approve Colleges</span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.approvalRules?.autoApproveCompanies || false}
                                    onChange={(e) => updateSetting('approvalRules', 'autoApproveCompanies', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Auto-Approve Companies</span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.approvalRules?.autoApproveStudents || false}
                                    onChange={(e) => updateSetting('approvalRules', 'autoApproveStudents', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Auto-Approve Students</span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.approvalRules?.autoApproveAgencies || false}
                                    onChange={(e) => updateSetting('approvalRules', 'autoApproveAgencies', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Auto-Approve Agencies</span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.approvalRules?.requireEmailVerification || false}
                                    onChange={(e) => updateSetting('approvalRules', 'requireEmailVerification', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Require Email Verification</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Maintenance Mode */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <Bell size={24} />
                        <div>
                            <h3>Maintenance Mode</h3>
                            <p>Enable maintenance mode to restrict access</p>
                        </div>
                    </div>
                    <div className="settings-content">
                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.maintenanceMode?.enabled || false}
                                    onChange={(e) => updateSetting('maintenanceMode', 'enabled', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Enable Maintenance Mode</span>
                            </label>
                            <p className="setting-description">
                                {settings?.maintenanceMode?.enabled ? '⚠️ System is in maintenance mode' : 'System is operational'}
                            </p>
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

                {/* Data Visibility */}
                <div className="settings-section">
                    <div className="settings-section-header">
                        <Eye size={24} />
                        <div>
                            <h3>Data Visibility Policies</h3>
                            <p>Control who can see student data</p>
                        </div>
                    </div>
                    <div className="settings-content">
                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.dataVisibility?.studentDataVisibleToCompanies || false}
                                    onChange={(e) => updateSetting('dataVisibility', 'studentDataVisibleToCompanies', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Student Data Visible to Companies</span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.dataVisibility?.studentDataVisibleToAgencies || false}
                                    onChange={(e) => updateSetting('dataVisibility', 'studentDataVisibleToAgencies', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Student Data Visible to Agencies</span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.dataVisibility?.requireCollegeApprovalForAccess || false}
                                    onChange={(e) => updateSetting('dataVisibility', 'requireCollegeApprovalForAccess', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Require College Approval for Access</span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings?.dataVisibility?.allowBulkDownload || false}
                                    onChange={(e) => updateSetting('dataVisibility', 'allowBulkDownload', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <span className="toggle-text">Allow Bulk Download</span>
                            </label>
                        </div>

                        <Input
                            label="Max Downloads Per Day"
                            type="number"
                            min="0"
                            value={settings?.dataVisibility?.maxDownloadsPerDay || 100}
                            onChange={(e) => updateSetting('dataVisibility', 'maxDownloadsPerDay', parseInt(e.target.value))}
                        />

                        <div className="setting-subsection">
                            <h4>Visible Fields</h4>
                            <div className="setting-item">
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={settings?.dataVisibility?.visibleFields?.contactInfo || false}
                                        onChange={(e) => updateNestedSetting('dataVisibility', 'visibleFields', 'contactInfo', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                    <span className="toggle-text">Contact Information</span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={settings?.dataVisibility?.visibleFields?.academicDetails || false}
                                        onChange={(e) => updateNestedSetting('dataVisibility', 'visibleFields', 'academicDetails', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                    <span className="toggle-text">Academic Details</span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={settings?.dataVisibility?.visibleFields?.resume || false}
                                        onChange={(e) => updateNestedSetting('dataVisibility', 'visibleFields', 'resume', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                    <span className="toggle-text">Resume</span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        checked={settings?.dataVisibility?.visibleFields?.personalInfo || false}
                                        onChange={(e) => updateNestedSetting('dataVisibility', 'visibleFields', 'personalInfo', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                    <span className="toggle-text">Personal Information</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button at Bottom */}
            <div className="settings-footer">
                <Button onClick={handleSave} disabled={saving} icon={Save} size="lg">
                    {saving ? 'Saving Changes...' : 'Save All Changes'}
                </Button>
            </div>
        </div>
    );
};

export default Settings;
