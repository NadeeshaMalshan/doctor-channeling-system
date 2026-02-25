import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/StaffDashboard.css';

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
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);

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

    const [requests, setRequests] = useState([
        { id: 1, name: 'Dr. John Doe', email: 'john@example.com', specialization: 'Cardiology', slmc: 'SLMC/12345' },
        { id: 2, name: 'Dr. Jane Smith', email: 'jane@example.com', specialization: 'Pediatrics', slmc: 'SLMC/67890' },
        { id: 3, name: 'Dr. Mike Ross', email: 'mike@example.com', specialization: 'Neurology', slmc: 'SLMC/11223' }
    ]);

    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Removed dummy staff data

    const [doctors, setDoctors] = useState([]);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Fetch staff from backend
    const fetchStaff = async () => {
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
    };

    // Fetch users from backend
    const fetchUsers = async () => {
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
    };

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
    }, [selectedCategory, API_URL]);

    const handleLogout = () => {
        navigate('/ecare/staff-login');
    };

    const handleApprove = (id) => {
        alert("Doctor Approved Successfully");
        setRequests(requests.filter(req => req.id !== id));
    };

    const handleReject = (id) => {
        alert("Doctor Rejected");
        setRequests(requests.filter(req => req.id !== id));
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
                    <h2 style={{ color: '#1a3464ff', marginBottom: '2rem', marginTop: 0 }}>{title}</h2>

                    {selectedCategory === 'staff' && (
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>{editingStaffId ? 'Update Staff Member' : 'Add New Staff Member'}</h3>
                            <form onSubmit={handleAddOrUpdateStaff} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input type="text" name="name" placeholder="Name" value={staffFormData.name} onChange={handleStaffFormChange} style={{ padding: '0.6rem', borderRadius: '4px', border: formErrors.name ? '1px solid #dc3545' : '1px solid #ccc' }} />
                                <input type="email" name="email" placeholder="Email" value={staffFormData.email} onChange={handleStaffFormChange} style={{ padding: '0.6rem', borderRadius: '4px', border: formErrors.email ? '1px solid #dc3545' : '1px solid #ccc' }} />
                                <input type="text" name="phone" placeholder="Phone" value={staffFormData.phone} onChange={handleStaffFormChange} style={{ padding: '0.6rem', borderRadius: '4px', border: formErrors.phone ? '1px solid #dc3545' : '1px solid #ccc' }} />
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showStaffPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={staffFormData.password}
                                        onChange={handleStaffFormChange}
                                        style={{ padding: '0.6rem', borderRadius: '4px', border: formErrors.password ? '1px solid #dc3545' : '1px solid #ccc', width: '100%', paddingRight: '3.5rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                                        style={{ position: 'absolute', right: '5px', background: 'none', border: 'none', color: '#4CA1AF', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        {showStaffPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <div>
                                    <select
                                        name="role"
                                        value={staffFormData.role}
                                        onChange={handleStaffFormChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem 1rem',
                                            borderRadius: '8px',
                                            border: formErrors.role ? '2px solid #dc3545' : '1px solid #ced4da',
                                            backgroundColor: 'white',
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.border = '2px solid #4CA1AF'}
                                        onBlur={(e) => e.target.style.border = formErrors.role ? '2px solid #dc3545' : '1px solid #ced4da'}
                                    >
                                        <option value="" disabled style={{ color: '#999', padding: '10px' }}>Select Role</option>
                                        <option value="Admin" style={{ padding: '10px' }}>Admin</option>
                                        <option value="Cashier" style={{ padding: '10px' }}>Cashier</option>
                                        <option value="Booking Manager" style={{ padding: '10px' }}>Booking Manager</option>
                                        <option value="HR" style={{ padding: '10px' }}>HR</option>
                                    </select>
                                    {formErrors.role && <p style={{ color: '#dc3545', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>Role is required</p>}
                                </div>
                                <div>
                                    <select
                                        name="account_status"
                                        value={staffFormData.account_status}
                                        onChange={handleStaffFormChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem 1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #ced4da',
                                            backgroundColor: 'white',
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => e.target.style.border = '2px solid #4CA1AF'}
                                        onBlur={(e) => e.target.style.border = '1px solid #ced4da'}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="submit"
                                        style={{ flex: 1, background: 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }}
                                        onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        {editingStaffId ? 'Update Staff' : 'Add Staff'}
                                    </button>
                                    {editingStaffId && (
                                        <button type="button" onClick={() => { setEditingStaffId(null); setStaffFormData({ name: '', email: '', phone: '', role: '', password: '' }); setFormErrors({}); setShowStaffPassword(false); }} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '4px', cursor: 'pointer' }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {currentList.length > 0 ? (
                            currentList.map(item => (
                                <div key={item.id} style={{ border: '1px solid #eee', padding: '1.2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h4>
                                            <p style={{ margin: '0.2rem 0', color: '#666', fontSize: '0.9rem' }}>{item.role}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {selectedCategory === 'staff' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleEditStaff(item)}
                                                        style={{ background: 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s ease' }}
                                                        onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRecord(item.id)}
                                                        style={{
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            fontWeight: '500',
                                                            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#dc2626';
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#ef4444';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.3)';
                                                        }}
                                                        onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#991b1b'}
                                                        onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleInfo(item.id)}
                                                        style={{ background: 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s ease' }}
                                                        onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                    >
                                                        {expandedId === item.id ? 'Hide Details' : 'View Info'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRecord(item.id)}
                                                        style={{
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            fontWeight: '500',
                                                            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#dc2626';
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#ef4444';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.3)';
                                                        }}
                                                        onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#991b1b'}
                                                        onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {expandedId === item.id && (
                                        <div style={{ marginTop: '1.2rem', padding: '1.2rem', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '0.95rem', borderLeft: '4px solid #0b154eff' }}>
                                            <p style={{ margin: '0.4rem 0' }}><strong>Name:</strong> {item.name}</p>
                                            {selectedCategory === 'doctor' ? (
                                                <>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>Specialization:</strong> {item.specialization}</p>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>SLMC Number:</strong> {item.slmc_no}</p>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>NIC:</strong> {item.nic}</p>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>Email:</strong> {item.email}</p>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>Phone:</strong> {item.phone}</p>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>Hospital:</strong> {item.hospital || 'Not Specified'}</p>
                                                </>
                                            ) : selectedCategory === 'user' ? (
                                                <>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>Email:</strong> {item.email}</p>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>Phone:</strong> {item.phone}</p>
                                                    <p style={{ margin: '0.4rem 0' }}><strong>NIC:</strong> {item.nic}</p>
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ))
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
            <header className="dashboard-header">
                <h1>
                    <span>🛡️</span> Admin dashboard
                </h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </header>

            <main className="dashboard-content">
                {!selectedCategory ? (
                    <>
                        <div className="dashboard-welcome-card">
                            <h2>Welcome, Administrator</h2>
                            <p>Manage system users and view system-wide reports.</p>
                        </div>

                        <div className="registration-requests-section" style={{
                            marginTop: '2rem',
                            padding: '1.5rem',
                            border: '1px solid #ced4da',
                            borderRadius: '10px',
                            backgroundColor: '#fff'
                        }}>
                            <h2 style={{ marginBottom: '1.5rem', color: '#1a3464ff', textAlign: 'left' }}>Doctor Registration Requests</h2>
                            <div className="requests-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1.5rem',
                                justifyContent: 'start'
                            }}>
                                {requests.length > 0 ? (
                                    requests.map(request => (
                                        <div key={request.id} className="dashboard-card" style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{request.name}</h4>
                                            <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Email:</strong> {request.email}</p>
                                            <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Specialization:</strong> {request.specialization}</p>
                                            <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>SLMC Number:</strong> {request.slmc}</p>
                                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    style={{ background: 'linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', flex: 1, fontWeight: '500', transition: 'all 0.3s ease' }}
                                                    onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    style={{
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        flex: 1,
                                                        transition: 'all 0.3s ease',
                                                        fontWeight: '500',
                                                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#dc2626';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#ef4444';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.3)';
                                                    }}
                                                    onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#991b1b'}
                                                    onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
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

                        <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
                            <div className="dashboard-card" onClick={() => handleCategoryClick('staff')} style={{ cursor: 'pointer' }}>
                                <h3>Staff Management</h3>
                                <p>Add, edit, or remove staff accounts</p>
                            </div>
                            <div className="dashboard-card" onClick={() => handleCategoryClick('user')} style={{ cursor: 'pointer' }}>
                                <h3>User Management</h3>
                                <p>Add, edit, or remove users accounts</p>
                            </div>
                            <div className="dashboard-card" onClick={() => handleCategoryClick('doctor')} style={{ cursor: 'pointer' }}>
                                <h3>Doctor Management</h3>
                                <p>Add, edit, or remove doctor accounts</p>
                            </div>
                        </div>
                    </>
                ) : (
                    renderList()
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
