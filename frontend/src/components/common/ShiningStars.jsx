import { Star, Sparkles } from 'lucide-react';

// Import CSS
import './ShiningStars.css';

const ShiningStars = ({ students, role = 'company' }) => {
    if (!students || students.length === 0) {
        return (
            <div className="shining-stars-empty">
                <Sparkles size={48} className="text-blue-500/30" />
                <p>No star students available yet</p>
            </div>
        );
    }

    return (
        <div className="shining-stars-elite-wrapper">
            <div className="stars-header-elite">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Star size={24} className="text-blue-400 fill-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Hall of Fame</h2>
                        <p className="text-[10px] font-bold text-blue-500/60 uppercase tracking-[0.3em]">Elite Talent Network</p>
                    </div>
                    <div className="h-px bg-white/5 flex-1 ml-4" />
                </div>
            </div>

            <div className="elite-cards-grid">
                {students.map((student) => (
                    <div 
                        key={student._id} 
                        className="elite-student-card"
                    >
                        <div className="elite-card-glow"></div>
                        <div className="elite-badge-top">STAR STUDENT</div>
                        
                        <div className="elite-avatar-wrapper">
                            <div className="elite-avatar-border">
                                <div className="elite-avatar-inner">
                                    {student?.profilePicture ? (
                                        <img 
                                            src={student.profilePicture} 
                                            alt={`${student?.name?.firstName} ${student?.name?.lastName}`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=' + (student?.name?.firstName || 'S') + '&background=random'; }}
                                        />
                                    ) : (
                                        <div className="elite-initials">
                                            {student?.name?.firstName?.[0] || 'S'}{student?.name?.lastName?.[0] || 'S'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="elite-star-decoration">
                                <Star size={12} className="text-blue-400 fill-blue-400" />
                            </div>
                        </div>

                        <div className="elite-card-body">
                            <div className="elite-college-tag">
                                {student.college?.logo && (
                                    <img src={student.college.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                                )}
                                <span>{student.college?.name || 'Partner Institute'}</span>
                            </div>

                            <div className="elite-info-main">
                                <h3 className="elite-name">
                                    {student.name?.firstName} {student.name?.lastName}
                                </h3>
                                <p className="elite-department">{student.department}</p>
                            </div>
                            
                            <div className="elite-metrics">
                                <div className="elite-metric">
                                    <span className="label">CGPA</span>
                                    <span className="value">{student.cgpa?.toFixed(2)}</span>
                                </div>
                                <div className="elite-metric-divider"></div>
                                <div className="elite-metric">
                                    <span className="label">BATCH</span>
                                    <span className="value">{student.batch}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShiningStars;
