import { useRef } from 'react';
import NavBar from '../Components/NavBar';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './css/landing.css';
import { useNavigate } from 'react-router-dom';

const Landing = () => {

    const navigate = useNavigate();
    const containerRef = useRef();

    useGSAP(() => {
        // Set initial state and animate
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Hero content animation
        tl.fromTo(".hero-content",
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1 },
            0.2
        );

        // Stats animation
        tl.fromTo(".stat-item",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
            0.5
        );

        // About section animation
        tl.fromTo(".about-container",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            0.6
        );

        // Services cards stagger animation
        tl.fromTo(".service-card",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
            0.7
        );

        // Doctor cards stagger animation
        tl.fromTo(".doctor-card",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
            0.9
        );

        // Info section animation
        tl.fromTo(".info-card",
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, stagger: 0.2 },
            1.0
        );

        // Footer animation
        tl.fromTo(".footer",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            1.2
        );
    }, { scope: containerRef });

    // Doctors available at the center
    const doctors = [
        {
            id: 1,
            name: "Dr. Priyantha Silva",
            specialty: "General Physician",
            experience: "15 years experience",
            days: "Mon, Wed, Fri",
            time: "4:00 PM - 8:00 PM",
            fee: "Rs. 1,500",
            tagClass: "general"
        },
        {
            id: 2,
            name: "Dr. Kumari Fernando",
            specialty: "Cardiologist",
            experience: "12 years experience",
            days: "Tue, Thu",
            time: "5:00 PM - 9:00 PM",
            fee: "Rs. 2,500",
            tagClass: "cardiology"
        },
        {
            id: 3,
            name: "Dr. Mahesh Perera",
            specialty: "Pediatrician",
            experience: "10 years experience",
            days: "Mon, Sat",
            time: "3:00 PM - 7:00 PM",
            fee: "Rs. 1,800",
            tagClass: "pediatric"
        }
    ];

    // Services offered
    const services = [
        {
            id: 1,
            title: "Doctor Channeling",
            description: "Book appointments with specialist doctors easily",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
            )
        },
        {
            id: 2,
            title: "Lab Reports",
            description: "Quick and accurate laboratory testing services",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 2v2h1v14c0 2.21 1.79 4 4 4s4-1.79 4-4V4h1V2H7zm6 14c0 1.1-.9 2-2 2s-2-.9-2-2V4h4v12z" />
                </svg>
            )
        },
        {
            id: 3,
            title: "Pharmacy",
            description: "Wide range of medicines at affordable prices",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 10h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V9c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
                </svg>
            )
        },
        {
            id: 4,
            title: "ECG & Scanning",
            description: "Modern diagnostic equipment for accurate results",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm8 8h10v-2H11v2zm0-8v2h10V9H11zm0 6h10v-2H11v2zM7 7v10h2V7H7z" />
                </svg>
            )
        }
    ];

    return (
        <div className="landing-page" ref={containerRef}>
            <NavBar />
            {/* Hero Banner */}
            <section className="hero-banner">
                <div className="hero-content">
                    <div className="hero-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        Narammala, Kurunegala
                    </div>
                    <h1>Narammala Channeling Center</h1>
                    <h2>Your Trusted Healthcare Partner</h2>
                    <p className="hero-description">
                        Quality healthcare services for you and your family. Book appointments with experienced doctors,
                        access lab services, and get your medicines all under one roof.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate("/eCare")}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                            </svg>
                            NCC eCare

                        </button>
                        <button className="btn-secondary" >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                            Call Us
                        </button>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat-item">
                        <span className="stat-number">15+</span>
                        <span className="stat-label">Specialist Doctors</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">10K+</span>
                        <span className="stat-label">Happy Patients</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">8+</span>
                        <span className="stat-label">Years Service</span>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="section-about" id="about">
                <div className="about-container">
                    <div className="about-image">
                        <div className="image-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
                            </svg>
                            <span>Hospital Image</span>
                        </div>
                        {/* Replace the above div with: <img src={hospitalImage} alt="NC+ Hospital" /> */}
                    </div>
                    <div className="about-content">
                        <div className="about-badge">About Us</div>
                        <h2>NC+ Hospital</h2>
                        <p>
                            NC+ Hospital, the premier private healthcare provider in Narammala. For years, we have been dedicated to delivering compassionate, high-quality medical services to our community. Formerly known as Narammala Channel Center, we have evolved into a modern healthcare facility equipped with advanced diagnostic tools and a wide range of specialist services.
                        </p>
                        <p>
                            Our mission is to bridge the gap between quality healthcare and accessibility. With a team of renowned specialists from leading national hospitals, a fully-equipped laboratory, and an in-house pharmacy, we ensure that every patient receives personalized care under one roof. At NC+ Hospital, your health is our priority, and we are committed to serving you with excellence, integrity, and care.
                        </p>
                        <div className="about-features">
                            <div className="feature-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                <span>Renowned Specialists</span>
                            </div>
                            <div className="feature-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                <span>Fully-Equipped Laboratory</span>
                            </div>
                            <div className="feature-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                <span>In-House Pharmacy</span>
                            </div>
                            <div className="feature-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                <span>Advanced Diagnostics</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="section-services">
                <div className="section-header">
                    <h2>Our Services</h2>
                    <p>Comprehensive healthcare services to meet all your medical needs</p>
                </div>
                <div className="services-grid">
                    {services.map((service) => (
                        <div className="service-card" key={service.id}>
                            <div className="service-icon">
                                {service.icon}
                            </div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Doctors Section */}
            <section className="section-recommended">
                <div className="section-header-row">
                    <h2>Our Doctors</h2>
                    <a href="/doctors" className="view-all-link">
                        View All Doctors
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                        </svg>
                    </a>
                </div>
                <div className="doctors-grid">
                    {doctors.map((doctor) => (
                        <div className="doctor-card" key={doctor.id}>
                            <div className="doctor-card-header">
                                <div className="doctor-avatar">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <div className="doctor-details">
                                    <h3>{doctor.name}</h3>
                                    <p>{doctor.specialty} | {doctor.experience}</p>
                                </div>
                            </div>
                            <span className={`specialty-tag ${doctor.tagClass}`}>{doctor.specialty}</span>
                            <div className="doctor-schedule">
                                <div className="schedule-info">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                    </svg>
                                    <div>
                                        <span className="days">{doctor.days}</span>
                                        <span className="time">{doctor.time}</span>
                                    </div>
                                </div>
                                <div className="price-info">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                                    </svg>
                                    <div>
                                        <span className="price">{doctor.fee}</span>
                                        <span className="label">Channel Fee</span>
                                    </div>
                                </div>
                            </div>
                            <button className="book-appointment-btn">Channel Now</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Info Section */}
            <section className="section-info">
                <div className="info-grid">
                    <div className="info-card opening-hours">
                        <div className="info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                            </svg>
                        </div>
                        <h3>Opening Hours</h3>
                        <ul className="hours-list">
                            <li><span>Monday - Friday</span><span>8:00 AM - 10:00 PM</span></li>
                            <li><span>Saturday</span><span>8:00 AM - 8:00 PM</span></li>
                            <li><span>Sunday</span><span>9:00 AM - 6:00 PM</span></li>
                            <li><span>Public Holidays</span><span>9:00 AM - 4:00 PM</span></li>
                        </ul>
                    </div>
                    <div className="info-card contact-info">
                        <div className="info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                        </div>
                        <h3>Contact Us</h3>
                        <div className="contact-details">
                            <div className="contact-row">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                </svg>
                                <div>
                                    <span className="label">Hotline</span>
                                    <span className="value">037 2 264 XXX</span>
                                </div>
                            </div>
                            <div className="contact-row">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
                                </svg>
                                <div>
                                    <span className="label">Mobile</span>
                                    <span className="value">077 XXX XXXX</span>
                                </div>
                            </div>
                            <div className="contact-row">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                <div>
                                    <span className="label">Email</span>
                                    <span className="value">info@narammalachannel.lk</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="info-card location-info">
                        <div className="info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                        </div>
                        <h3>Find Us</h3>
                        <p className="address">
                            Narammala Channeling Center,<br />
                            Main Street, Narammala,<br />
                            Kurunegala District,<br />
                            Sri Lanka
                        </p>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="directions-link">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z" />
                            </svg>
                            Get Directions
                        </a>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer className='footer'>
                <div className="footer-container">
                    <div className="footer-section footer-about">
                        <h3>Narammala Channeling Center</h3>
                        <p>Your trusted healthcare partner in Narammala. We provide quality medical services with experienced doctors and modern facilities.</p>
                        <div className="social-links">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                                </svg>
                            </a>
                            <a href="https://wa.me/94771234567" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="WhatsApp">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/doctors">Our Doctors</a></li>
                            <li><a href="/#services">Services</a></li>
                            <li><a href="/eCare">Book Appointment</a></li>
                            <li><a href="/#contact">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Services</h4>
                        <ul>
                            <li><a href="/eCare">Doctor Channeling</a></li>
                            <li><a href="/#services">Laboratory</a></li>
                            <li><a href="/#services">Pharmacy</a></li>
                            <li><a href="/#services">ECG & Scanning</a></li>
                            <li><a href="/#services">Health Checkup</a></li>
                        </ul>
                    </div>
                    <div className="footer-section footer-contact">
                        <h4>Contact Info</h4>
                        <div className="contact-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            <span>Main Street, Narammala, Kurunegala</span>
                        </div>
                        <div className="contact-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                            <span>037 2 264 XXX</span>
                        </div>
                        <div className="contact-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            <span>info@narammalachannel.lk</span>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Narammala Channeling Center. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
