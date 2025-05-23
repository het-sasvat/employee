import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, User, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const EmployeeIndex = ({ onRoleSet }) => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('getting');
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const intervalRef = useRef(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    
    if (storedUserId && storedUserName) {
      setUser({ _id: storedUserId, name: storedUserName });
      setShowLoginForm(false);
      startLocationTracking();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API_BASE_URL}/employee/login`, formData);
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('userId', userData._id);
        localStorage.setItem('userName', userData.name);
        onRoleSet('employee');
        setShowLoginForm(false);
        startLocationTracking();
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('There was a problem logging in. Please try again.');
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    });
  };

  const sendLocationToServer = async (locationData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/location`, {
        userId: user._id,
        ...locationData
      });
      
      if (response.data.success) {
        setLastUpdate(new Date());
        setLocationStatus('sent');
      }
    } catch (error) {
      console.error('Error sending location:', error);
      setLocationStatus('error');
    }
  };

  const updateLocation = async () => {
    try {
      setLocationStatus('getting');
      const locationData = await getCurrentLocation();
      setLocation(locationData);
      await sendLocationToServer(locationData);
    } catch (error) {
      console.error('Location error:', error);
      setLocationStatus('error');
    }
  };

  const startLocationTracking = () => {
    if (!isTracking && user) {
      setIsTracking(true);
      updateLocation(); // Get location immediately
      
      // Update location every minute
      intervalRef.current = setInterval(() => {
        updateLocation();
      }, 60000); // 60 seconds
    }
  };

  const stopLocationTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    stopLocationTracking();
    setUser(null);
    setLocation(null);
    setIsTracking(false);
    setShowLoginForm(true);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  };

  const getLocationStatusColor = () => {
    switch (locationStatus) {
      case 'sent': return 'text-green-600';
      case 'getting': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLocationStatusText = () => {
    switch (locationStatus) {
      case 'sent': return 'લોકેશન અપડેટ થયું';
      case 'getting': return 'લોકેશન મેળવી રહ્યાં છીએ...';
      case 'error': return 'લોકેશન અપડેટમાં સમસ્યા';
      default: return 'લોકેશન તૈયાર કરી રહ્યાં છીએ';
    }
  };

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 text-blue-600 mb-4">
              <User size={64} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Login</h1>
            <p className="text-gray-600 mt-2">Please enter your details.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
               Name*
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@company.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/admin-login" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">{user?.name}</h1>
                <p className="text-sm text-gray-500">Employee Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Location Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Location Status</h2>
              <div className={`p-2 rounded-full ${isTracking ? 'bg-green-100' : 'bg-gray-100'}`}>
                <MapPin className={isTracking ? 'text-green-600' : 'text-gray-400'} size={24} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tracking Status:</span>
                <span className={`font-medium ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
                  {isTracking ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location Status:</span>
                <span className={`font-medium ${getLocationStatusColor()}`}>
                  {getLocationStatusText()}
                </span>
              </div>

              {location && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Current Location</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Latitude: {location.latitude.toFixed(6)}</p>
                    <p>Longitude: {location.longitude.toFixed(6)}</p>
                    <p>Accuracy: ±{Math.round(location.accuracy)}m</p>
                  </div>
                </div>
              )}

              {lastUpdate && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={16} className="mr-2" />
                  Last updated: {lastUpdate.toLocaleTimeString('en-IN')}
                </div>
              )}

              <div className="flex space-x-3">
                {!isTracking ? (
                  <button
                    onClick={startLocationTracking}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Start Tracking
                  </button>
                ) : (
                  <button
                    onClick={stopLocationTracking}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Stop Tracking
                  </button>
                )}
                <button
                  onClick={updateLocation}
                  disabled={locationStatus === 'getting'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Update Now
                </button>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <AlertCircle className="text-blue-600" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">આવશ્યક માહિતી</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• કામના સમય દરમિયાન location tracking ચાલુ રાખો</li>
                  <li>• દર મિનિટે તમારું location automatic update થશે</li>
                  <li>• Internet connection જરૂરી છે</li>
                  <li>• Location permission હંમેશા ચાલુ રાખો</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">સુરક્ષા</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• તમારી location માત્ર કંપની માટે સાચવવામાં આવે છે</li>
                  <li>• કોઈ વ્યક્તિગત માહિતી શેર નહીં થાય</li>
                  <li>• માત્ર કામના હેતુ માટે ઉપયોગ થશે</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Status Indicators</h3>
                <div className="text-sm text-green-800 space-y-2">
                  <div className="flex items-center">
                    <CheckCircle size={16} className="text-green-600 mr-2" />
                    <span>Green: Location successfully updated</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="text-blue-600 mr-2" />
                    <span>Blue: Getting location...</span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle size={16} className="text-red-600 mr-2" />
                    <span>Red: Error updating location</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-update Notice */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-lg font-medium text-gray-900">Live Location Tracking</span>
            </div>
            <p className="text-gray-600">
              આ વેબસાઇટ દર મિનિટે આપોઆપ તમારું location update કરે છે.
              <br />
              કૃપા કરીને બ્રાઉઝર tab બંધ ન કરો અને internet connection ચાલુ રાખો.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIndex;