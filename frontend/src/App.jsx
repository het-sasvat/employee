import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeIndex from './pages/EmployeeIndex';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import LocationPermission from './components/LocationPermission';

function App() {
  const [locationPermission, setLocationPermission] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user has already granted location permission
    const checkLocationPermission = async () => {
      if ('geolocation' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          setLocationPermission(permission.state);
          
          // Listen for permission changes
          permission.onchange = () => {
            setLocationPermission(permission.state);
          };
        } catch (error) {
          console.log('Permission API not supported');
          setLocationPermission('prompt');
        }
      } else {
        console.log('Geolocation not supported');
        setLocationPermission('denied');
      }
    };

    checkLocationPermission();
    
    // Check if user is already logged in
    const role = localStorage.getItem('userRole');
    if (role) {
      setUserRole(role);
    }
  }, []);

  const handleLocationPermissionGranted = () => {
    setLocationPermission('granted');
  };

  const handleRoleSet = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  };

  // Show location permission request if not granted
  if (locationPermission !== 'granted') {
    return (
      <LocationPermission 
        permission={locationPermission}
        onPermissionGranted={handleLocationPermissionGranted}
      />
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/" 
            element={
              userRole === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <EmployeeIndex onRoleSet={handleRoleSet} />
              )
            } 
          />
          <Route 
            path="/admin-login" 
            element={
              userRole === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <AdminLogin onRoleSet={handleRoleSet} />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              userRole === 'admin' ? (
                <AdminDashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/admin-login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;