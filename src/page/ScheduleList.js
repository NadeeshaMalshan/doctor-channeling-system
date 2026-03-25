import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import { formatScheduleDateLK } from '../utils/sriLankaTime';
import './css/ScheduleList.css';

const ScheduleList = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientId, setPatientId] = useState(null);
    const [bookedScheduleIds, setBookedScheduleIds] = useState(() => new Set());
    const navigate = useNavigate();
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        // Read patient id from localStorage (used for "already booked" validation)
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        try {
            const userData = JSON.parse(userStr);
            if (userData?.id != null) setPatientId(Number(userData.id));
        } catch {
            // ignore invalid stored user
        }
    }, []);

    useEffect(() => {
        if (!patientId) return;
        const fetchBookedSchedules = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/appointments/patient/${patientId}`);
                const data = await res.json();
                if (!res.ok) return;
                const booked = (data.data || [])
                    .filter((a) => {
                        const st = String(a?.appointment_status || 'added').toLowerCase();
                        return !['failed', 'cancelled'].includes(st);
                    })
                    .map((a) => Number(a.schedule_id))
                    .filter((n) => Number.isFinite(n));
                setBookedScheduleIds(new Set(booked));
            } catch {
                // if check fails, keep normal behavior (only slot-full disable)
            }
        };
        fetchBookedSchedules();
    }, [patientId, API_BASE]);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/schedules`);
            const data = await res.json();
            if (data.success) {
                // Filter only active schedules and future dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const activeSchedules = data.data.filter(s => {
                    const schedDate = new Date(s.schedule_date);
                    return (s.status === 'active' || s.status === 'full') && schedDate >= today;
                });

                setSchedules(activeSchedules);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = (schedule) => {
        // Must check if user is logged in
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Please login to book an appointment.');
            navigate('/login');
            return;
        }

        navigate(`/appointments/new/${schedule.id}/${schedule.doctor_id}`, {
            state: { schedule, from: '/schedules' }
        });
    };

    const formatDate = (dateString) => formatScheduleDateLK(dateString);

    return (
        <div className="schedule-list-page">
            <ECareNavBar />

            <div className="schedule-list-container">
                <div className="schedule-list-header">
                    <h2>Appointment Schedules</h2>
                    <p>Browse through our expert doctors and book a convenient time for your consultation.</p>
                </div>

                {loading ? (
                    <div className="empty-state">Loading schedules...</div>
                ) : schedules.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Active Schedules</h3>
                        <p>There are currently no available schedules. Please check back later.</p>
                    </div>
                ) : (
                    <div className="schedules-grid">
                        {schedules.map(schedule => (
                            <div className="patient-schedule-card" key={schedule.id}>
                                <div className="card-doc-info">
                                    <h3>Dr. {schedule.doctor_name}</h3>
                                    <div className="spec">{schedule.specialization}</div>
                                </div>

                                <div className="card-time-info">
                                    <div className="info-row">
                                        <div className="info-icon">📅</div>
                                        <span>{formatDate(schedule.schedule_date)}</span>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-icon">⏰</div>
                                        <span>{schedule.start_time} - {schedule.end_time}</span>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-icon">👥</div>
                                        <span>{schedule.max_patients - schedule.booked_count} spots left</span>
                                    </div>
                                </div>

                                {bookedScheduleIds.has(Number(schedule.id)) ? (
                                    <button
                                        className="book-now-btn"
                                        style={{ backgroundColor: '#6B7280', cursor: 'not-allowed' }}
                                        disabled
                                    >
                                        ALREADY BOOKED
                                    </button>
                                ) : schedule.booked_count >= schedule.max_patients || schedule.status === 'full' ? (
                                    <button
                                        className="book-now-btn"
                                        style={{ backgroundColor: '#6B7280', cursor: 'not-allowed' }}
                                        disabled
                                    >
                                        FULL
                                    </button>
                                ) : (
                                    <button
                                        className="book-now-btn"
                                        onClick={() => handleBook(schedule)}
                                    >
                                        Book Now
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleList;
