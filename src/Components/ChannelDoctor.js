import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ComponentsCss/ChannelDoctorForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SUGGESTION_LIMIT = 5;

const HighlightMatch = ({ text, query }) => {
    if (!query.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <strong>{text.slice(idx, idx + query.length)}</strong>
            {text.slice(idx + query.length)}
        </span>
    );
};

const ChannelDoctor = () => {
    const navigate = useNavigate();

    const [searchData, setSearchData] = useState({
        doctorName: '',
        specialization: '',
        date: ''
    });

    const [specializations, setSpecializations] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const nameWrapperRef = useRef(null);

    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/doctors/specializations`);
                const data = await res.json();
                if (res.ok) setSpecializations(data.specializations || []);
            } catch (err) {
                console.error('Failed to fetch specializations:', err);
            }
        };
        fetchSpecializations();
    }, []);

    // Suggestion debounce
    useEffect(() => {
        const query = searchData.doctorName.trim();
        if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        setSuggestionLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/doctors?name=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (res.ok) { setSuggestions(data.doctors || []); setShowSuggestions(true); }
            } catch {
                setSuggestions([]);
            } finally {
                setSuggestionLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchData.doctorName]);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (nameWrapperRef.current && !nameWrapperRef.current.contains(e.target))
                setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
    };

    const goToResults = (data) => {
        const params = new URLSearchParams();
        if (data.doctorName.trim()) params.append('name', data.doctorName.trim());
        if (data.specialization) params.append('specialization', data.specialization);
        if (data.date) params.append('date', data.date);
        navigate(`/ecare/doctors?${params.toString()}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        goToResults(searchData);
    };

    const handleSelectSuggestion = (name) => {
        setSearchData(prev => ({ ...prev, doctorName: name }));
        setShowSuggestions(false);
        goToResults({ ...searchData, doctorName: name });
    };

    const visibleSuggestions = suggestions.slice(0, SUGGESTION_LIMIT);
    const extraCount = suggestions.length - SUGGESTION_LIMIT;

    return (
        <div className="channel-doctor-container">
            <div className="search-section">
                <div className="search-card">
                    <h2 className="channel-title">Channel Your Doctor</h2>
                    <form className="channel-form" onSubmit={handleSearch}>
                        <div className="search-inputs-vertical">
                            {/* Doctor Name with Autocomplete */}
                            <div className="name-input-wrapper" ref={nameWrapperRef}>
                                <div className="form-group">
                                    <div className="input-icon">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="doctorName"
                                        placeholder="Doctor name"
                                        maxLength={40}
                                        value={searchData.doctorName}
                                        onChange={handleChange}
                                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                        className="form-input"
                                        autoComplete="off"
                                    />
                                    {suggestionLoading && (
                                        <div className="input-help-icon">
                                            <span className="material-symbols-outlined suggestion-spin">sync</span>
                                        </div>
                                    )}
                                </div>

                                {showSuggestions && visibleSuggestions.length > 0 && (
                                    <ul className="suggestions-dropdown">
                                        {visibleSuggestions.map((doc) => (
                                            <li
                                                key={doc.id}
                                                className="suggestion-item"
                                                onMouseDown={() => handleSelectSuggestion(doc.name)}
                                            >
                                                <span className="material-symbols-outlined suggestion-icon">person</span>
                                                <span className="suggestion-name">
                                                    <HighlightMatch text={doc.name} query={searchData.doctorName} />
                                                </span>
                                                {doc.specialization && (
                                                    <span className="suggestion-spec">{doc.specialization}</span>
                                                )}
                                            </li>
                                        ))}
                                        {extraCount > 0 && (
                                            <li
                                                className="suggestion-more"
                                                onMouseDown={() => setShowSuggestions(false)}
                                            >
                                                <span className="material-symbols-outlined">expand_more</span>
                                                {extraCount} more result{extraCount !== 1 ? 's' : ''} below
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>

                            {/* Specialization */}
                            <div className="form-group">
                                <div className="input-icon">
                                    <span className="material-symbols-outlined">local_hospital</span>
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
                                    <span className="material-symbols-outlined">calendar_month</span>
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

                        <button type="submit" className="search-btn">
                            <span className="material-symbols-outlined">search</span>
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChannelDoctor;
