import ECareNavBar from '../Components/eCareNavBar';
import ChannelDoctor from '../Components/ChannelDoctor';
import './css/eCare.css';

const ECare = () => {
    // Sample doctors data
    const doctors = [
        {
            id: 1,
            name: "Dr. Priyantha Silva",
            specialty: "General Physician",
            hospital: "NC+ Hospital Narammala",
            experience: "15 years experience",
            days: "Mon, Wed, Fri",
            time: "4:00 PM - 8:00 PM",
            fee: "Rs. 1,500",
            available: true,
            tagClass: "general"
        },
        {
            id: 2,
            name: "Dr. Kumari Fernando",
            specialty: "Cardiologist",
            hospital: "NC+ Hospital Narammala",
            experience: "12 years experience",
            days: "Tue, Thu",
            time: "5:00 PM - 9:00 PM",
            fee: "Rs. 2,500",
            available: true,
            tagClass: "cardiology"
        },
        {
            id: 3,
            name: "Dr. Mahesh Perera",
            specialty: "Pediatrician",
            hospital: "NC+ Hospital Narammala",
            experience: "10 years experience",
            days: "Mon, Sat",
            time: "3:00 PM - 7:00 PM",
            fee: "Rs. 1,800",
            available: false,
            tagClass: "pediatric"
        },
        {
            id: 4,
            name: "Dr. Anura Jayasinghe",
            specialty: "Dermatologist",
            hospital: "NC+ Hospital Narammala",
            experience: "8 years experience",
            days: "Wed, Fri",
            time: "2:00 PM - 6:00 PM",
            fee: "Rs. 2,000",
            available: true,
            tagClass: "dermatology"
        },
        {
            id: 5,
            name: "Dr. Nilmini Rathnayake",
            specialty: "Gynecologist",
            hospital: "NC+ Hospital Narammala",
            experience: "14 years experience",
            days: "Mon, Thu",
            time: "4:00 PM - 8:00 PM",
            fee: "Rs. 2,200",
            available: true,
            tagClass: "gynecology"
        },
        {
            id: 6,
            name: "Dr. Sampath Wijesinghe",
            specialty: "Neurologist",
            hospital: "NC+ Hospital Narammala",
            experience: "18 years experience",
            days: "Tue, Sat",
            time: "5:00 PM - 9:00 PM",
            fee: "Rs. 3,000",
            available: true,
            tagClass: "neurology"
        }
    ];

    const handleSearch = (searchData) => {
        console.log('Search data:', searchData);
        // Handle search logic here
    };

    return (
        <div className="ecare-page">
            <ECareNavBar />

            <main className="ecare-main">
                {/* Hero Section with Channel Doctor */}
                <section className="ecare-hero">
                    <div className="ecare-hero-content">
                        <h1>Book Your Doctor Appointment Online</h1>
                        <p>Easy, fast, and convenient. Channel your preferred doctor from the comfort of your home.</p>
                    </div>
                    <div className="ecare-hero-search">
                        <ChannelDoctor onSearch={handleSearch} />
                    </div>
                </section>

                {/* AI-Powered Features Banner */}
                <section className="ai-features-banner">
                    <div className="ai-features-container">
                        {/* Left Side - Smart Suggestions */}
                        <div className="ai-feature-card ai-suggestion-card">
                            <div className="ai-card-glow"></div>
                            <div className="ai-card-content">
                                <div className="ai-card-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                                    </svg>
                                </div>
                                <div className="ai-card-badge">
                                    <span className="ai-badge-dot"></span>
                                    AI Powered
                                </div>
                                <h3>Smart Suggestions</h3>
                                <p>Not sure which specialist to visit? Our AI analyzes your symptoms and medical history to recommend the perfect doctor for you.</p>
                                <div className="ai-card-features">
                                    <div className="ai-card-feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        <span>Symptom-based matching</span>
                                    </div>
                                    <div className="ai-card-feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        <span>Personalized recommendations</span>
                                    </div>
                                    <div className="ai-card-feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        <span>Smart scheduling optimization</span>
                                    </div>
                                </div>
                                <span className="ai-card-disclaimer">⚠️ This is only a suggestion tool and works for selected conditions.</span>
                                <button className="ai-card-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                                    </svg>
                                    Try Smart Suggestion
                                </button>
                            </div>
                        </div>

                        {/* Right Side - AI Report Explainer */}
                        <div className="ai-feature-card ai-explainer-card">
                            <div className="ai-card-glow"></div>
                            <div className="ai-card-content">
                                <div className="ai-card-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                    </svg>
                                </div>
                                <div className="ai-card-badge ai-explainer-badge">
                                    <span className="ai-badge-dot"></span>
                                    Report Analysis
                                </div>
                                <h3>AI Report Explainer</h3>
                                <p>Upload your lab reports and get instant AI-powered summaries in simple language. Understand your health metrics, normal ranges, and what needs attention.</p>
                                <div className="ai-card-features">
                                    <div className="ai-card-feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        <span>Plain language summaries</span>
                                    </div>
                                    <div className="ai-card-feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        <span>Highlight critical values</span>
                                    </div>
                                    <div className="ai-card-feature-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        <span>Track health trends over time</span>
                                    </div>
                                </div>
                                <button className="ai-card-btn ai-explainer-btn" >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z" />
                                    </svg>
                                    Analyze My Report
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Doctors Section */}
                <section className="ecare-doctors-section">
                    <div className="section-header">
                        <h2>Our Doctors</h2>
                        <p>Meet our team of highly qualified and experienced doctors who are committed to providing the best possible care to our patients.</p>
                    </div>

                    <div className="doctors-grid">
                        {doctors.map((doctor) => (
                            <div className="ecare-doctor-card" key={doctor.id}>
                                <div className="doctor-card-header">
                                    <div className="doctor-avatar">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                    <div className="doctor-info">
                                        <h3>{doctor.name}</h3>
                                        <p className="doctor-specialty">{doctor.specialty}</p>
                                        <p className="doctor-hospital">{doctor.hospital}</p>
                                    </div>
                                    
                                </div>

                                <div className="doctor-card-body">
                                    <span className={`specialty-tag ${doctor.tagClass}`}>{doctor.specialty}</span>
                                    <p className="experience">{doctor.experience}</p>

                                    
                                </div>

                                <div className="doctor-card-footer">
                                    
                                    <button className="viewInfo-btn">View info</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Sticky Support Button */}
            <div className="ecare-support-btn" title="Contact Support">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 14v4h-2v-4h2M7 14v4H6c-1.1 0-2-.9-2-2v-2h3m13-3V9c0-3.31-2.69-6-6-6S6 5.69 6 9v4h12m-6-8c-2.21 0-4 1.79-4 4v3h8V9c0-2.21-1.79-4-4-4z" />
                    <path d="M19 20v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1H19z" opacity="0.3" />
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.48 3.53 1.34 5.02L2.3 20.82a1 1 0 0 0 1.22 1.22l3.8-1.04A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                </svg>
            </div>

            {/* Footer */}
            <footer className="ecare-footer">
                <div className="footer-content">
                    <p>&copy; 2026 NCC eCare - Narammala Channeling Center. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default ECare;