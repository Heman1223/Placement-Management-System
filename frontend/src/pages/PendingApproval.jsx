import { Link } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import './UtilityPages.css';

const PendingApproval = () => {
    const { user, logout } = useAuth();

    return (
        <div className="utility-page">
            <div className="utility-card">
                <div className="utility-icon pending">
                    <Clock size={48} />
                </div>
                <h1>Account Pending Approval</h1>
                <p>
                    Your account is currently under review. Our team will verify your
                    details and approve your account shortly.
                </p>
                <div className="utility-info">
                    <span>Registered Email:</span>
                    <strong>{user?.email}</strong>
                </div>
                <p className="utility-note">
                    You will receive an email notification once your account is approved.
                </p>
                <Button variant="secondary" icon={LogOut} onClick={logout}>
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default PendingApproval;
