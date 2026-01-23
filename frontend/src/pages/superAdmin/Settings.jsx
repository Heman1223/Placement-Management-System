import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { 
    Save, RotateCcw, Settings as SettingsIcon, 
    Shield, Eye, Bell, Wrench, ShieldCheck, 
    Lock, Mail, Download, Database, 
    Users, AlertTriangle, CheckCircle2, ArrowUpRight
} from 'lucide-react';
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
            toast.success('System configuration updated');
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
            toast.success('Configuration restored to defaults');
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="table-loader-cell" style={{ height: '80vh' }}>
                <div className="loader-content">
                    <div className="spinner"></div>
                    <span>Initializing system parameters...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="admin-page"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="colleges-header">
                <div className="header-title-area">
                    <motion.h1 variants={sectionVariants}>Platform Configuration</motion.h1>
                    <motion.p className="subtitle" variants={sectionVariants}>
                        Super Admin Portal
                    </motion.p>
                </div>
                <div className="header-controls">
                    <button className="icon-btn" onClick={handleReset} title="Factory Reset">
                        <RotateCcw size={20} />
                    </button>
                    <button className="icon-btn" onClick={handleSave} disabled={saving} title="Apply Config">
                        <Save size={20} />
                    </button>
                </div>
            </div>

            <div className="settings-modern-grid">
                {/* Registration Control */}
                <motion.div className="settings-card" variants={sectionVariants}>
                    <div className="settings-card-header">
                        <div className="icon-wrapper purple">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3>Access Control</h3>
                            <p>Manage membership and registration flows</p>
                        </div>
                    </div>
                    <div className="settings-card-body">
                        <div className="control-item">
                            <div className="control-info">
                                <span className="control-title">Student Self-Signup</span>
                                <span className="control-desc">Allow independent student registration</span>
                            </div>
                            <label className="modern-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings?.studentSelfSignup?.enabled || false}
                                    onChange={(e) => updateSetting('studentSelfSignup', 'enabled', e.target.checked)}
                                />
                                <span className="toggle-track"></span>
                            </label>
                        </div>

                        <div className="control-item">
                            <div className="control-info">
                                <span className="control-title">Require Verification</span>
                                <span className="control-desc">Admin must approve self-registered students</span>
                            </div>
                            <label className="modern-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings?.studentSelfSignup?.requireApproval || false}
                                    onChange={(e) => updateSetting('studentSelfSignup', 'requireApproval', e.target.checked)}
                                    disabled={!settings?.studentSelfSignup?.enabled}
                                />
                                <span className="toggle-track"></span>
                            </label>
                        </div>
                        
                        <div className="divider" />

                        <div className="control-item">
                            <div className="control-info">
                                <span className="control-title">Agency Registration</span>
                                <span className="control-desc">Allow placement agencies to join the platform</span>
                            </div>
                            <label className="modern-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings?.agencyRegistration?.enabled || false}
                                    onChange={(e) => updateSetting('agencyRegistration', 'enabled', e.target.checked)}
                                />
                                <span className="toggle-track"></span>
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* Automation Rules */}
                <motion.div className="settings-card" variants={sectionVariants}>
                    <div className="settings-card-header">
                        <div className="icon-wrapper blue">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3>Automation Rules</h3>
                            <p>Define automatic trust and verification logic</p>
                        </div>
                    </div>
                    <div className="settings-card-body">
                        <div className="control-grid">
                            <div className="control-item">
                                <span className="control-title">Auto-Approve Colleges</span>
                                <label className="modern-toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings?.approvalRules?.autoApproveColleges || false}
                                        onChange={(e) => updateSetting('approvalRules', 'autoApproveColleges', e.target.checked)}
                                    />
                                    <span className="toggle-track"></span>
                                </label>
                            </div>
                            <div className="control-item">
                                <span className="control-title">Auto-Approve Companies</span>
                                <label className="modern-toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings?.approvalRules?.autoApproveCompanies || false}
                                        onChange={(e) => updateSetting('approvalRules', 'autoApproveCompanies', e.target.checked)}
                                    />
                                    <span className="toggle-track"></span>
                                </label>
                            </div>
                            <div className="control-item">
                                <span className="control-title">Auto-Approve Agencies</span>
                                <label className="modern-toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings?.approvalRules?.autoApproveAgencies || false}
                                        onChange={(e) => updateSetting('approvalRules', 'autoApproveAgencies', e.target.checked)}
                                    />
                                    <span className="toggle-track"></span>
                                </label>
                            </div>
                            <div className="control-item">
                                <span className="control-title">Email Verification</span>
                                <label className="modern-toggle">
                                    <input
                                        type="checkbox"
                                        checked={settings?.approvalRules?.requireEmailVerification || false}
                                        onChange={(e) => updateSetting('approvalRules', 'requireEmailVerification', e.target.checked)}
                                    />
                                    <span className="toggle-track"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Maintenance Mode */}
                <motion.div className="settings-card warning-card" variants={sectionVariants}>
                    <div className="settings-card-header">
                        <div className="icon-wrapper amber">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3>System Continuity</h3>
                            <p>Platform status and emergency controls</p>
                        </div>
                    </div>
                    <div className="settings-card-body">
                        <div className="control-item">
                            <div className="control-info">
                                <span className="control-title">Maintenance Mode</span>
                                <span className="control-desc">Restrict access and display maintenance screen</span>
                            </div>
                            <label className="modern-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings?.maintenanceMode?.enabled || false}
                                    onChange={(e) => updateSetting('maintenanceMode', 'enabled', e.target.checked)}
                                />
                                <span className="toggle-track"></span>
                            </label>
                        </div>
                        
                        <div className="maintenance-config">
                            <Input
                                label="Broadcast Message"
                                value={settings?.maintenanceMode?.message || ''}
                                onChange={(e) => updateSetting('maintenanceMode', 'message', e.target.value)}
                                placeholder="System update in progress..."
                                disabled={!settings?.maintenanceMode?.enabled}
                                className="maintenance-input"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Data Visibility */}
                <motion.div className="settings-card" variants={sectionVariants}>
                    <div className="settings-card-header">
                        <div className="icon-wrapper green">
                            <Eye size={20} />
                        </div>
                        <div>
                            <h3>Data Privacy Policy</h3>
                            <p>Control visibility of sensitive student information</p>
                        </div>
                    </div>
                    <div className="settings-card-body">
                        <div className="control-item">
                            <span className="control-title">Visible to Corporate Partners</span>
                            <label className="modern-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings?.dataVisibility?.studentDataVisibleToCompanies || false}
                                    onChange={(e) => updateSetting('dataVisibility', 'studentDataVisibleToCompanies', e.target.checked)}
                                />
                                <span className="toggle-track"></span>
                            </label>
                        </div>

                        <div className="control-item">
                            <span className="control-title">Visible to Placement Agencies</span>
                            <label className="modern-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings?.dataVisibility?.studentDataVisibleToAgencies || false}
                                    onChange={(e) => updateSetting('dataVisibility', 'studentDataVisibleToAgencies', e.target.checked)}
                                />
                                <span className="toggle-track"></span>
                            </label>
                        </div>

                        <div className="control-item">
                            <div className="control-info">
                                <span className="control-title">Bulk Export Authorization</span>
                                <span className="control-desc">Allow downloading large datasets</span>
                            </div>
                            <label className="modern-toggle">
                                <input
                                    type="checkbox"
                                    checked={settings?.dataVisibility?.allowBulkDownload || false}
                                    onChange={(e) => updateSetting('dataVisibility', 'allowBulkDownload', e.target.checked)}
                                />
                                <span className="toggle-track"></span>
                            </label>
                        </div>

                        <div className="divider pf-16" />

                        <div className="setting-subsection">
                            <h4>Granular Visibility Fields</h4>
                            <div className="visibility-chips">
                                {[
                                    { id: 'contactInfo', label: 'Contact Details', icon: Mail },
                                    { id: 'academicDetails', label: 'Academic Records', icon: Database },
                                    { id: 'resume', label: 'Digital Resumes', icon: Download },
                                    { id: 'personalInfo', label: 'Personal Attributes', icon: User }
                                ].map((field) => (
                                    <button
                                        key={field.id}
                                        className={`visibility-chip ${settings?.dataVisibility?.visibleFields?.[field.id] ? 'active' : ''}`}
                                        onClick={() => updateNestedSetting('dataVisibility', 'visibleFields', field.id, !settings?.dataVisibility?.visibleFields?.[field.id])}
                                    >
                                        <field.icon size={14} />
                                        <span>{field.label}</span>
                                        {settings?.dataVisibility?.visibleFields?.[field.id] && <CheckCircle2 size={12} className="check" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Persistent Save Footer */}
            <motion.div 
                className="settings-action-footer"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="footer-content">
                    <div className="status-indicator">
                        <div className="pulse-dot"></div>
                        <span>Unsaved modifications detected</span>
                    </div>
                    <div className="footer-actions">
                        <Button variant="outline" onClick={fetchSettings}>Discard</Button>
                        <Button onClick={handleSave} disabled={saving} variant="primary" size="lg">
                            {saving ? 'Synchronizing...' : 'Save All Configuration'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Settings;
