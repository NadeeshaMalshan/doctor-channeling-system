import React, { useState, useEffect } from 'react';
import ECareNavBar from '../Components/eCareNavBar';
import ChannelDoctor from '../Components/ChannelDoctor';
import Profile from '../Components/Profile';
import AppointmentHistory from '../Components/AppointmentHistory';


import './css/eCare.css';
import { useNavigate } from 'react-router-dom';

const ECare = () => {

    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showAppointmentHistory, setShowAppointmentHistory] = useState(false);
    const [patientUser, setPatientUser] = useState(null);
    const [hasSupportUpdates, setHasSupportUpdates] = useState(false);

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
        window.showAppointmentHistory = () => setShowAppointmentHistory(true);
        return () => { 
            window.showPatientProfile = null; 
            window.showAppointmentHistory = null;
        };
    }, []);

    const handleProfileUpdate = (updatedUser) => {
        if (updatedUser) {
            setPatientUser(updatedUser);
        }
        console.log('Profile updated');
    };

    // Check for support updates
    useEffect(() => {
        if (patientUser) {
            const checkUpdates = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/support/tickets/patient/${patientUser.id}/updates`);
                    const data = await response.json();
                    if (response.ok) {
                        setHasSupportUpdates(data.hasUpdates);
                    }
                } catch (error) {
                    console.error('Error checking support updates:', error);
                }
            };
            checkUpdates();
        }
    }, [patientUser]);





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

            {showAppointmentHistory && patientUser && (
                <AppointmentHistory
                    patientId={patientUser.id}
                    onClose={() => setShowAppointmentHistory(false)}
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
                                    <span className="material-symbols-outlined">lightbulb</span>
                                </div>
                                <div className="ai-card-badge">
                                    <span className="ai-badge-dot"></span>
                                    AI Powered
                                </div>
                                <h3>Smart Suggestions</h3>
                                <p>Not sure which specialist to visit? Our AI analyzes your symptoms and medical history to recommend the perfect doctor for you.</p>
                                <div className="ai-card-features">
                                    <div className="ai-card-feature-item">
                                        <span className="material-symbols-outlined">check</span>
                                        <span>Symptom-based matching</span>
                                    </div>
                                    <div className="ai-card-feature-item">
                                        <span className="material-symbols-outlined">check</span>
                                        <span>Personalized recommendations</span>
                                    </div>
                                    <div className="ai-card-feature-item">
                                        <span className="material-symbols-outlined">check</span>
                                        <span>Smart scheduling optimization</span>
                                    </div>
                                </div>
                                <span className="ai-card-disclaimer">
                                    <span className="material-symbols-outlined">info</span>
                                    This is only a suggestion tool and works for selected conditions.
                                </span>
                                <button className="ai-card-btn" onClick={() => navigate('/ecare/smart-doc-suggestion')}>
                                    <span className="material-symbols-outlined">lightbulb</span>
                                    Try Smart Suggestion
                                </button>
                            </div>
                        </div>

                        {/* Right Side - AI Report Explainer */}
                        <div className="ai-feature-card ai-explainer-card">
                            <div className="ai-card-glow"></div>
                            <div className="ai-card-content">
                                <div className="ai-card-icon">
                                    <span className="material-symbols-outlined">article</span>
                                </div>
                                <div className="ai-card-badge ai-explainer-badge">
                                    <span className="ai-badge-dot"></span>
                                    Report Analysis
                                </div>
                                <h3>AI Report Explainer</h3>
                                <p>Upload your lab reports and get instant AI-powered summaries in simple language. Understand your health metrics, normal ranges, and what needs attention.</p>
                                <div className="ai-card-features">
                                    <div className="ai-card-feature-item">
                                        <span className="material-symbols-outlined">check</span>
                                        <span>Plain language summaries</span>
                                    </div>
                                    <div className="ai-card-feature-item">
                                        <span className="material-symbols-outlined">check</span>
                                        <span>Highlight critical values</span>
                                    </div>
                                    <div className="ai-card-feature-item">
                                        <span className="material-symbols-outlined">check</span>
                                        <span>Track health trends over time</span>
                                    </div>
                                </div>
                                <button className="ai-card-btn" onClick={() => navigate('/ecare/report-explainer')}>
                                    <span className="material-symbols-outlined">article</span>
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
                                            <span className="material-symbols-outlined">person</span>
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
                <span className="material-symbols-outlined">support_agent</span>
                {hasSupportUpdates && (
                    <span 
                        className="support-update-dot" 
                        style={{ 
                            position: 'absolute', 
                            top: '-2px', 
                            right: '-2px', 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: '#ff3b30', 
                            borderRadius: '50%', 
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    ></span>
                )}
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