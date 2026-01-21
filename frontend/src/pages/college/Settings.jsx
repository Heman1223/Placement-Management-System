import { useState, useEffect } from 'react';
import { collegeAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Settings as SettingsIcon, Building2, Save, RefreshCw, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile'); // profile, placement, general
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: '',
        code: '',
        university: '',
        contactEmail: '',
        phone: '',
        website: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        departments: [],
        description: ''
    });

    const [settings, setSettings] = useState({
        allowStudentSelfSignup: false,
        placementRules: {
            minCGPA: 6.0,
            maxActiveBacklogs: 2,
            allowMultipleOffers: true,
            requireResumeUpload: true
        }
    });

    const [newDepartment, setNewDepartment] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, settingsRes] = await Promise.all([
                collegeAPI.getCollegeProfile(),
                collegeAPI.getCollegeSettings()
            ]);

            setProfile(profileRes.data.data);
            setSettings(settingsRes.data.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        setSaving(true);
        try {
            await collegeAPI.updateCollegeProfile({
                contactEmail: profile.contactEmail,
                phone: profile.phone,
                website: profile.website,
                address: profile.address,
                departments: profile.departments,
                description: profile.description
            });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSettingsUpdate = async () => {
        setSaving(true);
        try {
            await collegeAPI.updateCollegeSettings(settings);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleAddDepartment = () => {
        if (newDepartment.trim() && !profile.departments.includes(newDepartment.trim())) {
            setProfile({
                ...profile,
                departments: [...profile.departments, newDepartment.trim()]
            });
            setNewDepartment('');
        }
    };

    const handleRemoveDepartment = (dept) => {
        setProfile({
            ...profile,
            departments: profile.departments.filter(d => d !== dept)
        });
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your college profile and settings</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <Building2 size={18} />
                    College Profile
                </button>
                <button
                    className={`tab ${activeTab === 'placement' ? 'active' : ''}`}
                    onClick={() => setActiveTab('placement')}
                >
                    <Shield size={18} />
                    Placement Rules
                </button>
                <button
                    className={`tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <Users size={18} />
                    General Settings
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="settings-content">
                    <div className="settings-section">
                        <h3>Basic Information</h3>
                        <p className="section-description">View and update your college information</p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>College Name</label>
                                <Input
                                    value={profile.name}
                                    disabled
                                />
                                <span className="help-text">Contact super admin to change</span>
                            </div>

                            <div className="form-group">
                                <label>College Code</label>
                                <Input
                                    value={profile.code}
                                    disabled
                                />
                                <span className="help-text">Contact super admin to change</span>
                            </div>

                            <div className="form-group">
                                <label>University</label>
                                <Input
                                    value={profile.university}
                                    disabled
                                />
                                <span className="help-text">Contact super admin to change</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Contact Information</h3>
                        <p className="section-description">Update your contact details</p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Contact Email *</label>
                                <Input
                                    type="email"
                                    value={profile.contactEmail}
                                    onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <Input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Website</label>
                                <Input
                                    type="url"
                                    value={profile.website || ''}
                                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                    placeholder="https://www.example.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Address</h3>
                        <p className="section-description">Update your college address</p>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Street Address</label>
                                <Input
                                    value={profile.address?.street || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        address: { ...profile.address, street: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>City *</label>
                                <Input
                                    value={profile.address?.city || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        address: { ...profile.address, city: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>State *</label>
                                <Input
                                    value={profile.address?.state || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        address: { ...profile.address, state: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Pincode</label>
                                <Input
                                    value={profile.address?.pincode || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        address: { ...profile.address, pincode: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Country</label>
                                <Input
                                    value={profile.address?.country || 'India'}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        address: { ...profile.address, country: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Departments</h3>
                        <p className="section-description">Manage departments offered by your college</p>

                        <div className="departments-manager">
                            <div className="add-department">
                                <Input
                                    value={newDepartment}
                                    onChange={(e) => setNewDepartment(e.target.value)}
                                    placeholder="Enter department name"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddDepartment()}
                                />
                                <Button onClick={handleAddDepartment}>Add</Button>
                            </div>

                            <div className="departments-list">
                                {profile.departments?.map((dept, index) => (
                                    <div key={index} className="department-tag">
                                        <span>{dept}</span>
                                        <button onClick={() => handleRemoveDepartment(dept)}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Description</h3>
                        <p className="section-description">Brief description about your college</p>

                        <div className="form-group">
                            <textarea
                                className="textarea-input"
                                value={profile.description || ''}
                                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                rows="4"
                                placeholder="Enter college description..."
                            />
                        </div>
                    </div>

                    <div className="settings-actions">
                        <Button variant="secondary" icon={RefreshCw} onClick={fetchData}>
                            Reset
                        </Button>
                        <Button icon={Save} onClick={handleProfileUpdate} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Placement Rules Tab */}
            {activeTab === 'placement' && (
                <div className="settings-content">
                    <div className="settings-section">
                        <h3>Placement Eligibility Rules</h3>
                        <p className="section-description">Configure rules for student placement eligibility</p>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Minimum CGPA</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={settings.placementRules?.minCGPA || 6.0}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        placementRules: {
                                            ...settings.placementRules,
                                            minCGPA: parseFloat(e.target.value)
                                        }
                                    })}
                                />
                                <span className="help-text">Students below this CGPA won't be eligible</span>
                            </div>

                            <div className="form-group">
                                <label>Maximum Active Backlogs</label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={settings.placementRules?.maxActiveBacklogs || 2}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        placementRules: {
                                            ...settings.placementRules,
                                            maxActiveBacklogs: parseInt(e.target.value)
                                        }
                                    })}
                                />
                                <span className="help-text">Maximum allowed active backlogs</span>
                            </div>
                        </div>

                        <div className="toggle-group">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <label>Allow Multiple Offers</label>
                                    <span className="toggle-description">
                                        Students can accept multiple job offers
                                    </span>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.placementRules?.allowMultipleOffers || false}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            placementRules: {
                                                ...settings.placementRules,
                                                allowMultipleOffers: e.target.checked
                                            }
                                        })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <label>Require Resume Upload</label>
                                    <span className="toggle-description">
                                        Students must upload resume to apply for jobs
                                    </span>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.placementRules?.requireResumeUpload || false}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            placementRules: {
                                                ...settings.placementRules,
                                                requireResumeUpload: e.target.checked
                                            }
                                        })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <Button variant="secondary" icon={RefreshCw} onClick={fetchData}>
                            Reset
                        </Button>
                        <Button icon={Save} onClick={handleSettingsUpdate} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}

            {/* General Settings Tab */}
            {activeTab === 'general' && (
                <div className="settings-content">
                    <div className="settings-section">
                        <h3>Student Registration</h3>
                        <p className="section-description">Control how students can register</p>

                        <div className="toggle-group">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <label>Allow Student Self-Signup</label>
                                    <span className="toggle-description">
                                        Students can register themselves without admin approval
                                    </span>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.allowStudentSelfSignup || false}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            allowStudentSelfSignup: e.target.checked
                                        })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="info-box">
                            <SettingsIcon size={20} />
                            <div>
                                <strong>Note:</strong> When enabled, students can register themselves. 
                                They will still need to be verified by you before they can apply for jobs.
                            </div>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <Button variant="secondary" icon={RefreshCw} onClick={fetchData}>
                            Reset
                        </Button>
                        <Button icon={Save} onClick={handleSettingsUpdate} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
