import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Bell } from 'lucide-react';
import './AdminPages.css';

const AddCompany = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        companyType: 'company',
        industry: '',
        description: '',
        website: '',
        contactPerson: '',
        contactEmail: '',
        phone: '',
        city: '',
        state: '',
        size: '',
        userEmail: '',
        userPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await superAdminAPI.createCompany(formData);
            toast.success('Company created successfully!');
            navigate('/admin/companies');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create company');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="colleges-header">
                <div className="header-title-area">
                    <button onClick={() => navigate('/admin/companies')} className="back-btn mb-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-400)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                        <ArrowLeft size={16} />
                        Back to Companies
                    </button>
                    <h1>Entity Registration</h1>
                    <p>Super Admin Portal</p>
                </div>
                <div className="header-controls">
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-section">
                    <h3>Company Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Company Name *</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Type *</label>
                            <select
                                name="companyType"
                                value={formData.companyType}
                                onChange={handleChange}
                                required
                                className="input"
                            >
                                <option value="company">Company</option>
                                <option value="placement_agency">Placement Agency</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Industry *</label>
                            <input
                                type="text"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                required
                                className="input"
                                placeholder="e.g., IT, Manufacturing"
                            />
                        </div>

                        <div className="form-group">
                            <label>Website</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Company Size</label>
                            <select
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="">Select Size</option>
                                <option value="1-50">1-50</option>
                                <option value="51-200">51-200</option>
                                <option value="201-500">201-500</option>
                                <option value="501-1000">501-1000</option>
                                <option value="1000+">1000+</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Contact Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Contact Person *</label>
                            <input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Contact Email *</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Headquarters</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>State *</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>User Account</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>User Email *</label>
                            <input
                                type="email"
                                name="userEmail"
                                value={formData.userEmail}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>User Password *</label>
                            <input
                                type="password"
                                name="userPassword"
                                value={formData.userPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/companies')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Creating...' : 'Create Company'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCompany;
