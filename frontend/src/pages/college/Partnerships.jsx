import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { collegeAPI } from '../../services/api';
import './Partnerships.css';

const Partnerships = () => {
    const [activeTab, setActiveTab] = useState('pending'); // pending, active
    const [requests, setRequests] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pending') {
                const response = await collegeAPI.getCompanyRequests();
                if (response.data.success) {
                    setRequests(response.data.data);
                }
            } else {
                const response = await collegeAPI.getConnectedCompanies();
                if (response.data.success) {
                    setPartners(response.data.data);
                }
            }
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = async (companyId, status) => {
        try {
            const response = await collegeAPI.respondToCompanyRequest(companyId, { status });
            if (response.data.success) {
                toast.success(`Request ${status} successfully`);
                fetchData(); // Refresh
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleRevoke = async (companyId) => {
        if (!window.confirm('Are you sure you want to revoke access for this company? They will no longer be able to hire your students.')) {
            return;
        }

        try {
            const response = await collegeAPI.revokeCompanyAccess(companyId);
            if (response.data.success) {
                toast.success('Access revoked successfully');
                fetchData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="partnerships-container">
            <div className="header-section">
                <h1>Industry Partnerships</h1>
                <p>Manage company approvals and active recruitment partners</p>
            </div>

            <div className="tabs-container">
                <button 
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Requests
                    {requests.length > 0 && <span className="badge-count">{requests.length}</span>}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Partners
                </button>
            </div>

            <div className="content-area">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : activeTab === 'pending' ? (
                    <div className="requests-list">
                        {requests.length === 0 ? (
                            <div className="empty-state">No pending requests</div>
                        ) : (
                            requests.map(req => (
                                <div key={req._id} className="request-card">
                                    <div className="company-info">
                                        <div className="info-header">
                                            <h3>{req?.name}</h3>
                                            <span className="industry-tag">{req?.industry}</span>
                                        </div>
                                        <p><strong>Contact:</strong> {req?.contactPerson?.name || 'N/A'}</p>
                                        <p><strong>Website:</strong> <a href={req?.website} target="_blank" rel="noopener noreferrer">{req?.website}</a></p>
                                        <p className="request-date">Requested: {new Date(req?.requestedAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                    <div className="actions">
                                        <button 
                                            className="btn-approve"
                                            onClick={() => handleResponse(req._id, 'approved')}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="btn-reject"
                                            onClick={() => handleResponse(req._id, 'rejected')}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="partners-grid">
                        {partners.length === 0 ? (
                            <div className="empty-state">No active partners</div>
                        ) : (
                            partners.map(partner => (
                                <div key={partner._id} className="partner-card">
                                    <div className="partner-header">
                                        <img src={partner.logo || '/default-company.png'} alt={partner.name} className="company-logo" />
                                        <div>
                                            <h3>{partner.name}</h3>
                                            <span className="industry-text">{partner.industry}</span>
                                        </div>
                                    </div>
                                    <div className="partner-details">
                                        <div className="stat-row">
                                            <span>Active Since</span>
                                            <span>{partner.accessDetails?.grantedAt ? new Date(partner.accessDetails.grantedAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="stat-row">
                                            <span>Status</span>
                                            <span className="status-active">Active</span>
                                        </div>
                                    </div>
                                    <div className="partner-actions">
                                        <button 
                                            className="btn-text-danger"
                                            onClick={() => handleRevoke(partner._id)}
                                        >
                                            Revoke Access
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Partnerships;
