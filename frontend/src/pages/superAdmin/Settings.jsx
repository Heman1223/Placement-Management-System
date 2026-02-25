import { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import {
    Save, RotateCcw, Settings as SettingsIcon,
    Shield, Eye, Bell, Wrench, ShieldCheck,
    Lock, Mail, Download, Database,
    Users, AlertTriangle, CheckCircle2, ArrowUpRight,
    Target, Zap, Globe, User, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import './AdminPages.css';

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
            toast.error('Failed to load system parameters');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await superAdminAPI.updateSettings(settings);
            toast.success('System configuration synchronized');
            fetchSettings();
        } catch (error) {
            toast.error('Failed to synchronize parameters');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to revert all configurations to factory defaults?')) return;

        try {
            await superAdminAPI.resetSettings();
            toast.success('Factory defaults restored');
            fetchSettings();
        } catch (error) {
            toast.error('Restoration sequence failed');
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

    const Toggle = ({ checked, onChange, disabled }) => (
        <label className="toggle">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                disabled={disabled}
            />
            <span className="toggle-slider"></span>
        </label>
    );

    const ControlItem = ({ title, description, checked, onChange, disabled }) => (
        <div className="notification-item border-b border-[#faf6ef] pb-6 last:border-none last:pb-0">
            <div className="flex-1">
                <h4 className="text-[11px] font-bold text-[#4a2c15] uppercase tracking-wide">{title}</h4>
                {description && <p className="text-[10px] text-[#8b6f5a] font-bold uppercase tracking-widest mt-1">{description}</p>}
            </div>
            <Toggle checked={checked} onChange={onChange} disabled={disabled} />
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-2 border-[#e6d8c3] border-t-[#6b3f1d] rounded-full animate-spin"></div>
            <p className="mt-6 text-[#8b6f5a] text-[10px] font-bold uppercase tracking-widest">Synchronizing Core Engine...</p>
        </div>
    );

    return (
        <div className="admin-page">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[#4a2c15] tracking-tight mb-1">System Configuration</h1>
                    <p className="text-xs text-[#8b6f5a] font-medium uppercase tracking-widest leading-none">Centralized Parameter Governance</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="!rounded-lg !border-[#e6d8c3] !text-[#8b6f5a]"
                    >
                        <RotateCcw size={16} className="mr-2" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Restore Defaults</span>
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                        className="!rounded-lg !bg-[#6b3f1d]"
                    >
                        <Save size={16} className="mr-2" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{saving ? 'Synchronizing...' : 'Sync Configuration'}</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Access Governance */}
                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-[#faf6ef] pb-4">
                        <Shield className="text-[#6b3f1d]" size={18} />
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest">Access Governance</h2>
                    </div>
                    <div className="space-y-6">
                        <ControlItem
                            title="Student Self-Signup"
                            description="Independent talent identification"
                            checked={settings?.studentSelfSignup?.enabled || false}
                            onChange={(val) => updateSetting('studentSelfSignup', 'enabled', val)}
                        />
                        <ControlItem
                            title="Registry Approval"
                            description="Mandated administrative verification"
                            checked={settings?.studentSelfSignup?.requireApproval || false}
                            onChange={(val) => updateSetting('studentSelfSignup', 'requireApproval', val)}
                            disabled={!settings?.studentSelfSignup?.enabled}
                        />
                        <ControlItem
                            title="Agency Integration"
                            description="Authorized placement agency onboarding"
                            checked={settings?.agencyRegistration?.enabled || false}
                            onChange={(val) => updateSetting('agencyRegistration', 'enabled', val)}
                        />
                    </div>
                </div>

                {/* Automation Rules */}
                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-[#faf6ef] pb-4">
                        <Zap className="text-[#c6a85e]" size={18} />
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest">Automation Matrix</h2>
                    </div>
                    <div className="space-y-6">
                        <ControlItem
                            title="Auto-Sync Colleges"
                            description="Instant institutional authorization"
                            checked={settings?.approvalRules?.autoApproveColleges || false}
                            onChange={(val) => updateSetting('approvalRules', 'autoApproveColleges', val)}
                        />
                        <ControlItem
                            title="Auto-Sync Companies"
                            description="Instant corporate authorization"
                            checked={settings?.approvalRules?.autoApproveCompanies || false}
                            onChange={(val) => updateSetting('approvalRules', 'autoApproveCompanies', val)}
                        />
                        <ControlItem
                            title="Compliance Verification"
                            description="Enforce mandatory email validation"
                            checked={settings?.approvalRules?.requireEmailVerification || false}
                            onChange={(val) => updateSetting('approvalRules', 'requireEmailVerification', val)}
                        />
                    </div>
                </div>

                {/* Data Privacy */}
                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-[#faf6ef] pb-4">
                        <Eye className="text-[#6b3f1d]" size={18} />
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest">Privacy Protocol</h2>
                    </div>
                    <div className="space-y-6">
                        <ControlItem
                            title="Corporate Visibility"
                            description="Grant partners access to talent data"
                            checked={settings?.dataVisibility?.studentDataVisibleToCompanies || false}
                            onChange={(val) => updateSetting('dataVisibility', 'studentDataVisibleToCompanies', val)}
                        />
                        <ControlItem
                            title="Agency Access"
                            description="Grant agencies access to talent registry"
                            checked={settings?.dataVisibility?.studentDataVisibleToAgencies || false}
                            onChange={(val) => updateSetting('dataVisibility', 'studentDataVisibleToAgencies', val)}
                        />
                        <ControlItem
                            title="Registry Extraction"
                            description="Allow authorized bulk data exports"
                            checked={settings?.dataVisibility?.allowBulkDownload || false}
                            onChange={(val) => updateSetting('dataVisibility', 'allowBulkDownload', val)}
                        />
                    </div>

                    <div className="mt-8 pt-8 border-t border-[#faf6ef]">
                        <h4 className="text-[10px] font-black text-[#8b6f5a] uppercase tracking-widest mb-6">Visible Data Nodes</h4>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { id: 'contactInfo', label: 'Contact Details' },
                                { id: 'academicDetails', label: 'Academic Vectors' },
                                { id: 'resume', label: 'Resume Repos' },
                                { id: 'personalInfo', label: 'Personal ID' }
                            ].map((field) => (
                                <button
                                    key={field.id}
                                    onClick={() => updateNestedSetting('dataVisibility', 'visibleFields', field.id, !settings?.dataVisibility?.visibleFields?.[field.id])}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${settings?.dataVisibility?.visibleFields?.[field.id]
                                        ? 'bg-[#6b3f1d] text-white border-[#6b3f1d]'
                                        : 'bg-[#faf6ef] text-[#8b6f5a] border-[#e6d8c3] hover:border-[#6b3f1d]/30'
                                        }`}
                                >
                                    {field.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Integrity */}
                <div className="bg-white p-8 rounded-xl border border-[#e6d8c3] shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-[#faf6ef] pb-4">
                        <ShieldAlert className="text-[#b42318]" size={18} />
                        <h2 className="text-sm font-black text-[#4a2c15] uppercase tracking-widest">System Integrity</h2>
                    </div>
                    <div className="bg-[#fdeaea] p-6 rounded-xl border border-[#f5c2c7] mb-8">
                        <ControlItem
                            title="Maintenance Mode"
                            description="Secure platform lockdown protocol"
                            checked={settings?.maintenanceMode?.enabled || false}
                            onChange={(val) => updateSetting('maintenanceMode', 'enabled', val)}
                        />
                        {settings?.maintenanceMode?.enabled && (
                            <div className="mt-6">
                                <label className="text-[10px] font-bold text-[#b42318] uppercase tracking-widest mb-2 block">Lockdown Advisory</label>
                                <textarea
                                    value={settings?.maintenanceMode?.message || ''}
                                    onChange={(e) => updateSetting('maintenanceMode', 'message', e.target.value)}
                                    className="w-full bg-white border border-[#f5c2c7] rounded-lg p-4 text-[10px] font-bold text-[#b42318] uppercase tracking-widest focus:outline-none focus:border-[#b42318] min-h-[100px]"
                                />
                            </div>
                        )}
                    </div>
                    <div className="bg-[#faf6ef] p-6 rounded-xl border border-[#e6d8c3] flex justify-between items-center">
                        <div>
                            <span className="block text-[9px] font-black text-[#8b6f5a] uppercase tracking-widst mb-1">Infrastructure Core</span>
                            <span className="text-[11px] font-bold text-[#4a2c15]">AXON-v3.4.9-PRO</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-[9px] font-black text-[#8b6f5a] uppercase tracking-widest mb-1">Operational Pulse</span>
                            <span className="text-[11px] font-bold text-[#1e7d4d] flex items-center gap-1.5 justify-end">
                                <div className="w-2 h-2 rounded-full bg-[#1e7d4d] animate-pulse" /> NOMINAL status
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
