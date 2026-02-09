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

                {/* Smart Specialist Suggestion Banner */}
                <section className="smart-suggestion-banner">
                    <div className="banner-content">
                        <div className="banner-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7zm2.9 11.1l-.9.6V16h-4v-2.3l-.9-.6C7.8 12.2 7 10.6 7 9c0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.6-.8 3.2-2.1 4.1z" />
                            </svg>
                        </div>
                        <div className="banner-text">
                            <h3>Not sure which specialist to visit?</h3>
                            <p>Try our <strong>Smart Specialist Suggestion</strong>! Check your symptoms, predict potential conditions, and get matched with the right specialist for you.</p>
                            <span className="banner-disclaimer">⚠️ Disclaimer: This is only a doctor suggestion tool and works for several diseases only.</span>
                        </div>
                        <button className="banner-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2l3-4 3 4h-2v8z" />
                            </svg>
                            Try Smart Suggestion
                        </button>
                    </div>
                </section>

                {/* Doctors Section */}
                <section className="ecare-doctors-section">
                    <div className="section-header">
                        <h2>Available Doctors</h2>
                        <p>Choose from our experienced specialists and book your appointment today</p>
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
                                    <span className={`availability-badge ${doctor.available ? 'available' : 'unavailable'}`}>
                                        {doctor.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>

                                <div className="doctor-card-body">
                                    <span className={`specialty-tag ${doctor.tagClass}`}>{doctor.specialty}</span>
                                    <p className="experience">{doctor.experience}</p>

                                    <div className="schedule-info">
                                        <div className="schedule-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                                            </svg>
                                            <span>{doctor.days}</span>
                                        </div>
                                        <div className="schedule-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                                            </svg>
                                            <span>{doctor.time}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="doctor-card-footer">
                                    <div className="fee-info">
                                        <span className="fee-label">Channel Fee</span>
                                        <span className="fee-amount">{doctor.fee}</span>
                                    </div>
                                    <button
                                        className={`book-btn ${!doctor.available ? 'disabled' : ''}`}
                                        disabled={!doctor.available}
                                    >
                                        {doctor.available ? 'Book Now' : 'Not Available'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

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