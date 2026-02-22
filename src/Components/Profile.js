import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        fetchProfile();
    }, [patientId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patient/${patientId}?t=${Date.now()}`);
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
    };

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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patient/${patientId}`, {
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
                    secondName: formData.secondName
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('Stored user after update:', updatedUser);

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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patient/${patientId}/photo`, {
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/patient/${patientId}`, {
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
            <div className="profile-modal">
                <div className="profile-header">
                    <h2>Your Profile</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="profile-content">
                    {error && <div className="profile-error">{error}</div>}
                    {success && <div className="profile-success">{success}</div>}

                    <div className="profile-photo-section">
                        <div className="profile-avatar">
                            {patient?.profile_photo ? (
                                <img src={`${process.env.REACT_APP_API_URL}${patient.profile_photo}`} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="photo-actions">
                            <label className="upload-btn">
                                {uploading ? 'Uploading...' : 'Change Photo'}
                                <input type="file" onChange={handlePhotoUpload} accept="image/*" hidden />
                            </label>
                        </div>
                    </div>

                    <form className="profile-form" onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                disabled={!editMode}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Second Name</label>
                            <input
                                type="text"
                                name="secondName"
                                value={formData.secondName}
                                onChange={handleInputChange}
                                disabled={!editMode}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email (Cannot be changed)</label>
                            <input type="email" value={patient?.email || ''} disabled className="readonly-input" />
                        </div>
                        <div className="form-group">
                            <label>NIC (Cannot be changed)</label>
                            <input type="text" value={patient?.nic || ''} disabled className="readonly-input" />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!editMode}
                                required
                            />
                        </div>

                        <div className="profile-actions">
                            {!editMode ? (
                                <button type="button" className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
                            ) : (
                                <div className="edit-actions">
                                    <button type="submit" className="save-btn">Save Changes</button>
                                    <button type="button" className="cancel-btn" onClick={() => {
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

                    <div className="danger-zone">
                        <h3>Danger Zone</h3>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button className="delete-account-btn" onClick={() => setShowDeleteConfirm(true)}>Delete My Account</button>
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
