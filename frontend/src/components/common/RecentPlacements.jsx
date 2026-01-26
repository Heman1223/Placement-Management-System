import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import { Building2, Briefcase, GraduationCap, Quote, Star } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import './RecentPlacements.css';

const MOTIVATIONAL_QUOTES = [
    "The secret of getting ahead is getting started.",
    "Your hard work will always pay off, just keep going.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is where preparation and opportunity meet.",
    "Dream big, work hard, stay focused, and surround yourself with greatness.",
    "Every accomplishment starts with the decision to try.",
    "Success doesn't just find you. You have to go out and get it.",
    "Believe you can and you're halfway there."
];

const RecentPlacements = ({ placements = [], title = "Success Stories" }) => {
    if (!placements || placements.length === 0) return null;

    const getQuote = (index) => MOTIVATIONAL_QUOTES[index % MOTIVATIONAL_QUOTES.length];

    return (
        <div className="recent-placements-section">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <GraduationCap size={20} className="text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                <div className="live-badge">LIVE UPDATES</div>
                <div className="h-px bg-white/5 flex-1" />
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
                className="placements-swiper"
            >
                {placements.map((student, index) => (
                    <SwiperSlide key={student._id || index} className="placement-slide">
                        <div className="glass-placement-card">
                            <div className="card-top">
                                <div className="student-profile-img">
                                    {student.profilePicture ? (
                                        <img src={student.profilePicture} alt={student.name.firstName} />
                                    ) : (
                                        <div className="initials">
                                            {student.name.firstName[0]}{student.name.lastName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="placement-badge">
                                    <Building2 size={12} />
                                    PLACED
                                </div>
                            </div>

                            <div className="card-content">
                                <div className="company-info-top">
                                    {student.placementDetails?.companyLogo ? (
                                        <div className="w-5 h-5 rounded overflow-hidden bg-white border border-white/10 flex-shrink-0">
                                            <img src={student.placementDetails.companyLogo} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <Briefcase size={14} className="text-emerald-400" />
                                    )}
                                    <span>{student.placementDetails?.companyName || student.placementDetails?.company || 'Leading Tech Firm'}</span>
                                </div>
                                
                                <h3 className="student-name">
                                    {student.name.firstName} {student.name.lastName}
                                    {student.isStarStudent && (
                                        <Star size={16} className="inline-block ml-2 text-amber-400 fill-amber-400 mb-1" />
                                    )}
                                </h3>
                                
                                <p className="college-info flex items-center gap-1.5">
                                    {student.college?.logo && (
                                        <img src={student.college.logo} alt="" className="w-3.5 h-3.5 object-contain rounded-sm bg-white/10" />
                                    ) || (student.placementDetails?.collegeLogo && (
                                        <img src={student.placementDetails.collegeLogo} alt="" className="w-3.5 h-3.5 object-contain rounded-sm bg-white/10" />
                                    ))}
                                    <span>
                                        {student.college?.name || student.department || 'Elite Institute'}
                                        {student.batch ? ` • Batch ${student.batch}` : ''}
                                    </span>
                                </p>

                                <div className="offer-pill">
                                    <div className="offer-role-group">
                                        <span className="offer-role-label">ROLE</span>
                                        <span className="offer-role-value">{student.placementDetails?.role || 'Associate Engineer'}</span>
                                    </div>
                                    <div className="package-info">
                                        <span className="package-value">{student.placementDetails?.package || '--'}</span>
                                        <span className="package-label">LPA</span>
                                    </div>
                                </div>

                                <div className="quote-section">
                                    <Quote size={20} className="quote-icon" />
                                    <p className="motivational-quote">
                                        "{getQuote(index)}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default RecentPlacements;
