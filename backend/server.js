const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

// Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy: { type: Number },
  timestamp: { type: Date, default: Date.now },
  address: { type: String }
});

const User = mongoose.model('User', userSchema);
const Location = mongoose.model('Location', locationSchema);

// Routes

// Get or create employee by name/email
app.post('/api/employee/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, role: 'employee' });
      await user.save();
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save employee location
app.post('/api/location', async (req, res) => {
  try {
    const { userId, latitude, longitude, accuracy, address } = req.body;
    
    const location = new Location({
      userId,
      latitude,
      longitude,
      accuracy,
      address
    });
    
    await location.save();
    res.json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all employees with their latest locations (Admin only)
app.get('/api/admin/employees', async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' });
    const employeesWithLocations = [];
    
    for (let employee of employees) {
      const latestLocation = await Location.findOne({ userId: employee._id })
        .sort({ timestamp: -1 });
      
      employeesWithLocations.push({
        ...employee.toObject(),
        latestLocation
      });
    }
    
    res.json({ success: true, employees: employeesWithLocations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get employee location history
app.get('/api/admin/employee/:id/locations', async (req, res) => {
  try {
    const { id } = req.params;
    const locations = await Location.find({ userId: id })
      .sort({ timestamp: -1 })
      .limit(100); // Last 100 locations
    
    res.json({ success: true, locations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple admin check - you can enhance this with proper authentication
    if (email === 'admin@company.com' && password === 'admin123') {
      res.json({ success: true, role: 'admin' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get live locations (real-time endpoint)
app.get('/api/admin/live-locations', async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentLocations = await Location.aggregate([
      {
        $match: {
          timestamp: { $gte: fiveMinutesAgo }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$userId',
          latestLocation: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]);
    
    res.json({ success: true, locations: recentLocations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});