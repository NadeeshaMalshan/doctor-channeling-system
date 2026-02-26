import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import './css/CreateSchedule.css';

const CreateSchedule = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        doctor_id: '',
        schedule_date: '',
        start_time: '',
        end_time: '',
        max_patients: '',
        price: ''
    });

    // New state for dynamic dropdowns
    const [allDoctors, setAllDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState([]);

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Fetch doctors on mount
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/doctors');
                const data = await response.json();
                if (response.ok && data.doctors) {
                    setAllDoctors(data.doctors);
                    // Extract unique specializations
                    const uniqueSpecs = [...new Set(data.doctors.map(doc => doc.specialization))];
                    setSpecializations(uniqueSpecs);
                }
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
                setIsError(true);
                setMessage("Could not load doctors list.");
            }
        };
        fetchDoctors();
    }, []);

    // Handle specialization change
    const handleSpecializationChange = (e) => {
        const spec = e.target.value;
        setSelectedSpecialization(spec);

        // Filter doctors by selected specialization
        const filtered = allDoctors.filter(doc => doc.specialization === spec);
        setFilteredDoctors(filtered);

        // Reset doctor selection
        setFormData(prev => ({ ...prev, doctor_id: '' }));
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
            const response = await fetch('http://localhost:5000/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Schedule created successfully!');
                setFormData({
                    doctor_id: '',
                    schedule_date: '',
                    start_time: '',
                    end_time: '',
                    max_patients: '',
                    price: ''
                });
            } else {
                setIsError(true);
                setMessage(data.message || 'Failed to create schedule');
            }
        } catch (error) {
            setIsError(true);
            setMessage('Network error occurred. Please try again.');
        }
    };

    return (
        <div className="create-schedule-page">
            <ECareNavBar />
            <div className="create-schedule-container">
                <div className="create-schedule-header">
                    <h2>Create Doctor Schedule</h2>
                    <p>Add new availability for doctors</p>
                </div>

                {message && (
                    <div className={`message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <form className="schedule-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Specialization</label>
                        <select
                            value={selectedSpecialization}
                            onChange={handleSpecializationChange}
                            required
                        >
                            <option value="">Select Specialization</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Doctor Name</label>
                        <select
                            name="doctor_id"
                            value={formData.doctor_id}
                            onChange={handleChange}
                            required
                            disabled={!selectedSpecialization}
                        >
                            <option value="">Select a Doctor</option>
                            {filteredDoctors.map(doc => (
                                <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Schedule Date</label>
                        <input
                            type="date"
                            name="schedule_date"
                            value={formData.schedule_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="time-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input
                                type="time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Max Patients</label>
                        <input
                            type="number"
                            name="max_patients"
                            value={formData.max_patients}
                            onChange={handleChange}
                            placeholder="e.g. 20"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Price (Rs.)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="e.g. 1500.00"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">Create Schedule</button>
                    <button type="button" className="submit-btn" style={{ background: '#6B7280', marginTop: '10px' }} onClick={() => navigate('/ecare/staff/admin')}>Back to Dashboard</button>
                </form>
            </div>
        </div>
    );
};

export default CreateSchedule;
