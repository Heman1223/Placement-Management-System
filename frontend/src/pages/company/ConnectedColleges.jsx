import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { companyAPI } from '../../services/api';
import { Lock } from 'lucide-react';
import './ConnectedColleges.css';

const ConnectedColleges = () => {
    const navigate = useNavigate();
    const [myColleges, setMyColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal State
    const [availableColleges, setAvailableColleges] = useState([]);
    const [paramLoading, setParamLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMyColleges();
    }, []);

    const fetchMyColleges = async () => {
        try {
            setLoading(true);
            const response = await companyAPI.getRequestedColleges();
            if (response.data.success) {
                setMyColleges(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch connected colleges');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableColleges = async () => {
        try {
            setParamLoading(true);
            // Re-using getColleges which likely returns list of all colleges
            const response = await companyAPI.getColleges();
            if (response.data.success) {
                // Filter out colleges we already have a connection/request with
                const connectedIds = myColleges.map(c => c.college?._id).filter(Boolean);
                const filtered = response.data.data.filter(c => !connectedIds.includes(c._id));
                setAvailableColleges(filtered);
            }
        } catch (error) {
            toast.error('Failed to fetch colleges');
        } finally {
            setParamLoading(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        fetchAvailableColleges();
    };

    const handleRequestAccess = async (collegeId) => {
        try {
            const response = await companyAPI.requestCollegeAccess({ collegeId });
            if (response.data.success) {
                toast.success('Access request sent successfully');
                fetchMyColleges(); // Refresh list
                setIsModalOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    const handleViewStudents = (collegeId) => {
        navigate('/company/search', { state: { collegeId } });
    };

    const handleScheduleDrive = (collegeId) => {
        navigate(`/company/jobs/new?collegeId=${collegeId}`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="status-badge approved">Approved</span>;
            case 'rejected': return <span className="status-badge rejected">Rejected</span>;
            default: return <span className="status-badge pending">Pending</span>;
        }
    };

    const filteredAvailable = availableColleges.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="connected-colleges-container">
            <div className="header-section">
                <div>
                    <h1>University Partnerships</h1>
                    <p>Manage your campus connections and placement authorizations</p>
                </div>
                <button className="btn-primary" onClick={handleOpenModal}>
                    + Connect New College
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Loading...</div>
            ) : myColleges.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏛️</div>
                    <h3>No Connections Yet</h3>
                    <p>Connect with colleges to start hiring their students.</p>
                    <button className="btn-secondary" onClick={handleOpenModal}>Browse Colleges</button>
                </div>
            ) : (
                <div className="colleges-grid">
                    {myColleges.map((item) => (
                        <div key={item.college?._id} className="college-card">
                            <div className="college-header">
                                <div className="college-logo">🏛️</div>
                                <div className="college-info">
                                    <h3>{item.college?.name}</h3>
                                    <span className="location">{item.college?.city}, {item.college?.state}</span>
                                </div>
                            </div>
                            <div className="connection-status">
                                <div className="status-row">
                                    <span>Status</span>
                                    {getStatusBadge(item.status)}
                                </div>
                                <div className="status-row">
                                    <span>Requested</span>
                                    <span>{new Date(item.requestedAt).toLocaleDateString()}</span>
                                </div>
                                {item.remarks && (
                                    <div className="remarks">
                                        <strong>Note:</strong> {item.remarks}
                                    </div>
                                )}
                            </div>
                            {item.status === 'approved' && (
                                <div className="card-actions">
                                    <button
                                        className="btn-outline"
                                        onClick={() => handleViewStudents(item.college?._id)}
                                    >
                                        View Students
                                    </button>
                                    <button
                                        className="btn-text"
                                        onClick={() => handleScheduleDrive(item.college?._id)}
                                    >
                                        Schedule Drive
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Connect with College</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                placeholder="Search colleges by name or city..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <div className="available-list">
                                {paramLoading ? (
                                    <div className="loading-small">Loading...</div>
                                ) : filteredAvailable.length > 0 ? (
                                    filteredAvailable.map(college => (
                                        <div key={college._id} className="available-item">
                                            <div className="item-info">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <strong>{college.name}</strong>
                                                    {college.isLocked && <Lock size={14} color="#94a3b8" title="Data Locked - Request Access" />}
                                                </div>
                                                <span>{college.city}, {college.state}</span>
                                            </div>
                                            <button
                                                className="btn-sm btn-primary"
                                                onClick={() => handleRequestAccess(college._id)}
                                            >
                                                Request
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-results">No colleges found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConnectedColleges;
