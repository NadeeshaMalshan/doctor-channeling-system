import { useState } from 'react';
import './ComponentsCss/ChannelDoctor.css';

const ChannelDoctor = ({ onSearch }) => {
    const [searchData, setSearchData] = useState({
        doctorName: '',
        hospital: '',
        specialization: '',
        date: ''
    });

    const hospitals = [
        'Any Hospital',
        'NC+ Hospital Narammala',
        'Teaching Hospital Kurunegala',
        'Base Hospital Narammala'
    ];

    const specializations = [
        'Any Specialization',
        'General Physician',
        'Cardiologist',
        'Pediatrician',
        'Dermatologist',
        'Neurologist',
        'Orthopedic',
        'ENT Specialist',
        'Gynecologist'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchData);
        }
    };

    return (
        <div className="channel-doctor-container">
            <h2 className="channel-title">Channel Your Doctor</h2>
            <form className="channel-form" onSubmit={handleSearch}>
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
                    />
                    <div className="input-help">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                        </svg>
                    </div>
                </div>

                

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
                        {specializations.map((spec, index) => (
                            <option key={index} value={index === 0 ? '' : spec}>
                                {spec}
                            </option>
                        ))}
                    </select>
                </div>

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
                        placeholder="Any Date"
                    />
                </div>

                <button type="submit" className="search-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    Search
                </button>
            </form>
        </div>
    );
};

export default ChannelDoctor;
