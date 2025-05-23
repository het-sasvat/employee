# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
 



 # Employee Location Tracking System

A comprehensive web application for tracking employee locations in real-time built with React, Vite, Tailwind CSS, Node.js, and MongoDB Atlas.

## Features

- **Location Permission Request**: Automatically requests location permission when website is accessed
- **Employee Dashboard**: Clean interface showing current tracking status and location updates
- **Admin Dashboard**: Real-time view of all employee locations with auto-refresh
- **Live Tracking**: Location updates every minute automatically
- **Responsive Design**: Works on desktop and mobile devices
- **Gujarati Support**: Interface includes Gujarati text for better user experience

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

```
employee-location-tracker/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── LocationPermission.jsx
│   │   ├── pages/
│   │   │   ├── EmployeeIndex.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account

### 1. Clone and Setup Project Structure

```bash
# Create main project directory
mkdir employee-location-tracker
cd employee-location-tracker
```

### 2. Backend Setup

```bash
# Create and setup backend
mkdir backend
cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon

# Create server.js file (copy from provided code)
# Create .env file with your MongoDB credentials
```

#### Backend .env Configuration

Create `.env` file in backend folder:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/employee-tracker?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup

```bash
# From project root directory
npm create vite@latest frontend -- --template react
cd frontend

# Install dependencies
npm install
npm install axios react-router-dom lucide-react

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Frontend Configuration

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user with read/write permissions
4. Get connection string and add to `.env` file
5. Whitelist your IP address or use 0.0.0.0/0 for development

### 5. Running the Application

#### Start Backend Server

```bash
# In backend directory
npm run dev
# or
npm start
```

Backend will run on `http://localhost:5000`

#### Start Frontend Development Server

```bash
# In frontend directory
npm run dev
```

Frontend will run on `http://localhost:3000`

## Usage

### For Employees

1. Visit `http://localhost:3000`
2. Allow location permission when prompted
3. Enter name and email to login
4. Location will be tracked automatically every minute
5. Dashboard shows current status and last update time

### For Admin

1. Visit `http://localhost:3000/admin-login`
2. Use default credentials:
   - **Email**: admin@company.com
   - **Password**: admin123
3. View real-time employee locations
4. Auto-refresh every 30 seconds
5. Click "View on Map" to open location in Google Maps

## API Endpoints

### Employee Endpoints

- `POST /api/employee/login` - Employee login/registration
- `POST /api/location` - Save employee location

### Admin Endpoints

- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/employees` - Get all employees with latest locations
- `GET /api/admin/live-locations` - Get recent employee locations
- `GET /api/admin/employee/:id/locations` - Get location history for specific employee

## Key Features Explained

### Location Tracking

- Requests high-accuracy GPS location
- Updates every 60 seconds automatically
- Stores latitude, longitude, and accuracy
- Shows online/offline status based on last update time

### Admin Dashboard

- Real-time employee location monitoring
- Auto-refresh functionality
- Color-coded status indicators:
  - 🟢 **Green**: Online (< 2 minutes ago)
  - 🟡 **Yellow**: Recent (2-10 minutes ago)
  - 🔴 **Red**: Offline (> 10 minutes ago)

### Security Features

- Location data stored securely in MongoDB
- Admin authentication required
- Employee data protected
- CORS enabled for cross-origin requests

## Customization

### Changing Update Intervals

```javascript
// In EmployeeIndex.jsx - Change location update interval
intervalRef.current = setInterval(() => {
  updateLocation();
}, 60000); // Change 60000 to desired milliseconds

// In AdminDashboard.jsx - Change auto-refresh interval
interval = setInterval(() => {
  fetchLiveLocations();
}, 30000); // Change 30000 to desired milliseconds
```

### Admin Credentials

Update admin credentials in `backend/server.js`:

```javascript
// In admin login endpoint
if (email === 'your-admin@company.com' && password === 'your-secure-password') {
  res.json({ success: true, role: 'admin' });
}
```

### Styling

- All styles use Tailwind CSS
- Modify colors and design in component files
- Add custom CSS in `frontend/src/index.css`

## Production Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Update CORS origins for production domains
3. Use stronger JWT secrets
4. Enable MongoDB Atlas IP whitelisting

### Frontend Deployment

1. Update API base URL in components
2. Build the project: `npm run build`
3. Deploy dist folder to your hosting service

## Troubleshooting

### Common Issues

1. **Location not updating**: Check browser permissions and internet connection
2. **MongoDB connection error**: Verify connection string and IP whitelist
3. **CORS errors**: Ensure backend CORS is configured for frontend URL
4. **Admin login fails**: Check credentials in server.js

### Browser Permissions

- Location permission must be granted
- Works best on HTTPS in production
- Some browsers may block location on HTTP

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify MongoDB Atlas connection
4. Ensure all dependencies are installed correctly


