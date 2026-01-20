import { useState, useEffect } from 'react';
import api from '../../services/api';
import './ActivityLogs.css';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 50
    });
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.action) params.append('action', filters.action);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            params.append('page', filters.page);
            params.append('limit', filters.limit);

            const response = await api.get(`/activity-logs?${params}`);
            setLogs(response.data.data.logs);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/activity-logs/stats?${params}`);
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.action) params.append('action', filters.action);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/activity-logs/export?${params}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `activity_logs_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to export logs');
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            view_student: '👁️',
            download_student_data: '⬇️',
            shortlist_student: '⭐',
            approve_college: '✅',
            approve_company: '✅',
            bulk_upload: '📤',
            export_data: '📊',
            update_student: '✏️',
            delete_student: '🗑️',
            post_job: '💼',
            update_job: '📝',
            view_resume: '📄'
        };
        return icons[action] || '📋';
    };

    const getActionColor = (action) => {
        if (action.includes('delete')) return '#ef4444';
        if (action.includes('approve')) return '#10b981';
      