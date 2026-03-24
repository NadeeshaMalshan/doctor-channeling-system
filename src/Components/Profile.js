import React, { useState, useEffect, useCallback } from 'react';
import './ComponentsCss/Profile.css';

const Profile = ({ patientId, onClose, onUpdate }) => {
    const [patient, setPatient] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        secondName: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/patient/${patientId}?t=${Date.now()}`);
            const data = await response.json();

            if (response.ok) {
                setPatient(data.patient);
                setFormData({
                    firstName: data.patient.first_name,
                    secondName: data.patient.second_name,
                    phone: data.patient.phone
                });
            } else {
                setError(data.message || 'Failed to fetch profile');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        console.log('Starting profile update for patientId:', patientId);
        console.log('Data being sent:', formData);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/patient/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Update response status:', response.status);
            console.log('Update response data:', data);

            if (response.ok) {
                // Update local storage so the Navbar also updates
                const storedUser = JSON.parse(localStorage.getItem('user'));
                console.log('Stored user before update:', storedUser);

                const updatedUser = {
                    ...storedUser,
                    firstName: formData.firstName,
                    secondName: formData.secondName,
                    first_name: formData.firstName,
                    second_name: formData.secondName
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('Stored user after update:', updatedUser);
                window.dispatchEvent(new Event('profileUpdated'));

                setSuccess('Profile updated successfully!');
                setEditMode(false);

                // Add a small delay to ensure DB has settled and avoid caching
                setTimeout(() => {
                    fetchProfile();
                    if (onUpdate) onUpdate(updatedUser);
                }, 500);
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('CRITICAL Error updating profile:', err);
            setError('Failed to connect to the server');
        }
    };


    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataPhoto = new FormData();
        formDataPhoto.append('profilePhoto', file);

        setUploading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/patient/${patientId}/photo`, {
                method: 'POST',
                body: formDataPhoto
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Photo uploaded successfully!');
                fetchProfile();
                if (onUpdate) onUpdate();
            } else {
                setError(data.message || 'Failed to upload photo');
            }
        } catch (err) {
            console.error('Error uploading photo:', err);
            setError('Failed to connect to the server');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/patient/${patientId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                localStorage.clear();
                window.location.href = '/';
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete account');
                setShowDeleteConfirm(false);
            }
        } catch (err) {
            console.error('Error deleting account:', err);
            setError('Failed to connect to the server');
            setShowDeleteConfirm(false);
        }
    };

    if (loading) return <div className="profile-loading">Loading profile...</div>;

    return (
        <div className="profile-overlay">
            <div className="profile-modal new-design">
                <div className="profile-header">
                    <div className="header-title">
                        <svg className="header-icon" viewBox="0 0 24 24" fill="#304f6d">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                        <h2>Your Profile</h2>
                    </div>
                    <button className="close-btn-new" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="profile-content">
                    {error && <div className="profile-error">{error}</div>}
                    {success && <div className="profile-success">{success}</div>}

                    <div className="profile-top-section">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-outer">
                                {patient?.profile_photo ? (
                                    <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${patient.profile_photo}`} alt="Profile" className="avatar-img" />
                                ) : (
                                    <div className="avatar-placeholder new-placeholder">
                                        <svg viewBox="0 0 24 24" fill="#304f6d">
                                            <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                        <label className="change-photo-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
                            <input type="file" onChange={handlePhotoUpload} accept="image/*" hidden />
                        </label>
                    </div>

                    <form className="profile-details-form" onSubmit={handleUpdate}>
                        <div className="detail-row">
                            <div className="detail-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#64748b"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                <span>First Name</span>
                            </div>
                            <div className="detail-value">
                                {editMode ? (
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="edit-input" />
                                ) : (
                                    <span>{formData.firstName || patient?.first_name}</span>
                                )}
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#64748b"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                <span>Second Name</span>
                            </div>
                            <div className="detail-value">
                                {editMode ? (
                                    <input type="text" name="secondName" value={formData.secondName} onChange={handleInputChange} required className="edit-input" />
                                ) : (
                                    <span>{formData.secondName || patient?.second_name}</span>
                                )}
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#64748b"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                <span>Email</span>
                            </div>
                            <div className="detail-value locked-val-container">
                                <span>{patient?.email || ''}</span>
                                <div className="lock-badge">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
                                    Cannot be changed
                                </div>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#64748b"><path d="M21 3H3C1.89 3 1 3.89 1 5v14c0 1.11.89 2 2 2h18c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H3V5h18v14zm-9-8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4 8c0-1.33 2.67-2 4-2s4 .67 4 2v1H8v-1z"/></svg>
                                <span>NIC</span>
                            </div>
                            <div className="detail-value locked-val-container">
                                <span>{patient?.nic || ''}</span>
                                <div className="lock-badge">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
                                    Cannot be changed
                                </div>
                            </div>
                        </div>

                        <div className="detail-row borderless">
                            <div className="detail-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#64748b"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                                <span>Phone</span>
                            </div>
                            <div className="detail-value">
                                {editMode ? (
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="edit-input" />
                                ) : (
                                    <span>{formData.phone || patient?.phone}</span>
                                )}
                            </div>
                        </div>

                        <div className="profile-actions-area">
                            {!editMode ? (
                                <button type="button" className="btn-edit-profile" onClick={() => setEditMode(true)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="edit-btn-group">
                                    <button type="submit" className="btn-save-profile">Save Changes</button>
                                    <button type="button" className="btn-cancel-profile" onClick={() => {
                                        setEditMode(false);
                                        setFormData({
                                            firstName: patient.first_name,
                                            secondName: patient.second_name,
                                            phone: patient.phone
                                        });
                                    }}>Cancel</button>
                                </div>
                            )}
                        </div>
                    </form>

                    <div className="danger-zone-card">
                        <div className="danger-zone-header">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="#d45f53"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                            <h3>Danger Zone</h3>
                        </div>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button className="btn-delete-account" onClick={() => setShowDeleteConfirm(true)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            Delete My Account
                        </button>
                    </div>
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <h3>Delete Account?</h3>
                        <p>Are you sure you want to delete your account? this action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button className="confirm-delete-btn" onClick={handleDeleteAccount}>Yes, Delete Account</button>
                            <button className="confirm-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>No, Keep Account</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
