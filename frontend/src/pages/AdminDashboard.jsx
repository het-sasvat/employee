import { useState, useEffect } from 'react';
import { MapPin, Users, Clock, LogOut, RefreshCw, Map, List } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = ({ onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLiveLocations();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEmployees(),
        fetchLiveLocations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/employees`);
      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchLiveLocations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/live-locations`);
      if (response.data.success) {
        setLiveLocations(response.data.locations);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error fetching live locations:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getLocationStatus = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes <= 2) return { status: 'online', color: 'text-green-600 bg-green-100' };
    if (diffInMinutes <= 10) return { status: 'recent', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'offline', color: 'text-red-600 bg-red-100' };
  };

  const openInMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Employee Location Tracking</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-8">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={20} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Map size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-2 text-sm rounded-lg ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={fetchLiveLocations}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <MapPin className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">
                  {liveLocations.filter(loc => {
                    const diffInMinutes = Math.floor((new Date() - new Date(loc.latestLocation.timestamp)) / (1000 * 60));
                    return diffInMinutes <= 2;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {liveLocations.filter(loc => {
                    const diffInMinutes = Math.floor((new Date() - new Date(loc.latestLocation.timestamp)) / (1000 * 60));
                    return diffInMinutes <= 10;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <RefreshCw className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Refresh</p>
                <p className="text-sm font-bold text-gray-900">
                  {lastRefresh ? formatTimeAgo(lastRefresh) : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Live Employee Locations</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time tracking of all employees</p>
          </div>

          <div className="divide-y divide-gray-200">
            {liveLocations.length === 0 ? (
              <div className="p-8 text-center">
                <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Locations</h3>
                <p className="text-gray-500">No employees are currently sharing their location.</p>
              </div>
            ) : (
              liveLocations.map((item) => {
                const location = item.latestLocation;
                const user = item.user;
                const status = getLocationStatus(location.timestamp);
                
                return (
                  <div key={user._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                              {status.status === 'online' ? 'Online' : 
                               status.status === 'recent' ? 'Recent' : 'Offline'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTimeAgo(location.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-2">
                          <p>Lat: {location.latitude.toFixed(6)}</p>
                          <p>Lng: {location.longitude.toFixed(6)}</p>
                          <p className="text-xs">±{Math.round(location.accuracy)}m</p>
                        </div>
                        
                        <button
                          onClick={() => openInMaps(location.latitude, location.longitude)}
                          className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          <MapPin size={14} className="mr-1" />
                          View on Map
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* All Employees List */}
        {employees.length > liveLocations.length && (
          <div className="mt-8 bg-white rounded-xl shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Employees</h2>
              <p className="text-sm text-gray-500 mt-1">Complete employee directory</p>
            </div>

            <div className="divide-y divide-gray-200">
              {employees.map((employee) => {
                const hasLiveLocation = liveLocations.some(loc => loc.user._id === employee._id);
                
                if (hasLiveLocation) return null; // Skip if already shown in live locations
                
                return (
                  <div key={employee._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                          <span className="px-2 py-1 text-xs font-medium rounded-full text-gray-500 bg-gray-100 mt-1">
                            No recent location
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Last seen: {employee.latestLocation ? 
                            formatTimeAgo(employee.latestLocation.timestamp) : 
                            'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;