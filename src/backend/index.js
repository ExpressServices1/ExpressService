import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import adminAuthRouter, { adminAuthMiddleware } from './admin-auth.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://expresseaseservice.xyz"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Supabase connection setup
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false, // Set to console.log to see SQL queries
});

// Package model definition
const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  isMoving: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'false',
    field: 'is_moving'
  },
  currentLocation: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'current_location'
  },
  route: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  currentRouteIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'current_route_index'
  },
  currentSubPosition: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    field: 'current_sub_position'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'fadmin'
  },
  moveRatio: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.1
  }
}, {
  tableName: 'packages',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});


// Track active socket connections for each package
const activeTrackingSockets = new Map(); // Map<code, Set<socketId>>

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (use { force: false } for production)
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

app.use(cors({
  origin: [
    "https://expresseaseservice.xyz"
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
app.use('/api', adminAuthRouter);

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Helper functions
const findCurrentRouteIndex = (currentLocation, route) => {
  let minDistance = Number.MAX_VALUE;
  let closestIndex = 0;
  for (let i = 0; i < route.length; i++) {
    const distance = Math.sqrt(
      Math.pow(currentLocation.lat - route[i].lat, 2) +
      Math.pow(currentLocation.lng - route[i].lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  return closestIndex;
};

const updatePackageLocation = async (code, newLocation, routeIndex, subPosition) => {
  try {
    await Package.update({
      currentLocation: newLocation,
      currentRouteIndex: routeIndex,
      currentSubPosition: subPosition
    }, {
      where: { code }
    });
    // console.log(`💾 Updated ${code} location:`, newLocation, `Route: ${routeIndex}`);
  } catch (error) {
    console.error('Error updating package location:', error);
  }
};

// --- BACKGROUND SHIP MOVEMENT WITH SOCKET EMISSIONS ---
setInterval(async () => {
  try {
    const packages = await Package.findAll({
      where: {
        isMoving: 'true'
      }
    });

    const updates = [];

    for (const pkg of packages) {
      if (!pkg.route || pkg.route.length < 2) continue;

      let currentRouteIndex = typeof pkg.currentRouteIndex === 'number'
        ? pkg.currentRouteIndex
        : findCurrentRouteIndex(pkg.currentLocation, pkg.route);

      const totalPoints = pkg.route.length;
      const currentPoint = pkg.route[currentRouteIndex];
      const nextPoint = pkg.route[Math.min(currentRouteIndex + 1, totalPoints - 1)];
      const latDiff = nextPoint.lat - currentPoint.lat;
      const lngDiff = nextPoint.lng - currentPoint.lng;
      // const moveRatio = 0.1;
      const moveRatio = 0.0008680555555555555;

      let currentSubPosition = pkg.currentSubPosition || 0;
      currentSubPosition += moveRatio;

      let newLocation = pkg.currentLocation;
      let newRouteIndex = currentRouteIndex;
      let newIsMoving = pkg.isMoving;

      if (currentSubPosition >= 1) {
        currentRouteIndex++;
        currentSubPosition = 0;
        if (currentRouteIndex < totalPoints) {
          newLocation = { ...pkg.route[currentRouteIndex] };
          newRouteIndex = currentRouteIndex;
        }
      } else {
        newLocation = {
          lat: currentPoint.lat + (latDiff * currentSubPosition),
          lng: currentPoint.lng + (lngDiff * currentSubPosition)
        };
        newRouteIndex = currentRouteIndex;
      }

      // Check if the package has reached the end of the route
      if (currentRouteIndex >= totalPoints - 1) {
        newIsMoving = "end";
      }

      updates.push({
        id: pkg.id,
        code: pkg.code,
        currentLocation: newLocation,
        currentRouteIndex: newRouteIndex,
        currentSubPosition: currentSubPosition,
        isMoving: newIsMoving,
        route: pkg.route
      });
    }

    // Batch update all packages and emit Socket.IO updates
    if (updates.length > 0) {
      for (const update of updates) {
        // Update database
        await Package.update({
          currentLocation: update.currentLocation,
          currentRouteIndex: update.currentRouteIndex,
          currentSubPosition: update.currentSubPosition,
          isMoving: update.isMoving
        }, {
          where: { id: update.id }
        });

        // Emit real-time update to all clients tracking this package
        const trackingSockets = activeTrackingSockets.get(update.code);
        if (trackingSockets && trackingSockets.size > 0) {
          // Calculate traveled path
          let traveledPath = update.route.slice(0, update.currentRouteIndex + 1);
          if (
            update.currentLocation.lat !== update.route[update.currentRouteIndex].lat ||
            update.currentLocation.lng !== update.route[update.currentRouteIndex].lng
          ) {
            traveledPath.push({ ...update.currentLocation });
          }

          const updateData = {
            currentLocation: update.currentLocation,
            traveledPath,
            route: update.route,
            currentRouteIndex: update.currentRouteIndex,
            isMoving: update.isMoving
          };

          // Emit to all sockets tracking this package
          trackingSockets.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
              socket.emit('locationUpdate', updateData);
              console.log(`📍 Sent location update for ${update.code} to socket ${socketId}`);
            }
          });

          // If journey complete, emit special event
          if (update.isMoving === 'end') {
            trackingSockets.forEach(socketId => {
              const socket = io.sockets.sockets.get(socketId);
              if (socket) {
                socket.emit('journeyComplete');
                console.log(`🏁 Journey complete for ${update.code} to socket ${socketId}`);
              }
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in background movement:', error);
  }
}, 60000); // Every 1 minute

// Haversine formula to calculate distance between two lat/lng points (in kilometers)
function haversineDistance(pointA, pointB) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(pointB.lat - pointA.lat);
  const dLng = toRad(pointB.lng - pointA.lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pointA.lat)) * Math.cos(toRad(pointB.lat)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate total route distance
function totalRouteDistance(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineDistance(route[i - 1], route[i]);
  }
  return total;
}

// Distance-aware moveRatio calculation
function calculateMoveRatio(route, days, intervalMs = 60000) {
  if (!Array.isArray(route) || route.length < 2 || typeof days !== 'number' || days <= 0) {
    throw new Error('Invalid route or days');
  }
  const totalDistance = totalRouteDistance(route); // in km
  const ticksPerDay = Math.floor((24 * 60 * 60 * 1000) / intervalMs);
  const totalTicks = days * ticksPerDay;
  // moveRatio is now "km per tick"
  return totalDistance / totalTicks;
}

// Endpoint to get moveRatio for a specific package code and days
app.post('/orders/move-ratio', async (req, res) => {
  const { code, days } = req.body;
  try {
    if (!code || typeof days !== 'number' || days <= 0) {
      return res.status(400).json({ error: 'Code and valid days required' });
    }
    const pkg = await Package.findOne({
      where: { code },
      attributes: ['id', 'code', 'route']
    });
    if (!pkg || !pkg.route || pkg.route.length < 2) {
      return res.status(404).json({ error: 'Package or route not found' });
    }
    const moveRatio = calculateMoveRatio(pkg.route, days);
    res.json({ id: pkg.id, code: pkg.code, moveRatio });
  } catch (error) {
    console.error('Error in /orders/move-ratio:', error);
    res.status(500).json({ error: 'Failed to calculate move ratio' });
  }
});

async function fastForwardMovingPackages() {
  console.log('⏩ Fast-forwarding moving packages...');
  const now = Date.now();
  const intervalMs = 60000; // 1 minute

  const packages = await Package.findAll({
    where: { isMoving: 'true' }
  });

  for (const pkg of packages) {
    if (!pkg.route || pkg.route.length < 2) continue;

    const lastUpdated = pkg.updatedAt ? new Date(pkg.updatedAt).getTime() : now;
    const elapsedMs = now - lastUpdated;
    if (elapsedMs < intervalMs) continue; // Less than 1 tick, skip

    const ticks = Math.floor(elapsedMs / intervalMs);
    const moveRatio = pkg.moveRatio || 0.0008680555555555555;

    let currentRouteIndex = typeof pkg.currentRouteIndex === 'number'
      ? pkg.currentRouteIndex
      : findCurrentRouteIndex(pkg.currentLocation, pkg.route);

    let currentSubPosition = pkg.currentSubPosition || 0;
    let newLocation = pkg.currentLocation;
    let newRouteIndex = currentRouteIndex;
    let newIsMoving = pkg.isMoving;

    for (let i = 0; i < ticks; i++) {
      const totalPoints = pkg.route.length;
      const currentPoint = pkg.route[newRouteIndex];
      const nextPoint = pkg.route[Math.min(newRouteIndex + 1, totalPoints - 1)];
      const latDiff = nextPoint.lat - currentPoint.lat;
      const lngDiff = nextPoint.lng - currentPoint.lng;

      currentSubPosition += moveRatio;

      if (currentSubPosition >= 1) {
        newRouteIndex++;
        currentSubPosition = 0;
        if (newRouteIndex < totalPoints) {
          newLocation = { ...pkg.route[newRouteIndex] };
        }
      } else {
        newLocation = {
          lat: currentPoint.lat + (latDiff * currentSubPosition),
          lng: currentPoint.lng + (lngDiff * currentSubPosition)
        };
      }

      if (newRouteIndex >= totalPoints - 1) {
        newIsMoving = "end";
        break;
      }
    }

    await Package.update({
      currentLocation: newLocation,
      currentRouteIndex: newRouteIndex,
      currentSubPosition: currentSubPosition,
      isMoving: newIsMoving
    }, {
      where: { id: pkg.id }
    });
  }
}

// --- END BACKGROUND SHIP MOVEMENT ---

app.post('/track', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.json({ found: false });
    }

    const trimmedCode = code.trim();
    if (trimmedCode.toLowerCase() === 'admin') {
      return res.json({
        found: false,
        redirect: '/admin'
      });
    }

    const pkg = await Package.findOne({
      where: { code: trimmedCode }
    });

    if (!pkg) {
      return res.json({ found: false });
    }

    if (!pkg.route || !Array.isArray(pkg.route) || pkg.route.length === 0) {
      return res.json({ found: false });
    }

    if (!pkg.currentLocation || typeof pkg.currentLocation.lat !== 'number') {
      return res.json({ found: false });
    }

    let currentRouteIndex = typeof pkg.currentRouteIndex === 'number'
      ? pkg.currentRouteIndex
      : findCurrentRouteIndex(pkg.currentLocation, pkg.route);

    const traveledPath = pkg.route.slice(0, currentRouteIndex + 1);
    if (
      pkg.currentLocation.lat !== pkg.route[currentRouteIndex].lat ||
      pkg.currentLocation.lng !== pkg.route[currentRouteIndex].lng
    ) {
      traveledPath.push({ ...pkg.currentLocation });
    }

    res.json({
      found: true,
      current: pkg.currentLocation,
      route: pkg.route,
      traveled: traveledPath,
      currentRouteIndex: currentRouteIndex,
      isMoving: pkg.isMoving
    });
  } catch (error) {
    console.error('Error in /track:', error);
    res.json({ found: false });
  }
});

// Get all orders with full info
app.get('/orders', adminAuthMiddleware, async (req, res) => {
  try {
    console.log('📋 Fetching all orders...');

    const packages = await Package.findAll({
      order: [['created_at', 'DESC']],
      raw: false
    });

    console.log(`✅ Found ${packages.length} packages`);

    // Transform data to match frontend expectations
    const transformedPackages = packages.map(pkg => {
      const packageData = pkg.toJSON();

      return {
        code: packageData.code,
        isMoving: packageData.is_moving || packageData.isMoving,
        currentLocation: packageData.current_location || packageData.currentLocation,
        route: packageData.route,
        currentRouteIndex: packageData.current_route_index || packageData.currentRouteIndex || 0,
        _currentSubPosition: packageData.current_sub_position || packageData._currentSubPosition || 0,
        created_at: packageData.created_at,
        updated_at: packageData.updated_at
      };
    });

    console.log('📋 Orders response:', transformedPackages);
    res.json(transformedPackages);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);

    res.status(500).json({
      error: 'Failed to fetch orders',
      details: error.message
    });
  }
});

// Update isMoving for an order
app.post('/orders/update-moving', adminAuthMiddleware, async (req, res) => {
  const { code, isMoving } = req.body;
  try {
    const pkg = await Package.findOne({
      where: { code }
    });

    if (!pkg) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If at end, do not allow further changes
    if (
      pkg.currentRouteIndex >= pkg.route.length - 1 ||
      pkg.isMoving === 'end' ||
      pkg.isMoving === 'final'
    ) {
      return res.status(400).json({ error: 'Order already ended' });
    }

    // Convert boolean to string for database
    const movingStatus = isMoving ? 'true' : 'false';
    await pkg.update({ isMoving: movingStatus });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Create new package (bonus endpoint for adding packages)
app.post('/orders/create', adminAuthMiddleware, async (req, res) => {
  try {
    const { code, route, currentLocation } = req.body;

    const newPackage = await Package.create({
      code,
      route,
      currentLocation: currentLocation || route[0],
      isMoving: 'false',
      currentRouteIndex: 0,
      currentSubPosition: 0
    });

    res.json({ success: true, package: newPackage });
  } catch (error) {
    console.error('Error creating package:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Package code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create package' });
    }
  }
});

// Delete package (bonus endpoint)
app.delete('/orders/:code', adminAuthMiddleware, async (req, res) => {
  try {
    const { code } = req.params;
    const deleted = await Package.destroy({
      where: { code }
    });

    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Package not found' });
    }
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

// Debug endpoint to test database connection
app.get('/debug/db', async (req, res) => {
  try {
    console.log('🔍 Debug: Testing database query...');

    // Test raw query first
    const [results] = await sequelize.query('SELECT * FROM packages LIMIT 5');
    console.log('🔍 Raw query results:', results);

    // Test Sequelize query
    const packages = await Package.findAll({ limit: 5 });
    console.log('🔍 Sequelize results:', packages.map(p => p.toJSON()));

    res.json({
      raw_query: results,
      sequelize_query: packages.map(p => p.toJSON())
    });

  } catch (error) {
    console.error('🔍 Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint for orders
app.get('/debug/orders', async (req, res) => {
  try {
    console.log('🔍 Debug: Testing orders query...');

    const packages = await Package.findAll({ limit: 5 });
    console.log('🔍 Orders debug results:', packages.map(p => p.toJSON()));

    res.json({
      orders: packages.map(p => p.toJSON())
    });

  } catch (error) {
    console.error('🔍 Orders debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Protect orders API
app.get('/api/admin/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const packages = await Package.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ orders: packages });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.json({ orders: [] });
  }
});

// --- SOCKET.IO HANDLERS ---
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('startTracking', async (code) => {
    try {
      const pkg = await Package.findOne({
        where: { code }
      });

      if (!pkg) {
        socket.emit('trackingError', 'Package not found');
        return;
      }

      // Add this socket to the tracking list for this package
      if (!activeTrackingSockets.has(code)) {
        activeTrackingSockets.set(code, new Set());
      }
      activeTrackingSockets.get(code).add(socket.id);
      console.log(`📱 Socket ${socket.id} started tracking ${code}`);

      let currentRouteIndex = typeof pkg.currentRouteIndex === 'number'
        ? pkg.currentRouteIndex
        : findCurrentRouteIndex(pkg.currentLocation, pkg.route);

      let traveledPath = pkg.route.slice(0, currentRouteIndex + 1);
      if (
        pkg.currentLocation.lat !== pkg.route[currentRouteIndex].lat ||
        pkg.currentLocation.lng !== pkg.route[currentRouteIndex].lng
      ) {
        traveledPath.push({ ...pkg.currentLocation });
      }

      socket.emit('locationUpdate', {
        currentLocation: { ...pkg.currentLocation },
        traveledPath,
        route: pkg.route,
        currentRouteIndex,
        isMoving: pkg.isMoving
      });
    } catch (error) {
      console.error('Error in startTracking:', error);
      socket.emit('trackingError', 'Failed to start tracking');
    }
  });

  socket.on('stopTracking', (code) => {
    // Remove this socket from tracking the specified package
    if (code && activeTrackingSockets.has(code)) {
      activeTrackingSockets.get(code).delete(socket.id);
      if (activeTrackingSockets.get(code).size === 0) {
        activeTrackingSockets.delete(code);
      }
      console.log(`📱 Socket ${socket.id} stopped tracking ${code}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    // Remove this socket from all tracking lists
    for (const [code, sockets] of activeTrackingSockets.entries()) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        activeTrackingSockets.delete(code);
      }
    }
  });
});


const PORT = process.env.PORT || 4000;

// Initialize database and start server
initializeDatabase().then(async () => {
  await fastForwardMovingPackages();
  server.listen(PORT, () => {
    console.log(`🚀 Tracking Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

