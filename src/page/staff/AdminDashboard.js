import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaUserTie, FaStethoscope, FaClipboardList } from 'react-icons/fa';
import LogoHospital from '../../images/LogoHospital.png';
import '../css/CashierDashboard.css';
import '../css/StaffDashboard.css';
import '../css/CustomerSupport.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Category and List State
    const [selectedCategory, setSelectedCategory] = useState(null); // 'user', 'staff', 'doctor'
    const [expandedId, setExpandedId] = useState(null);

    // Staff Form State
    const [staff, setStaff] = useState([]);
    const [editingStaffId, setEditingStaffId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [showStaffPassword, setShowStaffPassword] = useState(false);
    const [, setIsLoadingStaff] = useState(false);

    // Initial form state including new fields
    const initialStaffForm = {
        name: '', // This will be used as username in the backend match
        email: '',
        phone: '',
        role: '',
        password: '',
        account_status: 'Active'
    };

    const [staffFormData, setStaffFormData] = useState(initialStaffForm);

    // Registration Requests State
    const [activeSection, setActiveSection] = useState("dashboard");
    const [requests, setRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);

    const [users, setUsers] = useState([]);
    const [, setIsLoadingUsers] = useState(false);

    // Removed dummy staff data

    const [doctors, setDoctors] = useState([]);
    const [, setIsLoadingDoctors] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Fetch staff from backend
    const fetchStaff = useCallback(async () => {
        setIsLoadingStaff(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/staff`);
            // Map backend fields to frontend fields
            const formattedStaff = response.data.map(s => ({
                id: s.id,
                name: s.username, // username from DB -> name in state
                email: s.email,
                phone: s.phone_number,
                role: s.role,
                account_status: s.account_status,
                password: '' // Don't fetch passwords
            }));
            setStaff(formattedStaff);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setIsLoadingStaff(false);
        }
    }, [API_URL]);

    // Fetch users from backend
    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/users`);
            // Map backend fields to frontend fields
            const formattedUsers = response.data.map(u => ({
                id: u.id,
                name: `${u.first_name} ${u.second_name}`,
                email: u.email,
                phone: u.phone,
                nic: u.nic,
                role: 'Patient'
            }));
            setUsers(formattedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [API_URL]);

    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoadingDoctors(true);
            try {
                const response = await axios.get(`${API_URL}/api/admin/doctors`);
                const formattedDoctors = response.data.map(doc => ({
                    ...doc,
                    role: 'Doctor',
                    details: doc.specialization + (doc.hospital ? ` - ${doc.hospital}` : '')
                }));
                setDoctors(formattedDoctors);
            } catch (error) {
                console.error('Error fetching doctors:', error);
                // alert('Failed to fetch doctors');
            } finally {
                setIsLoadingDoctors(false);
            }
        };

        if (selectedCategory === 'doctor') {
            fetchDoctors();
        }
        if (selectedCategory === 'staff') {
            fetchStaff();
        }
        if (selectedCategory === 'user') {
            fetchUsers();
        }

        if (!selectedCategory) {
            fetchDoctors();
            fetchStaff();
            fetchUsers();
        }
    }, [selectedCategory, API_URL, fetchStaff, fetchUsers]);

    const handleLogout = () => {
        navigate('/ecare/staff-login');
    };

    // Fetch pending doctor requests from the database
    const fetchPendingDoctors = useCallback(async () => {
        setIsLoadingRequests(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/doctor-requests`);
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching pending doctors:', error);
        } finally {
            setIsLoadingRequests(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchPendingDoctors();
    }, [fetchPendingDoctors]);

    const handleApprove = async (id) => {
        try {
            await axios.put(`${API_URL}/api/admin/doctor-requests/${id}/approve`);
            alert("Doctor Approved Successfully");
            fetchPendingDoctors();
        } catch (error) {
            console.error('Error approving doctor:', error);
            alert(error.response?.data?.message || "Failed to approve doctor");
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.put(`${API_URL}/api/admin/doctor-requests/${id}/reject`);
            alert("Doctor Rejected");
            fetchPendingDoctors();
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            alert(error.response?.data?.message || "Failed to reject doctor");
        }
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setExpandedId(null);
    };

    const handleToggleInfo = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleDeleteRecord = async (id) => {
        if (selectedCategory === 'user') {
            try {
                const response = await axios.delete(`${API_URL}/api/admin/users/${id}`);
                alert(response.data.message || "User Deleted Successfully");
                fetchUsers(); // Refresh list from DB
            } catch (error) {
                console.error('Error deleting user:', error);
                alert(error.response?.data?.message || "Failed to delete user");
            }
            return;
        }
        if (selectedCategory === 'staff') {
            try {
                const response = await axios.delete(`${API_URL}/api/admin/staff/${id}`);
                alert(response.data.message || "Staff Deleted Successfully");
                fetchStaff(); // Refresh list from DB
            } catch (error) {
                console.error('Error deleting staff:', error);
                alert(error.response?.data?.message || "Failed to delete staff");
            }
            return;
        }
        if (selectedCategory === 'doctor') {
            try {
                const response = await axios.delete(`${API_URL}/api/admin/doctors/${id}`);
                setDoctors(doctors.filter(item => item.id !== id));
                alert(response.data.message || "Doctor Deleted Successfully");
            } catch (error) {
                console.error('Error deleting doctor:', error);
                const errorMessage = error.response?.data?.message || "Failed to delete doctor. Please try again.";
                alert(errorMessage);
            }
            return;
        }
        alert("Record Deleted Successfully");
    };

    const handleStaffFormChange = (e) => {
        setStaffFormData({ ...staffFormData, [e.target.name]: e.target.value });
        // Clear error for the field being changed
        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: false });
        }
    };

    const handleAddOrUpdateStaff = async (e) => {
        e.preventDefault();

        // Strict Validation
        const errors = {
            name: !staffFormData.name,
            email: !staffFormData.email,
            phone: !staffFormData.phone,
            role: !staffFormData.role,
            password: !editingStaffId && !staffFormData.password // password required only for new staff
        };

        if (errors.name || errors.email || errors.phone || errors.role || errors.password) {
            setFormErrors(errors);
            alert("Please fill all required fields");
            return;
        }

        setFormErrors({});

        try {
            const payload = {
                username: staffFormData.name,
                password: staffFormData.password,
                role: staffFormData.role,
                phone_number: staffFormData.phone,
                email: staffFormData.email,
                account_status: staffFormData.account_status
            };

            if (editingStaffId) {
                const response = await axios.put(`${API_URL}/api/admin/staff/${editingStaffId}`, payload);
                alert(response.data.message || "Staff Updated Successfully");
                setEditingStaffId(null);
            } else {
                const response = await axios.post(`${API_URL}/api/admin/staff`, payload);
                alert(response.data.message || "Staff Added Successfully");
            }

            setStaffFormData(initialStaffForm);
            setFormErrors({});
            setShowStaffPassword(false);
            fetchStaff(); // Refresh list from DB
        } catch (error) {
            console.error('Error saving staff:', error);
            alert(error.response?.data?.message || "Error saving staff member");
        }
    };

    const handleEditStaff = (member) => {
        setStaffFormData({
            name: member.name,
            email: member.email,
            phone: member.phone,
            role: member.role,
            password: '', // Don't pre-fill password
            account_status: member.account_status || 'Active'
        });
        setEditingStaffId(member.id);
        setFormErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderList = () => {
        let currentList = [];
        let title = "";

        if (selectedCategory === 'user') { currentList = users; title = "User Management"; }
        else if (selectedCategory === 'staff') { currentList = staff; title = "Staff Management"; }
        else if (selectedCategory === 'doctor') { currentList = doctors; title = "Doctor Management"; }

        return (
            <div className="management-container" style={{ marginTop: '3rem' }}>
                <button
                    onClick={() => {
                        setSelectedCategory(null);
                        setEditingStaffId(null);
                        setStaffFormData({ name: '', email: '', phone: '', role: '', password: '' });
                        setFormErrors({});
                        setShowStaffPassword(false);
                    }}
                    style={{
                        padding: '0.6rem 1.2rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f8f9fa',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500'
                    }}
                >
                    <span>←</span> Back to Dashboard
                </button>
                <div className="management-section" style={{ padding: '2rem', border: '1px solid #ced4da', borderRadius: '10px', backgroundColor: '#fff' }}>
                    <h2 style={{ color: '#1E3A5F', marginBottom: '2rem', marginTop: 0 }}>{title}</h2>

                    {selectedCategory === 'staff' && (
                        <div style={{ marginBottom: '2.5rem', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1E3A5F', fontSize: '1.4rem' }}>{editingStaffId ? 'Update Staff Member' : 'Add New Staff Member'}</h3>
                            <form onSubmit={handleAddOrUpdateStaff} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <input type="text" name="name" placeholder="Name" autoComplete="off" value={staffFormData.name} onChange={handleStaffFormChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: formErrors.name ? '1px solid #dc3545' : '1px solid #d1d5db', outline: 'none', transition: '0.3s ease', marginBottom: '12px' }} onFocus={(e) => e.target.style.borderColor = '#1E3A5F'} onBlur={(e) => e.target.style.borderColor = formErrors.name ? '#dc3545' : '#d1d5db'} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <input type="email" name="email" placeholder="Email" autoComplete="off" value={staffFormData.email} onChange={handleStaffFormChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: formErrors.email ? '1px solid #dc3545' : '1px solid #d1d5db', outline: 'none', transition: '0.3s ease', marginBottom: '12px' }} onFocus={(e) => e.target.style.borderColor = '#1E3A5F'} onBlur={(e) => e.target.style.borderColor = formErrors.email ? '#dc3545' : '#d1d5db'} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <input type="text" name="phone" placeholder="Phone" autoComplete="off" value={staffFormData.phone} onChange={handleStaffFormChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: formErrors.phone ? '1px solid #dc3545' : '1px solid #d1d5db', outline: 'none', transition: '0.3s ease', marginBottom: '12px' }} onFocus={(e) => e.target.style.borderColor = '#1E3A5F'} onBlur={(e) => e.target.style.borderColor = formErrors.phone ? '#dc3545' : '#d1d5db'} />
                                </div>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <input
                                        type={showStaffPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        autoComplete="new-password"
                                        value={staffFormData.password}
                                        onChange={handleStaffFormChange}
                                        style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: formErrors.password ? '1px solid #dc3545' : '1px solid #d1d5db', outline: 'none', transition: '0.3s ease', paddingRight: '4rem' }}
                                        onFocus={(e) => e.target.style.borderColor = '#1E3A5F'} onBlur={(e) => e.target.style.borderColor = formErrors.password ? '#dc3545' : '#d1d5db'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                                        style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#1E3A5F', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {showStaffPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px' }}>
                                    <select
                                        name="role"
                                        value={staffFormData.role}
                                        onChange={handleStaffFormChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            border: formErrors.role ? '1px solid #dc3545' : '1px solid #d1d5db',
                                            backgroundColor: 'white',
                                            transition: '0.3s ease',
                                            outline: 'none',
                                            color: staffFormData.role ? '#1E3A5F' : '#9ca3af'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1E3A5F'}
                                        onBlur={(e) => e.target.style.borderColor = formErrors.role ? '#dc3545' : '#d1d5db'}
                                    >
                                        <option value="" disabled>Select Role</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Cashier">Cashier</option>
                                        <option value="Booking Manager">Booking Manager</option>
                                        <option value="HR">HR</option>
                                    </select>
                                    {formErrors.role && <p style={{ color: '#dc3545', fontSize: '0.8rem', margin: '4px 0 0 4px' }}>Role is required</p>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px' }}>
                                    <select
                                        name="account_status"
                                        value={staffFormData.account_status}
                                        onChange={handleStaffFormChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            border: '1px solid #d1d5db',
                                            backgroundColor: 'white',
                                            transition: '0.3s ease',
                                            outline: 'none',
                                            color: '#1E3A5F'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1E3A5F'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <button
                                        type="submit"
                                        style={{ flex: 1, backgroundColor: '#1E3A5F', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '600', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(30,58,95,0.3)' }}
                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2D4E7A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1E3A5F'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        {editingStaffId ? 'Update Staff' : 'Add Staff'}
                                    </button>
                                    {editingStaffId && (
                                        <button type="button" onClick={() => { setEditingStaffId(null); setStaffFormData({ name: '', email: '', phone: '', role: '', password: '' }); setFormErrors({}); setShowStaffPassword(false); }} style={{ backgroundColor: '#6b7280', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowX: 'auto' }}>
                        {currentList.length > 0 ? (
                            selectedCategory === 'staff' ? (
                                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                    <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
                                        <tr>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Username</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Email</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Role</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Status</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentList.map((item, index) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: 'white', transition: 'background-color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                                <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1E3A5F' }}>{item.name}</td>
                                                <td style={{ padding: '16px 20px', color: '#6b7280' }}>{item.email}</td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.role}</span>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: item.account_status === 'Active' ? '#dcfce7' : '#fee2e2', color: item.account_status === 'Active' ? '#166534' : '#991b1b', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                        {item.account_status || 'Active'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={() => handleEditStaff(item)} style={{ backgroundColor: '#1E3A5F', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500', boxShadow: '0 2px 4px rgba(30, 58, 95, 0.2)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2D4E7A'; e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1E3A5F'; e.currentTarget.style.transform = 'translateY(0)' }}>Edit</button>
                                                    <button onClick={() => handleDeleteRecord(item.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)' }}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : selectedCategory === 'user' ? (
                                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                    <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
                                        <tr>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Username</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Email</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Phone</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>NIC</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentList.map((item, index) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: 'white', transition: 'background-color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                                <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1E3A5F' }}>{item.name}</td>
                                                <td style={{ padding: '16px 20px', color: '#6b7280' }}>{item.email}</td>
                                                <td style={{ padding: '16px 20px', color: '#6b7280' }}>{item.phone}</td>
                                                <td style={{ padding: '16px 20px', color: '#6b7280' }}>{item.nic}</td>
                                                <td style={{ padding: '16px 20px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <button onClick={() => handleDeleteRecord(item.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)' }}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : selectedCategory === 'doctor' ? (
                                <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                    <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e5e7eb' }}>
                                        <tr>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Full Name</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Specialization</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>SLMC ID</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Email</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Phone</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600' }}>Hospital</th>
                                            <th style={{ padding: '16px 20px', color: '#4b5563', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentList.map((item, index) => (
                                            <React.Fragment key={item.id}>
                                                <tr style={{ borderBottom: expandedId === item.id ? 'none' : '1px solid #f3f4f6', backgroundColor: 'white', transition: 'background-color 0.2s ease', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'} onClick={() => handleToggleInfo(item.id)}>
                                                    <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1E3A5F' }}>{item.name}</td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.specialization}</span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', color: '#6b7280', fontWeight: '500' }}>{item.slmc_no}</td>
                                                    <td style={{ padding: '16px 20px', color: '#6b7280' }}>{item.email}</td>
                                                    <td style={{ padding: '16px 20px', color: '#6b7280' }}>{item.phone}</td>
                                                    <td style={{ padding: '16px 20px', color: '#6b7280' }}>{item.hospital || 'Not Specified'}</td>
                                                    <td style={{ padding: '16px 20px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRecord(item.id); }} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)' }}>Delete</button>
                                                    </td>
                                                </tr>
                                                {expandedId === item.id && (
                                                    <tr style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#f8f9fa' }}>
                                                        <td colSpan="6" style={{ padding: '16px 20px' }}>
                                                            <div style={{ padding: '12px', borderLeft: '4px solid #0ea5e9', display: 'flex', gap: '3rem' }}>
                                                                <div>
                                                                    <p style={{ margin: '0.4rem 0', color: '#6b7280' }}><strong>SLMC Number:</strong> {item.slmc_no}</p>
                                                                    <p style={{ margin: '0.4rem 0', color: '#6b7280' }}><strong>NIC Number:</strong> {item.nic}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            ) : null
                        ) : (
                            <p>No records found.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="staff-dashboard">
            <nav className="cashier-navbar">
                <div className="cashier-navbar-brand">
                    <div className="cashier-logo-icon">
                        <img src={LogoHospital} alt="NCC Logo" />
                    </div>
                    <div className="cashier-brand-text">
                        <span className="brand-name">NCC eCare</span>
                        <span className="brand-tagline">Admin Portal</span>
                    </div>
                </div>

                <div className="cashier-navbar-actions">
                    <div className="cashier-staff-badge">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        <span>Role: <strong>Admin</strong></span>
                    </div>

                    <button
                        className="cashier-nav-btn btn-logout"
                        onClick={handleLogout}
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="dashboard-content">
                {!selectedCategory ? (
                    activeSection === "dashboard" ? (
                        <>
                            <div className="cashier-hero" style={{ padding: '24px 32px' }}>
                                <div className="cashier-hero-content">
                                    <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Welcome, Administrator</h1>
                                    <p>Manage system users.</p>
                                </div>
                                <div className="bg-circles">
                                    <div className="circle circle-1"></div>
                                    <div className="circle circle-2"></div>
                                </div>
                            </div>

                            <style>{`
                                .dashboard-grid-2x2 {
                                    margin-top: 2rem;
                                    display: grid;
                                    grid-template-columns: repeat(2, 1fr);
                                    gap: 25px;
                                    max-width: 1250px;
                                    margin-left: auto;
                                    margin-right: auto;
                                }
                                @media (max-width: 768px) {
                                    .dashboard-grid-2x2 {
                                        grid-template-columns: 1fr;
                                    }
                                }
                                .dashboard-card-2x2 {
                                    cursor: pointer;
                                    background: white;
                                    border-radius: 16px;
                                    padding: 25px;
                                    height: 180px;
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                                    transition: 0.3s ease;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    text-align: center;
                                    border: none;
                                }
                                .dashboard-card-2x2:hover {
                                    transform: translateY(-5px);
                                    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
                                }
                            `}</style>
                            <div className="dashboard-grid-2x2">
                                <div className="dashboard-card-2x2" onClick={() => handleCategoryClick('staff')}>
                                    <FaUserTie size={40} color="#1E3A5F" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ margin: '0 0 10px 0', color: '#1E3A5F', fontSize: '20px', fontWeight: 'bold' }}>Staff Management</h3>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Total Staff: {staff.length}</p>
                                </div>
                                <div className="dashboard-card-2x2" onClick={() => handleCategoryClick('user')}>
                                    <FaUsers size={40} color="#1E3A5F" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ margin: '0 0 10px 0', color: '#1E3A5F', fontSize: '20px', fontWeight: 'bold' }}>User Management</h3>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Total Users: {users.length}</p>
                                </div>
                                <div className="dashboard-card-2x2" onClick={() => setActiveSection("doctorRequests")}>
                                    <FaClipboardList size={40} color="#1E3A5F" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ margin: '0 0 10px 0', color: '#1E3A5F', fontSize: '20px', fontWeight: 'bold' }}>Doctor Registration Requests</h3>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Pending Requests: {requests.length}</p>
                                </div>
                                <div className="dashboard-card-2x2" onClick={() => handleCategoryClick('doctor')}>
                                    <FaStethoscope size={40} color="#1E3A5F" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ margin: '0 0 10px 0', color: '#1E3A5F', fontSize: '20px', fontWeight: 'bold' }}>Doctor Management</h3>
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Total Doctors: {doctors.length}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="registration-requests-section" style={{ marginTop: '2rem' }}>
                            <button
                                onClick={() => setActiveSection("dashboard")}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    backgroundColor: '#f8f9fa',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: '600'
                                }}
                            >
                                <span>←</span> Back to Dashboard
                            </button>
                            <h2 style={{ marginBottom: '1.5rem', color: '#1E3A5F', textAlign: 'left' }}>Doctor Registration Requests</h2>
                            <div className="requests-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '20px',
                                padding: '20px 0'
                            }}>
                                {isLoadingRequests ? (
                                    <p style={{ color: '#6b7280' }}>Loading requests...</p>
                                ) : requests.length > 0 ? (
                                    requests.map(request => (
                                        <div key={request.id} className="dashboard-card" style={{
                                            background: 'white',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                            transition: '0.3s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            border: '1px solid #f3f4f6'
                                        }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'; }}>
                                            <FaStethoscope size={40} color="#1E3A5F" style={{ marginBottom: '12px' }} />
                                            <h4 style={{ margin: '0 0 1rem 0', color: '#1E3A5F', fontSize: '1.2rem', fontWeight: 'bold' }}>{request.name}</h4>
                                            <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', width: '100%', textAlign: 'left', marginBottom: '1rem' }}>
                                                <p style={{ margin: '0.3rem 0', fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1E3A5F' }}>Email:</strong> {request.email}</p>
                                                <p style={{ margin: '0.3rem 0', fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1E3A5F' }}>SLMC ID:</strong> {request.slmc_id}</p>
                                                <p style={{ margin: '0.3rem 0', fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1E3A5F' }}>NIC:</strong> {request.nic}</p>
                                                <p style={{ margin: '0.3rem 0', fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1E3A5F' }}>Specialty:</strong> {request.specialization}</p>
                                                <p style={{ margin: '0.3rem 0', fontSize: '14px', color: '#4b5563' }}><strong style={{ color: '#1E3A5F' }}>Hospital:</strong> {request.hospital || 'Not Specified'}</p>
                                            </div>
                                            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', width: '100%' }}>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    style={{ flex: 1, backgroundColor: '#1E3A5F', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(30,58,95,0.2)' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2D4E7A'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1E3A5F'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(239,68,68,0.2)' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No pending doctor registration requests.</p>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    renderList()
                )}
            </main>

            <footer style={{ marginTop: 'auto', padding: '2rem 1rem 1rem', textAlign: 'center' }}>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '1rem', width: '100%' }} />
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>© 2026 NC+ Hospital. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AdminDashboard;
