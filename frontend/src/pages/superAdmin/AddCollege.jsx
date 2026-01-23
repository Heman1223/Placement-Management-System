import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Bell } from 'lucide-react';
import './AdminPages.css';

const AddCollege = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        collegeName: '',
        collegeCode: '',
        university: '',
        city: '',
        state: '',
        pincode: '',
        contactEmail: '',
        phone: '',
        website: '',
        departments: '',
        adminEmail: '',
        adminPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                departments: formData.departments.split(',').map(d => d.trim()).filter(d => d)
            };

            await superAdminAPI.createCollege(data);
            toast.success('College created successfully!');
            navigate('/admin/colleges');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create college');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="colleges-header">
                <div className="header-title-area">
                    <button onClick={() => navigate('/admin/colleges')} className="back-btn mb-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-400)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                        <ArrowLeft size={16} />
                        Back to Colleges
                    </button>
                    <h1>Registration Hub</h1>
                    <p>Super Admin Portal</p>
                </div>
                <div className="header-controls">
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-section">
                    <h3>College Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>College Name *</label>
                            <input
                                type="text"
                                name="collegeName"
                                value={formData.collegeName}
                                onChange={handleChange}
                                required
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>College Code *</label>
                            <input
                                type="text"
                                name="collegeCode"
                                value={formData.collegeCode}
                                onChange={handleChange}
                                required
                                className="input"
                                placeholder="e.g., MIT, IIT"
                            />
                        </div>

                        <div className="form-group">
                            <label>University</label>
                            <input
                                type="text"
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
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
                    </div>
                </div>

                <div className="form-section">
                    <h3>Address</h3>
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

                        <div className="form-group">
                            <label>Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Departments</h3>
                    <div className="form-group">
                        <label>Departments (comma-separated)</label>
                        <input
                            type="text"
                            name="departments"
                            value={formData.departments}
                            onChange={handleChange}
                            className="input"
                            placeholder="Computer Science, Mechanical, Civil"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Admin Account</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Admin Email *</label>
                            <input
                                type="email"
                                name="adminEmail"
                                value={formData.adminEmail}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Admin Password *</label>
                            <input
                                type="password"
                                name="adminPassword"
                                value={formData.adminPassword}
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
                        onClick={() => navigate('/admin/colleges')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Creating...' : 'Create College'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCollege;
