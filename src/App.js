
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
import CreateSchedule from './page/CreateSchedule';
import ManageSchedules from './page/ManageSchedules';
import ScheduleList from './page/ScheduleList';
import AppointmentForm from './page/AppointmentForm';

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
          <Route path="/schedules/create" element={<CreateSchedule />} />
          <Route path="/schedules/manage" element={<ManageSchedules />} />
          <Route path="/schedules" element={<ScheduleList />} />
          <Route path="/appointments/new/:schedule_id/:doctor_id" element={<AppointmentForm />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
