import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Notifications.css';

const StudentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all'); // all, unread
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchNotifications();
    }, [filter, page]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter === 'unread') params.append('unreadOnly', 'true');
            params.append('page', page);
            params.append('limit', 20);

            const response = await api.get(`/student/notifications?${params}`);
            setNotifications(response.data.data);
            setUnreadCount(response.data.unreadCount);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`/student/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId
                        ? { ...notif, isRead: true, readAt: new Date() }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            account_approved: '✅',
            account_rejected: '❌',
            student_verified: '✓',
            job_posted: '💼',
            application_status: '📝',
            shortlisted: '⭐',
            interview_scheduled: '📅',
            offer_received: '🎉',
            profile_incomplete: '⚠️',
            system_announcement: '📢'
        };
        return icons[type] || '🔔';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#6b7280'
        };
        return colors[priority] || '#6b7280';
    };

    const formatDate = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return notifDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        
        // Navigate to link if available
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    if (loading && notifications.length === 0) {
        return <div className="loading">Loading notifications...</div>;
    }

    return (
        <div className="student-notifications">
            <div className="notifications-header">
                <div>
                    <h1>Notifications</h1>
                    <p className="subtitle">Stay updated with your placement activities</p>
                </div>
                {unreadCount > 0 && (
                    <div className="unread-badge">
                        {unreadCount} unread
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                        setFilter('all');
                        setPage(1);
                    }}
                >
                    All Notifications
                </button>
                <button
                    className={`tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => {
                        setFilter('unread');
                        setPage(1);
                    }}
                >
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔔</div>
                    <h3>No notifications</h3>
                    <p>
                        {filter === 'unread'
                            ? "You're all caught up! No unread notifications."
                            : "You don't have any notifications yet."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="notifications-list">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-icon">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h3>{notification.title}</h3>
                                        <div className="notification-meta">
                                            <span
                                                className="priority-indicator"
                                                style={{ backgroundColor: getPriorityColor(notification.priority) }}
                                            />
                                            <span className="notification-time">
                                                {formatDate(notification.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p className="notification-message">{notification.message}</p>
                                    
                                    {notification.link && (
                                        <div className="notification-action">
                                            <span className="action-link">View Details →</span>
                                        </div>
                                    )}
                                </div>

                                {!notification.isRead && (
                                    <div className="unread-indicator" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setPage(prev => prev - 1)}
                                disabled={page === 1}
                                className="btn btn-secondary"
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={page === pagination.pages}
                                className="btn btn-secondary"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentNotifications;
