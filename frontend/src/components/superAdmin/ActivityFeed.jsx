import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, XCircle, UserPlus, Building2, 
    Briefcase, GraduationCap, Clock, ShieldCheck 
} from 'lucide-react';

const ActivityFeed = ({ activities, loading }) => {
    const getActionIcon = (action) => {
        const icons = {
            approve_college: { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            approve_company: { icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            reject_college: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            reject_company: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            register_student: { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            register_college: { icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            register_company: { icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            post_job: { icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            shortlist_student: { icon: CheckCircle2, color: 'text-amber-500', bg: 'bg-amber-500/10' }
        };
        
        const config = icons[action] || { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10' };
        return config;
    };

    const formatActionMessage = (activity) => {
        const email = activity.user?.email || 'System';
        const role = activity.user?.role?.replace('_', ' ');
        const action = activity.action?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        return (
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">{action}</span>
                <p className="text-xs text-slate-400 mt-0.5">
                    {email} <span className="opacity-60">({role})</span>
                </p>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-3 bg-slate-800 rounded w-3/4" />
                            <div className="h-2 bg-slate-800 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!activities || activities.length === 0) {
        return <p className="text-slate-500 text-sm text-center py-8">No recent activity</p>;
    }

    return (
        <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800/50">
            {activities.map((activity, index) => {
                const config = getActionIcon(activity.action);
                return (
                    <motion.div 
                        key={activity._id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex gap-4 group"
                    >
                        <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10 border border-[#0f172a] shadow-sm`}>
                            <config.icon className={config.color} size={18} />
                        </div>
                        <div className="flex-1 pt-0.5">
                            <div className="flex justify-between items-start mb-1">
                                {formatActionMessage(activity)}
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ActivityFeed;
