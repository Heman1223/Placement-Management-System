import { useState, useEffect } from 'react';
import { companyAPI, uploadAPI, authAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { 
    Building2, Save, RefreshCw, Briefcase, MapPin, 
    Phone, Globe, User, Shield, Users, Camera, Lock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Settings.css';

const CompanySettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [profile, setProfile] = useState({
        name: '',
        industry: '',
        description: '',
        website: '',
        logo: '',
        contactPerson: {
            name: '',
            designation: '',
            email: '',
            phone: ''
        },
        headquarters: {
            city: '',
            state: '',
            country: 'India'
        },
        size: '1-50',
        preferredDepartments: []
    });

    const [passwordModal, setPasswordModal] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await companyAPI.getProfile();
            setProfile(response.data.data);
        } catch (error) {
            console.error('Error fetching company profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        setSaving(true);
        try {
            await companyAPI.updateProfile(profile);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setPasswordSaving(true);
        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        try {
            const response = await uploadAPI.logo(formData);
            setProfile({ ...profile, logo: response.data.data.url });
            toast.success('Logo uploaded successfully');
        } catch (error) {
            console.error('Logo upload error:', error);
            toast.error('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner" /></div>;
    }

    return (
        <div className="settings-page">
            <div className="page-header flex items-center gap-6">
                {profile.logo ? (
                    <div className="w-20 h-20 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                        <img src={profile.logo} alt={profile.name} className="w-full h-full object-contain p-1" />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary-500/10 flex-shrink-0 flex items-center justify-center border border-primary-500/10 shadow-lg">
                        <Building2 size={32} className="text-primary-500" />
                    </div>
                )}
                <div>
                    <h1>Company Settings</h1>
                    <p>Manage your company profile and information</p>
                </div>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <Building2 size={18} />
                    Company Profile
                </button>
                <button
                    className={`tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <Shield size={18} />
                    Account Settings
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="settings-content">
                    {/* Logo Section */}
                    <div className="settings-section">
                        <h3>Company Logo</h3>
                        <p className="section-description">This logo will be visible to colleges and students.</p>
                        
                        <div className="logo-upload-container">
                            <div className="company-logo-preview">
                                {profile.logo ? (
                                    <img src={profile.logo} alt="Company Logo" />
                                ) : (
                                    <div className="logo-placeholder">
                                        <Building2 size={40} />
                                    </div>
                                )}
                                <label htmlFor="logo-upload" className="logo-upload-overlay">
                                    <Camera size={20} />
                                    <span>{uploading ? '...' : 'Upload'}</span>
                                </label>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />
                            </div>
                            <div className="logo-hints">
                                <p>Recommended: Square image, at least 400x400px</p>
                                <p>Max size: 2MB. Format: JPG, PNG, WEBP</p>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Basic Information</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Company Name *</label>
                                <Input
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Industry *</label>
                                <Input
                                    value={profile.industry}
                                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Company Size</label>
                                <select 
                                    className="select-input"
                                    value={profile.size}
                                    onChange={(e) => setProfile({ ...profile, size: e.target.value })}
                                >
                                    <option value="1-50">1-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="501-1000">501-1000 employees</option>
                                    <option value="1000+">1000+ employees</option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label>Website URL</label>
                                <Input
                                    type="url"
                                    icon={Globe}
                                    value={profile.website || ''}
                                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                    placeholder="https://www.example.com"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    className="textarea-input"
                                    value={profile.description || ''}
                                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                    rows="4"
                                    placeholder="Tell us about your company..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Contact Person</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name *</label>
                                <Input
                                    icon={User}
                                    value={profile.contactPerson?.name || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        contactPerson: { ...profile.contactPerson, name: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Designation</label>
                                <Input
                                    icon={Briefcase}
                                    value={profile.contactPerson?.designation || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        contactPerson: { ...profile.contactPerson, designation: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Business Email *</label>
                                <Input
                                    type="email"
                                    value={profile.contactPerson?.email || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        contactPerson: { ...profile.contactPerson, email: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number *</label>
                                <Input
                                    type="tel"
                                    icon={Phone}
                                    value={profile.contactPerson?.phone || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        contactPerson: { ...profile.contactPerson, phone: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Headquarters</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>City</label>
                                <Input
                                    icon={MapPin}
                                    value={profile.headquarters?.city || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        headquarters: { ...profile.headquarters, city: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <Input
                                    value={profile.headquarters?.state || ''}
                                    onChange={(e) => setProfile({
                                        ...profile,
                                        headquarters: { ...profile.headquarters, state: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <Button variant="secondary" icon={RefreshCw} onClick={fetchProfile}>
                            Reset
                        </Button>
                        <Button icon={Save} onClick={handleProfileUpdate} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === 'general' && (
                <div className="settings-content">
                    <div className="settings-section">
                        <h3>Security</h3>
                        <p className="section-description">Manage your account security settings</p>
                        <Button variant="outline" icon={Lock} onClick={() => setPasswordModal(true)}>
                            Change Password
                        </Button>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            <Modal
                isOpen={passwordModal}
                onClose={() => {
                    setPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                title="Change Password"
                size="sm"
            >
                <form onSubmit={handlePasswordChange} className="p-4">
                    <div className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            required
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                        <Input
                            label="New Password"
                            type="password"
                            required
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            required
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => setPasswordModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            loading={passwordSaving}
                            variant="primary"
                        >
                            Update Password
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CompanySettings;
