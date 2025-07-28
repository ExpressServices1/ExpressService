import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import adminAuthRouter, { adminAuthMiddleware } from './admin-auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://expressease-service.vercel.app/",
    // origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const DATA_FILE = path.join(__dirname, 'data-file.json');

app.use(cors());
app.use(express.json());
app.use('/api', adminAuthRouter);

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

const readPackages = async () => {
  try {
    const data = await fs.readJson(DATA_FILE);
    if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('Data file is not an array, returning empty array');
      return [];
    }
  } catch (error) {
    console.log('Creating new data file...');
    const defaultData = [];
    await fs.writeJson(DATA_FILE, defaultData);
    return defaultData;
  }
};

const writePackages = async (packages) => {
  await fs.writeJson(DATA_FILE, packages, { spaces: 2 });
};

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
    const packages = await readPackages();
    const packageIndex = packages.findIndex(p => p && p.code === code);
    if (packageIndex >= 0) {
      packages[packageIndex].currentLocation = { ...newLocation };
      packages[packageIndex].currentRouteIndex = routeIndex;
      packages[packageIndex]._currentSubPosition = subPosition;
      await writePackages(packages);
      // console.log(`💾 Updated ${code} location:`, newLocation, `Route: ${routeIndex}`);
    }
  } catch (error) {
    console.error('Error updating package location:', error);
  }
};

// --- BACKGROUND SHIP MOVEMENT ---
setInterval(async () => {
  const packages = await readPackages();
  let changed = false;

  for (const pkg of packages) {
    if (!pkg.isMoving || !pkg.route || pkg.route.length < 2) continue;

    let currentRouteIndex = typeof pkg.currentRouteIndex === 'number'
      ? pkg.currentRouteIndex
      : findCurrentRouteIndex(pkg.currentLocation, pkg.route);

    const totalPoints = pkg.route.length;
    const currentPoint = pkg.route[currentRouteIndex];
    const nextPoint = pkg.route[Math.min(currentRouteIndex + 1, totalPoints - 1)];
    const latDiff = nextPoint.lat - currentPoint.lat;
    const lngDiff = nextPoint.lng - currentPoint.lng;
    const moveRatio = 0.1;

    if (!pkg._currentSubPosition) pkg._currentSubPosition = 0;
    pkg._currentSubPosition += moveRatio;

    if (pkg._currentSubPosition >= 1) {
      currentRouteIndex++;
      pkg._currentSubPosition = 0;
      if (currentRouteIndex < totalPoints) {
        pkg.currentLocation = { ...pkg.route[currentRouteIndex] };
        pkg.currentRouteIndex = currentRouteIndex;
        changed = true;
      }
    } else {
      pkg.currentLocation = {
        lat: currentPoint.lat + (latDiff * pkg._currentSubPosition),
        lng: currentPoint.lng + (lngDiff * pkg._currentSubPosition)
      };
      pkg.currentRouteIndex = currentRouteIndex;
      changed = true;
    }

    // Check if the package has reached the end of the route
    if (currentRouteIndex >= totalPoints - 1) {
      pkg.isMoving = "end";
    }
  }

  if (changed) {
    await writePackages(packages);
  }
}, 60000); // Every 1 minute

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
    const packages = await readPackages();
    if (!Array.isArray(packages)) {
      return res.json({ found: false });
    }
    const pkg = packages.find(p => p && p.code === trimmedCode);
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
    res.json({ found: false });
  }
});

// Get all orders with full info
app.get('/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update isMoving for an order
app.post('/orders/update-moving', adminAuthMiddleware, async (req, res) => {
  const { code, isMoving } = req.body;
  try {
    const data = await fs.readJson(DATA_FILE);
    const idx = data.findIndex(pkg => pkg.code === code);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });

    // If at end, do not allow further changes
    if (
      data[idx].currentRouteIndex >= data[idx].route.length - 1 ||
      data[idx].isMoving === 'end' || data[idx].isMoving === 'final'
    ) {
      return res.status(400).json({ error: 'Order already ended' });
    }

    data[idx].isMoving = isMoving;
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Protect orders API
app.get('/api/admin/orders', adminAuthMiddleware, async (req, res) => {
  // Return orders data
  res.json({ orders: [] });
});

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('startTracking', async (code) => {
    try {
      const packages = await readPackages();
      const pkg = packages.find(p => p && p.code === code);

      if (!pkg) {
        socket.emit('trackingError', 'Package not found');
        return;
      }

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
      socket.emit('trackingError', 'Failed to start tracking');
    }
  });

  socket.on('stopTracking', () => {
    // No per-user interval, so nothing to clear
  });

  socket.on('disconnect', () => {
    // No per-user interval, so nothing to clear
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Tracking Server running on port ${PORT}`);
});