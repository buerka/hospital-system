import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Experts from './pages/Experts'; // 你的专家页
import Overview from './pages/dashboard/Overview';
import Bookings from './pages/dashboard/Bookings';
import Payment from './pages/dashboard/Payment';
import PaymentHistory from './pages/dashboard/PaymentHistory';
import Record from './pages/dashboard/Record';
import Doctor from './pages/dashboard/Doctor';
import Storehouse from './pages/dashboard/Storehouse';
import Users from './pages/dashboard/Users';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* 👇👇👇 这个就是我帮你加回来的关键路由 👇👇👇 */}
        <Route path="/experts" element={<Experts />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="overview" element={<Overview />} />
          <Route path="record" element={<Record />} />
          <Route path="bookings" element={<ProtectedRoute allowedRoles={['registration', 'org_admin', 'global_admin', 'general_user']}><Bookings /></ProtectedRoute>} />
          <Route path="doctor" element={<ProtectedRoute allowedRoles={['doctor', 'global_admin']}><Doctor /></ProtectedRoute>} />
          <Route path="payment" element={<ProtectedRoute allowedRoles={['finance', 'org_admin', 'global_admin', 'general_user']}><Payment /></ProtectedRoute>} />
          <Route path="payment-history" element={<ProtectedRoute allowedRoles={['finance', 'org_admin', 'global_admin']}><PaymentHistory /></ProtectedRoute>} />
          <Route path="storehouse" element={<ProtectedRoute allowedRoles={['storekeeper', 'org_admin', 'global_admin']}><Storehouse /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['org_admin', 'global_admin']}><Users /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;