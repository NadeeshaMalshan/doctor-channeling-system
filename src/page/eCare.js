import React, { useState, useEffect } from 'react';
import ECareNavBar from '../Components/eCareNavBar';
import ChannelDoctor from '../Components/ChannelDoctor';
import Profile from '../Components/Profile';


import './css/eCare.css';
import { useNavigate } from 'react-router-dom';

const ECare = () => {

    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [patientUser, setPatientUser] = useState(null);

    // Get patient user from local storage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setPatientUser(JSON.parse(storedUser));
        }
    }, []);

    // Expose show profile function to window for Navbar access
    useEffect(() => {
        window.showPatientProfile = () => setShowProfile(true);
        return () => { window.showPatientProfile = null; };
    }, []);

    const handleProfileUpdate = (updatedUser) => {
        if (updatedUser) {
            setPatientUser(updatedUser);
        }
        console.log('Profile updated');
    };





    // Fetch doctors from the database
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/doctors`);
                const data = await response.json();

                if (response.ok) {
                    setDoctors(data.doctors);
                } else {
                    setError(data.message || 'Failed to fetch doctors');
                }
            } catch (err) {
                console.error('Error fetching doctors:', err);
                setError('Failed to connect to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    // Helper function to get tag class based on specialization
    const getTagClass = (specialization) => {
        const spec = specialization.toLowerCase();
        if (spec.includes('cardio')) return 'cardiology';
        if (spec.includes('pediatric') || spec.includes('child')) return 'pediatric';
        if (spec.includes('derma')) return 'dermatology';
        if (spec.includes('gynec') || spec.includes('obstetric')) return 'gynecology';
        if (spec.includes('neuro')) return 'neurology';
        return 'general';
    };

    const handleSearch = (searchData) => {
        console.log('Search data:', searchData);
        // Handle search logic here
    };

    return (
        <div className="ecare-page">
            <ECareNavBar />

            {showProfile && patientUser && (
                <Profile
                    patientId={patientUser.id}
                    onClose={() => setShowProfile(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}


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
                                <button className="ai-card-btn" onClick={() => navigate('/ecare/smart-doc-suggestion')}>
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
                                <button className="ai-card-btn ai-explainer-btn" onClick={() => navigate('/ecare/report-explainer')}>
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

                    {loading ? (
                        <div className="loading-message">
                            <p>Loading doctors...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <p>Error: {error}</p>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="no-doctors-message">
                            <p>No doctors available at the moment.</p>
                        </div>
                    ) : (
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
                                            <p className="doctor-specialty">{doctor.specialization}</p>
                                            <p className="doctor-hospital">{doctor.hospital || 'NC+ Hospital Narammala'}</p>
                                        </div>
                                    </div>

                                    <div className="doctor-card-body">
                                        <span className={`specialty-tag ${getTagClass(doctor.specialization)}`}>{doctor.specialization}</span>
                                        <div className="doctor-contact">
                                            <p className="doctor-email">{doctor.email}</p>
                                            <p className="doctor-phone">{doctor.phone}</p>
                                        </div>
                                    </div>

                                    <div className="doctor-card-footer">
                                        <div className="availability-badge available">
                                            Available
                                        </div>
                                        <button className="viewInfo-btn">View info</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Sticky Support Button */}
            <div className="ecare-support-btn" title="Contact Support" onClick={() => navigate('/ecare/customer-support')}>
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