import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import './ShiningStars.css';

const ShiningStars = ({ students }) => {
    const navigate = useNavigate();

    if (!students || students.length === 0) {
        return (
            <div className="shining-stars-empty">
                <Sparkles size={48} className="text-amber-500/30" />
                <p>No star students available yet</p>
            </div>
        );
    }

    return (
        <div className="shining-stars-container">
            <div className="stars-header">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <Sparkles size={20} className="text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Shining Stars</h2>
                    <div className="star-badge-live">⭐ FEATURED</div>
                    <div className="h-px bg-white/5 flex-1" />
                </div>
            </div>

            <Swiper
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                coverflowEffect={{
                    rotate: 0,
                    stretch: -50,
                    depth: 200,
                    modifier: 1,
                    slideShadows: true,
                }}
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                }}
                pagination={true}
                modules={[EffectCoverflow, Autoplay, Pagination]}
                className="stars-swiper"
            >
                {students.map((student) => (
                    <SwiperSlide key={student._id} className="star-slide">
                        <div 
                            className="glass-star-card"
                            onClick={() => navigate(`/company/students/${student._id}`)}
                        >
                            <div className="card-top">
                                <div className="star-avatar">
                                    {student.profilePicture ? (
                                        <img src={student.profilePicture} alt={`${student.name?.firstName} ${student.name?.lastName}`} />
                                    ) : (
                                        <div className="avatar-initials">
                                            {student.name?.firstName?.[0]}{student.name?.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card-content">
                                <h3 className="student-name-star">
                                    {student.name?.firstName} {student.name?.lastName}
                                </h3>
                                
                                <p className="student-dept-star">{student.department}</p>
                                
                                {student.college && (
                                    <div className="college-info-star">
                                        {student.college.logo && (
                                            <img src={student.college.logo} alt="" className="w-3.5 h-3.5 object-contain rounded-sm bg-white/10" />
                                        )}
                                        <span>
                                            {student.college.name}
                                            {student.batch ? ` • Batch ${student.batch}` : ''}
                                        </span>
                                    </div>
                                )}

                                <div className="stats-pill">
                                    <div className="stat-group">
                                        <span className="stat-label">CGPA</span>
                                        <span className="stat-value">{student.cgpa?.toFixed(2)}</span>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="stat-group">
                                        <span className="stat-label">BATCH</span>
                                        <span className="stat-value">{student.batch}</span>
                                    </div>
                                </div>

                                {student.skills && student.skills.length > 0 && (
                                    <div className="skills-showcase">
                                        {student.skills.slice(0, 4).map((skill, i) => (
                                            <span key={i} className="skill-badge">{skill}</span>
                                        ))}
                                        {student.skills.length > 4 && (
                                            <span className="skill-more">+{student.skills.length - 4}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default ShiningStars;
