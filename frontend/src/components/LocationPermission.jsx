import { useState } from 'react';
import { MapPin, Shield, AlertCircle } from 'lucide-react';

const LocationPermission = ({ permission, onPermissionGranted }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');

  const requestLocation = async () => {
    setIsRequesting(true);
    setError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      console.log('Location granted:', position);
      onPermissionGranted();
    } catch (error) {
      console.error('Location error:', error);
      setError('Please grant location permission and try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'text-green-600', icon: Shield, message: 'Location access granted' };
      case 'denied':
        return { color: 'text-red-600', icon: AlertCircle, message: 'Location access denied' };
      default:
        return { color: 'text-blue-600', icon: MapPin, message: 'Location access required' };
    }
  };

  const status = getPermissionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center">
          <div className={`mx-auto w-16 h-16 ${status.color} mb-6`}>
            <status.icon size={64} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Employee Location Tracker
          </h1>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              permission === 'denied' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`${status.color} font-medium mb-2`}>
                {status.message}
              </p>
              
              {permission === 'denied' ? (
                <div className="text-sm text-gray-600">
                  <p className="mb-2">This website needs permission to track your location.</p>
                  <p className="font-medium">Please:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Open settings in browser</li>
                    <li>Location permission આપો</li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                 According to company policy, it is necessary to track your location during work.
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {permission !== 'denied' && (
              <button
                onClick={requestLocation}
                disabled={isRequesting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {isRequesting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                   Getting location...
                  </div>
                ) : (
                  'લોકેશન પરમિશન આપો'
                )}
              </button>
            )}

            <div className="text-xs text-gray-500 text-center">
              <p>This website stores your location for operational purposes only</p>
              <p>Your privacy is protected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPermission;