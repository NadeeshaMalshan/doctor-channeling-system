
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Landing from './page/landing';
import ECare from './page/eCare';
import Login from './page/Login';
import Signup from './page/Signup';
import DoctorSignup from './page/DoctorSignup';
import StaffLogin from './page/StaffLogin';
import AdminDashboard from './page/staff/AdminDashboard';
import CashierDashboard from './page/staff/CashierDashboard';
import HRDashboard from './page/staff/HRDashboard';
import BookingManagerDashboard from './page/staff/BookingManagerDashboard';

function App() {
  return (
    <>

      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/eCare" element={<ECare />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/ecare/doc-signup" element={<DoctorSignup />} />
          <Route path="/ecare/staff-login" element={<StaffLogin />} />
          <Route path="/ecare/staff/admin" element={<AdminDashboard />} />
          <Route path="/ecare/staff/cashier" element={<CashierDashboard />} />
          <Route path="/ecare/staff/hr" element={<HRDashboard />} />
          <Route path="/ecare/staff/booking" element={<BookingManagerDashboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
