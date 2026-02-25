import { useState, useEffect } from 'react';
import './ComponentsCss/ChannelDoctor.css';
import './ComponentsCss/ChannelDoctorForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ChannelDoctor = ({ onSearch }) => {
    const [searchData, setSearchData] = useState({
        doctorName: '',
        specialization: '',
        date: ''
    });

    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null); // For "View Info" modal
    const [showModal, setShowModal] = useState(false);

    // Fetch specializations from the database on component mount
    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/doctors/specializations`);
                const data = await res.json();
                if (res.ok) {
                    setSpecializations(data.specializations || []);
                }
            } catch (err) {
                console.error('Failed to fetch specializations:', err);
            }
        };
        fetchSpecializations();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const params = new URLSearchParams();
            if (searchData.doctorName.trim()) params.append('name', searchData.doctorName.trim());
            if (searchData.specialization) params.append('specialization', searchData.specialization);
            if (searchData.date) params.append('date', searchData.date);

            const res = await fetch(`${API_URL}/api/auth/doctors?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setDoctors(data.doctors || []);
                if (onSearch) onSearch(data.doctors || []);
            } else {
                setError(data.message || 'Failed to fetch doctors.');
                setDoctors([]);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Unable to connect to server. Please try again.');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewInfo = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDoctor(null);
    };

    return (
        <div className="channel-doctor-container">
            <div className="search-section">
                <div className="search-card">
                    <h2 className="channel-title">Channel Your Doctor</h2>
                    <form className="channel-form" onSubmit={handleSearch}>
                        <div className="search-inputs-vertical">
                            {/* Doctor Name */}
                            <div className="form-group">
                                <div className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="doctorName"
                                    placeholder="Doctor - Max 20 Characters"
                                    maxLength={20}
                                    value={searchData.doctorName}
                                    onChange={handleChange}
                                    className="form-input"
                                    autoComplete="off"
                                />
                                <div className="input-help-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Specialization */}
                            <div className="form-group">
                                <div className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 10h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V9c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1z" />
                                    </svg>
                                </div>
                                <select
                                    name="specialization"
                                    value={searchData.specialization}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="">Any Specialization</option>
                                    {specializations.map((spec, index) => (
                                        <option key={index} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div className="form-group">
                                <div className="input-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                                    </svg>
                                </div>
                                <input
                                    type="date"
                                    name="date"
                                    value={searchData.date}
                                    onChange={handleChange}
                                    className="form-input date-input"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <button type="submit" className="search-btn" disabled={loading}>
                            {loading ? (
                                <span className="btn-loading">Searching...</span>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                                    </svg>
                                    Search
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Error Message */}
            {error && <p className="search-error">{error}</p>}

            {/* Search Results */}
            {searched && !loading && (
                <div className="doctor-results">
                    {doctors.length === 0 ? (
                        <p className="no-results">No doctors found matching your search.</p>
                    ) : (
                        <>
                            <h3 className="results-title">{doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} Found</h3>
                            <div className="doctor-cards">
                                {doctors.map((doctor) => (
                                    <div key={doctor.id} className="doctor-card">
                                        <div className="doctor-card-header">
                                            <div className="doctor-avatar">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                            <div className="doctor-header-info">
                                                <h4 className="doctor-name">Dr. {doctor.name}</h4>
                                                <span className="doctor-specialization">{doctor.specialization}</span>
                                            </div>
                                        </div>
                                        <div className="doctor-card-body">
                                            {doctor.hospital && (
                                                <div className="doctor-detail">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                    </svg>
                                                    <span>{doctor.hospital}</span>
                                                </div>
                                            )}
                                            {doctor.phone && (
                                                <div className="doctor-detail">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                                    </svg>
                                                    <span>{doctor.phone}</span>
                                                </div>
                                            )}
                                            {doctor.email && (
                                                <div className="doctor-detail">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                                    </svg>
                                                    <span>{doctor.email}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="doctor-card-footer">
                                            <button className="view-info-btn" onClick={() => handleViewInfo(doctor)}>View Info</button>
                                            <button className="book-now-btn">Book Now</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
            {/* Doctor Info Modal */}
            {showModal && selectedDoctor && (
                <div className="doctor-modal-overlay" onClick={closeModal}>
                    <div className="doctor-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Doctor Information</h3>
                            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-avatar">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <div className="modal-info">
                                <h4 className="modal-doctor-name">Dr. {selectedDoctor.name}</h4>
                                <span className="modal-doctor-spec">{selectedDoctor.specialization}</span>

                                <div className="modal-details">
                                    <div className="modal-detail-item">
                                        <strong>Hospital:</strong>
                                        <span>{selectedDoctor.hospital || 'Not Specified'}</span>
                                    </div>
                                    <div className="modal-detail-item">
                                        <strong>Phone:</strong>
                                        <span>{selectedDoctor.phone || 'Not Specified'}</span>
                                    </div>
                                    <div className="modal-detail-item">
                                        <strong>Email:</strong>
                                        <span>{selectedDoctor.email || 'Not Specified'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-book-btn">Book Appointment Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChannelDoctor;
