import { useState, useEffect } from 'react';
import { collegeAPI, uploadAPI } from '../../services/api';
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
                university: profile.university,
                contactEmail: profile.contactEmail,
                phone: profile.phone,
                website: profile.website,
                address: profile.address,
                departments: profile.departments,
                description: profile.description,
                logo: profile.logo
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

    const handleRuleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            placementRules: {
                ...prev.placementRules,
                [key]: value
            }
        }));
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1>Settings</h1>
                <p>Manage your college profile and settings</p>
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
                                    value={profile.university || ''}
                                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                                    placeholder="Enter university name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>College Logo</h3>
                        <p className="section-description">Upload or update your college logo</p>

                        <div className="logo-upload-container">
                            {profile.logo && (
                                <div className="logo-preview">
                                    <img src={profile.logo} alt="College Logo" />
                                </div>
                            )}
                            
                            <div className="logo-actions">
                                <input
                                    type="file"
                                    id="logo-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            try {
                                                const formData = new FormData();
                                                formData.append('logo', file);
                                                const response = await uploadAPI.logo(formData);
                                                setProfile({ ...profile, logo: response.data.data.url });
                                                toast.success('Logo uploaded successfully');
                                            } catch (error) {
                                                toast.error('Failed to upload logo');
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    variant="secondary"
                                    onClick={() => document.getElementById('logo-upload').click()}
                                >
                                    {profile.logo ? 'Change Logo' : 'Upload Logo'}
                                </Button>
                                {profile.logo && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => setProfile({ ...profile, logo: '' })}
                                    >
                                        Remove Logo
                                    </Button>
                                )}
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
                                <select
                                    className="department-select"
                                    value=""
                                    onChange={(e) => {
                                        const dept = e.target.value;
                                        if (dept && !profile.departments.includes(dept)) {
                                            setProfile({
                                                ...profile,
                                                departments: [...profile.departments, dept]
                                            });
                                        }
                                    }}
                                >
                                    <option value="">Select a department to add</option>
                                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                                    <option value="Electrical Engineering">Electrical Engineering</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                    <option value="Civil Engineering">Civil Engineering</option>
                                    <option value="Chemical Engineering">Chemical Engineering</option>
                                    <option value="Aerospace Engineering">Aerospace Engineering</option>
                                    <option value="Biotechnology">Biotechnology</option>
                                    <option value="Automobile Engineering">Automobile Engineering</option>
                                    <option value="Industrial Engineering">Industrial Engineering</option>
                                    <option value="Production Engineering">Production Engineering</option>
                                    <option value="Instrumentation Engineering">Instrumentation Engineering</option>
                                    <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Cyber Security">Cyber Security</option>
                                    <option value="Business Administration (MBA)">Business Administration (MBA)</option>
                                    <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Economics">Economics</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                    <option value="English">English</option>
                                    <option value="Psychology">Psychology</option>
                                    <option value="Sociology">Sociology</option>
                                    <option value="Political Science">Political Science</option>
                                    <option value="History">History</option>
                                    <option value="Law">Law</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                    <option value="Nursing">Nursing</option>
                                    <option value="Medicine (MBBS)">Medicine (MBBS)</option>
                                    <option value="Dentistry">Dentistry</option>
                                    <option value="Architecture">Architecture</option>
                                    <option value="Fashion Design">Fashion Design</option>
                                    <option value="Hotel Management">Hotel Management</option>
                                    <option value="Mass Communication">Mass Communication</option>
                                    <option value="Journalism">Journalism</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Forestry">Forestry</option>
                                    <option value="Environmental Science">Environmental Science</option>
                                </select>
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

                        <div className="toggle-group mt-6">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <label>Allow Multiple Offers</label>
                                    <span className="toggle-description">Students can accept more than one offer</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.placementRules?.allowMultipleOffers}
                                        onChange={(e) => handleRuleChange('allowMultipleOffers', e.target.checked)}
                                        disabled={loading}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <label>Show Student Data Without Approval</label>
                                    <span className="toggle-description">If disabled, companies must request partnership to see student data</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.placementRules?.showDataWithoutApproval !== false}
                                        onChange={(e) => handleRuleChange('showDataWithoutApproval', e.target.checked)}
                                        disabled={loading}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <label>Require Resume Upload</label>
                                    <span className="toggle-description">Students must upload resume to apply for jobs</span>
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
