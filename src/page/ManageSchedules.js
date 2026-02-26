import React, { useState, useEffect } from 'react';
import ECareNavBar from '../Components/eCareNavBar';
import './css/ManageSchedules.css';

const ManageSchedules = () => {
    // ... [existing state and effects] ...

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    // New state for filters
    const [allDoctors, setAllDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');

    // Modal state for appointments
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Fetch all doctors on mount for the filters
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/doctors');
                const data = await response.json();
                if (response.ok && data.doctors) {
                    setAllDoctors(data.doctors);
                    const uniqueSpecs = [...new Set(data.doctors.map(doc => doc.specialization))];
                    setSpecializations(uniqueSpecs);
                }
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        fetchSchedules(selectedDate, selectedSpecialization, selectedDoctorId);
    }, [selectedDate, selectedSpecialization, selectedDoctorId]);

    const fetchSchedules = async (date, spec = '', docId = '') => {
        setLoading(true);
        // Format date as YYYY-MM-DD
        const formattedDate = date.toLocaleDateString('en-CA');
        try {
            // Build query params
            const queryParams = new URLSearchParams();
            if (spec) queryParams.append('specialization', spec);
            if (docId) queryParams.append('doctor_id', docId);

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

            const res = await fetch(`http://localhost:5000/api/schedules/date/${formattedDate}${queryString}`);
            const data = await res.json();
            if (data.success) {
                setSchedules(data.data);
            } else {
                setSchedules([]);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (scheduleId, currentStatus) => {
        const nextStatus = currentStatus === 'active' ? 'cancelled' : 'active';
        try {
            const res = await fetch(`http://localhost:5000/api/schedules/${scheduleId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            if (res.ok) {
                fetchSchedules(selectedDate, selectedSpecialization, selectedDoctorId);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleManageApps = async (scheduleId) => {
        setSelectedScheduleId(scheduleId);
        try {
            const res = await fetch(`http://localhost:5000/api/appointments/schedule/${scheduleId}`);
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                // Refresh appointments list
                handleManageApps(selectedScheduleId);
                // Also refresh schedule list to reflect new booked_count
                fetchSchedules(selectedDate, selectedSpecialization, selectedDoctorId);
            } else {
                alert('Failed to delete appointment');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    // Filter Handlers
    const handleSpecializationChange = (e) => {
        const spec = e.target.value;
        setSelectedSpecialization(spec);

        const filtered = allDoctors.filter(doc => doc.specialization === spec);
        setFilteredDoctors(filtered);
        setSelectedDoctorId(''); // Reset doctor when specialization changes
    };

    const handleDoctorChange = (e) => {
        setSelectedDoctorId(e.target.value);
    };

    // Calendar Helper functions
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        let days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-cell disabled"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const isSelected = dateObj.toLocaleDateString('en-CA') === selectedDate.toLocaleDateString('en-CA');
            days.push(
                <div
                    key={d}
                    className={`calendar-cell ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedDate(dateObj)}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(selectedDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    return (

        <div className="manage-schedules-page">
            <ECareNavBar />
            <div className="manage-schedules-container">
                <div className="manage-header">
                    <h2>Manage Doctor Schedules</h2>
                </div>

                <div className="manage-filters">
                    <div className="filter-group">
                        <label>Filter by Specialization</label>
                        <select
                            value={selectedSpecialization}
                            onChange={handleSpecializationChange}
                            className="filter-select"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Filter by Doctor</label>
                        <select
                            value={selectedDoctorId}
                            onChange={handleDoctorChange}
                            disabled={!selectedSpecialization}
                            className="filter-select"
                        >
                            <option value="">All Doctors</option>
                            {filteredDoctors.map(doc => (
                                <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="calendar-layout">
                    {/* Sidebar Calendar */}
                    <div className="calendar-sidebar">
                        <div className="calendar-header">
                            <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>&#8592;</button>
                            <span>{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>&#8594;</button>
                        </div>
                        <div className="calendar-grid">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="calendar-day-name">{day}</div>
                            ))}
                            {generateCalendar()}
                        </div>
                    </div>

                    {/* Schedule Content */}
                    <div className="schedule-content">
                        <div className="date-title">
                            Schedules for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>

                        {loading ? (
                            <p>Loading schedules...</p>
                        ) : schedules.length === 0 ? (
                            <p>No schedules found for this date.</p>
                        ) : (
                            <div className="doctor-cards-grid">
                                {schedules.map(schedule => (
                                    <div className="doctor-card" key={schedule.id}>
                                        <h3>Dr. {schedule.doctor_name}</h3>
                                        <div className="spec">{schedule.specialization}</div>

                                        <span className={`status-badge status-${schedule.status}`}>
                                            {schedule.status}
                                        </span>

                                        <div className="schedule-details">
                                            <p><strong>Time:</strong> {schedule.start_time} - {schedule.end_time}</p>
                                            <p><strong>Booked:</strong> {schedule.booked_count} / {schedule.max_patients}</p>
                                            <p><strong>Price:</strong> Rs. {Number(schedule.price).toFixed(2)}</p>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                className="action-btn btn-outline"
                                                onClick={() => handleStatusToggle(schedule.id, schedule.status)}
                                            >
                                                Toggle Status
                                            </button>
                                            <button
                                                className="action-btn btn-primary"
                                                onClick={() => handleManageApps(schedule.id)}
                                            >
                                                Manage Apps
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Appointments Modal */}
                {showModal && (
                    <div className="appointments-modal-overlay">
                        <div className="appointments-modal">
                            <div className="modal-header">
                                <h3> {schedules
                                    .filter(schedule => schedule.id === selectedScheduleId)
                                    .map(schedule => (
                                        <h3 key={schedule.id}>Appointments for Dr. {schedule.doctor_name}</h3>
                                    ))
                                }</h3>
                                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>

                            </div>

                            <div className="appointment-list">
                                {appointments.length === 0 ? (
                                    <p>No appointments booked yet.</p>
                                ) : (
                                    appointments.map(app => (
                                        <div className="appointment-item" key={app.id}>
                                            <div className="app-info">
                                                <h4>{app.first_name} {app.second_name}</h4>
                                                <p>Phone: {app.customer_phone}</p>
                                                <p>Booked on: {new Date(app.created_at).toLocaleString()}</p>
                                            </div>
                                            <div className="app-actions">
                                                <span id='payment'>Payment Status :</span>
                                                <span className={`status ${app.appointment_payment_status}`}>
                                                    {app.appointment_payment_status}
                                                </span>

                                                <button
                                                    className="btn-danger"
                                                    onClick={() => handleDeleteAppointment(app.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageSchedules;
