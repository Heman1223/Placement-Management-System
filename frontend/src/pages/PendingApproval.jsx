import { Link } from 'react-router-dom';
import { Clock, LogOut, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import './UtilityPages.css';

const PendingApproval = () => {
    const { user, logout } = useAuth();
    const profile = user?.profile;
    const isRejected = profile?.isRejected;
    const rejectionReason = profile?.rejectionReason;

    return (
        <div className="utility-page">
            <div className="utility-card shadow-2xl">
                <div className={`utility-icon ${isRejected ? 'rejected bg-red-500/10' : 'pending bg-amber-500/10'}`}>
                    {isRejected ? <XCircle size={48} className="text-red-500" /> : <Clock size={48} className="text-amber-500" />}
                </div>
                <h1 className={isRejected ? 'text-red-500' : 'text-amber-500'}>
                    {isRejected ? 'Registration Rejected' : 'Account Pending Approval'}
                </h1>
                <p className="text-slate-300">
                    {isRejected 
                        ? 'Unfortunately, your registration has been rejected by the administrator.' 
                        : 'Your account is currently under review. Our team will verify your details and approve your account shortly.'
                    }
                </p>
                
                {isRejected && rejectionReason && (
                    <div className="rejection-note mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-left">
                        <span className="text-xs font-black uppercase tracking-wider text-red-500 block mb-2">Administrator's Note:</span>
                        <p className="text-sm text-slate-200 indent-2">{rejectionReason}</p>
                    </div>
                )}

                <div className="utility-info mt-8">
                    <span className="text-slate-500">Registered Email:</span>
                    <strong className="text-white">{user?.email}</strong>
                </div>
                
                {!isRejected && (
                    <p className="utility-note mt-4 text-xs text-slate-500 italic">
                        You will receive an email notification once your account is approved.
                    </p>
                )}
                
                <div className="mt-8">
                    <Button variant="secondary" icon={LogOut} onClick={logout} className="w-full">
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
