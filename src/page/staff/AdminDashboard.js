import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/StaffDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // Category and List State
    const [selectedCategory, setSelectedCategory] = useState(null); // 'user', 'staff', 'doctor'
    const [expandedId, setExpandedId] = useState(null);

    // Staff Form State
    const [staffFormData, setStaffFormData] = useState({ name: '', email: '', phone: '', role: '' });
    const [editingStaffId, setEditingStaffId] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [requests, setRequests] = useState([
        { id: 1, name: 'Dr. John Doe', email: 'john@example.com', specialization: 'Cardiology', slmc: 'SLMC/12345' },
        { id: 2, name: 'Dr. Jane Smith', email: 'jane@example.com', specialization: 'Pediatrics', slmc: 'SLMC/67890' },
        { id: 3, name: 'Dr. Mike Ross', email: 'mike@example.com', specialization: 'Neurology', slmc: 'SLMC/11223' }
    ]);

    const [users, setUsers] = useState([
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '0771234567', role: 'Patient', details: 'Registered since Jan 2024' },
        { id: 2, name: 'Bob Williams', email: 'bob@example.com', phone: '0719876543', role: 'Patient', details: 'History of appointments' },
        { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', phone: '0754433221', role: 'Patient', details: 'Subscribed to newsletter' }
    ]);

    const [staff, setStaff] = useState([
        { id: 1, name: 'Dave Miller', email: 'dave@example.com', phone: '0781122334', role: 'Receptionist', details: 'Morning shift' },
        { id: 2, name: 'Eve Wilson', email: 'eve@example.com', phone: '0722233445', role: 'Nurse', details: 'Emergency ward' },
        { id: 3, name: 'Frank Moore', email: 'frank@example.com', phone: '0766655443', role: 'Manager', details: 'General admin' }
    ]);

    const [doctors, setDoctors] = useState([
        { id: 1, name: 'Dr. Smith', email: 'smith@example.com', phone: '0701122334', role: 'Doctor', details: 'Specialist Surgeon' },
        { id: 2, name: 'Dr. Jones', email: 'jones@example.com', phone: '0712233445', role: 'Doctor', details: 'General Physician' },
        { id: 3, name: 'Dr. Brown', email: 'brown@example.com', phone: '0773344556', role: 'Doctor', details: 'Consultant' }
    ]);

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

    const handleDeleteRecord = (id) => {
        if (selectedCategory === 'user') setUsers(users.filter(item => item.id !== id));
        if (selectedCategory === 'staff') {
            setStaff(staff.filter(item => item.id !== id));
            alert("Staff Deleted Successfully");
            return;
        }
        if (selectedCategory === 'doctor') setDoctors(doctors.filter(item => item.id !== id));
        alert("Record Deleted Successfully");
    };

    const handleStaffFormChange = (e) => {
        setStaffFormData({ ...staffFormData, [e.target.name]: e.target.value });
        // Clear error for the field being changed
        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: false });
        }
    };

    const handleAddOrUpdateStaff = (e) => {
        e.preventDefault();

        // Strict Validation
        const errors = {
            name: !staffFormData.name,
            email: !staffFormData.email,
            phone: !staffFormData.phone,
            role: !staffFormData.role
        };

        if (errors.name || errors.email || errors.phone || errors.role) {
            setFormErrors(errors);
            alert("Please fill all required fields");
            return;
        }

        setFormErrors({});

        if (editingStaffId) {
            setStaff(staff.map(s => s.id === editingStaffId ? { ...staffFormData, id: editingStaffId, details: s.details } : s));
            alert("Staff Updated Successfully");
            setEditingStaffId(null);
        } else {
            const newStaff = {
                ...staffFormData,
                id: Date.now(),
                details: 'Newly added staff member'
            };
            setStaff([...staff, newStaff]);
            alert("Staff Added Successfully");
        }
        setStaffFormData({ name: '', email: '', phone: '', role: '' });
        setFormErrors({});
    };

    const handleEditStaff = (member) => {
        setStaffFormData({
            name: member.name,
            email: member.email,
            phone: member.phone,
            role: member.role
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
                        setStaffFormData({ name: '', email: '', phone: '', role: '' });
                        setFormErrors({});
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
                                <div>
                                    <select
                                        name="role"
                                        value={staffFormData.role}
                                        onChange={handleStaffFormChange}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: formErrors.role ? '1px solid #dc3545' : '1px solid #ccc', backgroundColor: 'white' }}
                                    >
                                        <option value="" disabled>Select Role</option>
                                        <option value="Receptionist">Receptionist</option>
                                        <option value="Nurse">Nurse</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Doctor">Doctor</option>
                                        <option value="Pharmacist">Pharmacist</option>
                                        <option value="Lab Assistant">Lab Assistant</option>
                                    </select>
                                    {formErrors.role && <p style={{ color: '#dc3545', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>Role is required</p>}
                                </div>
                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                                    <button type="submit" style={{ flex: 1, backgroundColor: editingStaffId ? '#0b154eff' : '#0b154eff', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        {editingStaffId ? 'Update Staff' : 'Add Staff'}
                                    </button>
                                    {editingStaffId && (
                                        <button type="button" onClick={() => { setEditingStaffId(null); setStaffFormData({ name: '', email: '', phone: '', role: '' }); setFormErrors({}); }} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '4px', cursor: 'pointer' }}>
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
                                                    <button onClick={() => handleEditStaff(item)} style={{ backgroundColor: '#0b154eff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteRecord(item.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleToggleInfo(item.id)} style={{ backgroundColor: '#0b154eff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                        {expandedId === item.id ? 'Hide Details' : 'View Info'}
                                                    </button>
                                                    <button onClick={() => handleDeleteRecord(item.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {expandedId === item.id && (
                                        <div style={{ marginTop: '1.2rem', padding: '1.2rem', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '0.95rem', borderLeft: '4px solid #0b154eff' }}>
                                            <p style={{ margin: '0.4rem 0' }}><strong>Email:</strong> {item.email}</p>
                                            <p style={{ margin: '0.4rem 0' }}><strong>Phone:</strong> {item.phone}</p>
                                            <p style={{ margin: '0.4rem 0' }}><strong>Role:</strong> {item.role}</p>
                                            <p style={{ margin: '0.4rem 0' }}><strong>Details:</strong> {item.details}</p>
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
                                                    style={{ backgroundColor: '#0b154eff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
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
