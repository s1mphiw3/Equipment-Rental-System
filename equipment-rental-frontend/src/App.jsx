import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Equipment from './pages/Equipment';
import EquipmentDetails from './pages/EquipmentDetails';
import Rentals from './pages/Rentals';
import RentalDetails from './pages/RentalDetails';
import RentalCheckout from './pages/RentalCheckout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import AdminEquipmentManagement from './pages/AdminEquipmentManagement';
import AdminEquipmentCreate from './pages/AdminEquipmentCreate';
import AdminEquipmentEdit from './pages/AdminEquipmentEdit';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminRentalManagement from './pages/AdminRentalManagement';
import AdminDamageReports from './pages/AdminDamageReports';
import AdminDamageReportDetails from './pages/AdminDamageReportDetails';
import AdminDamageStatistics from './pages/AdminDamageStatistics';
import AdminMaintenanceManagement from './pages/AdminMaintenanceManagement';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/equipment/:id" element={<EquipmentDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Protected Routes */}
              <Route path="/rentals" element={
                <ProtectedRoute>
                  <Rentals />
                </ProtectedRoute>
              } />
              <Route path="/rentals/:id" element={
                <ProtectedRoute>
                  <RentalDetails />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <RentalCheckout />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/equipment" element={
                <ProtectedRoute>
                  <AdminEquipmentManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/equipment/create" element={
                <ProtectedRoute>
                  <AdminEquipmentCreate />
                </ProtectedRoute>
              } />
              <Route path="/admin/equipment/:id/edit" element={
                <ProtectedRoute>
                  <AdminEquipmentEdit />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <AdminUserManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/rentals" element={
                <ProtectedRoute>
                  <AdminRentalManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/rentals/:id" element={
                <ProtectedRoute>
                  <RentalDetails />
                </ProtectedRoute>
              } />
              <Route path="/admin/damage-reports" element={
                <ProtectedRoute>
                  <AdminDamageReports />
                </ProtectedRoute>
              } />
              <Route path="/admin/damage-reports/:id" element={
                <ProtectedRoute>
                  <AdminDamageReportDetails />
                </ProtectedRoute>
              } />
              <Route path="/admin/damage-reports/statistics" element={
                <ProtectedRoute>
                  <AdminDamageStatistics />
                </ProtectedRoute>
              } />
              <Route path="/admin/maintenance" element={
                <ProtectedRoute>
                  <AdminMaintenanceManagement />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;