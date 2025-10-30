import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DriftingMarker from 'react-leaflet-drift-marker';
import {
  LucideSearchCheck,
  LucideMapPin,
  LucideClock4,
} from 'lucide-react';
import { pingServer } from "../components/pingServer";
import TestimonialCarousel from '../components/Testimony';

// const socket = io('http://localhost:4000');
const socket = io('https://expressback-kylv.onrender.com', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

interface LatLng { lat: number; lng: number; }

const MapUpdater: React.FC<{ route: LatLng[]; current: LatLng | null; fullRoute: LatLng[] }> = ({ route, current, fullRoute }) => {
  void route;
  // console.log(route);
  const map = useMap();
  const hasFitBounds = useRef(false);
  const prevRoute = useRef<LatLng[]>([]);

  useEffect(() => {
    // Only fit bounds if route changes
    if (
      fullRoute.length > 0 &&
      (prevRoute.current.length !== fullRoute.length ||
        !prevRoute.current.every((p, i) => p.lat === fullRoute[i].lat && p.lng === fullRoute[i].lng))
    ) {
      const bounds = fullRoute.map(p => [p.lat, p.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      hasFitBounds.current = true;
      prevRoute.current = [...fullRoute];
    }
    // If no route, fit to current only on first render
    else if (!hasFitBounds.current && current) {
      map.setView([current.lat, current.lng], 13);
      hasFitBounds.current = true;
    }
    // Do NOT update map view on every marker move!
  }, [fullRoute, current, map]);

  return null;
};

const TrackPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [found, setFound] = useState(false);
  const [current, setCurrent] = useState<LatLng | null>(null);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [fullRoute, setFullRoute] = useState<LatLng[]>([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isMoving, setIsMoving] = useState(true);
  const [mapKey, setMapKey] = useState(0);
  const [trackingCode, setTrackingCode] = useState(''); // Track current package
  const [hideStatusMessages, setHideStatusMessages] = useState(false);

  // Ping the server when the component mounts
  useEffect(() => {
    pingServer();
  }, []);

  const mapContainerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const handleTrack = async () => {
    const errorElement = document.getElementById('errmsg') as HTMLElement;
    errorElement.textContent = '';
    setHideStatusMessages(true);

    if (code.trim().toLowerCase() === 'admin') {
      // Check for admin token and expiry
      const token = localStorage.getItem('admin_token');
      const expiry = localStorage.getItem('admin_token_expiry');
      if (token && expiry && Date.now() < Number(expiry)) {
        window.location.href = '/admindashboard/orders';
      } else {
        window.location.href = '/admindashboard/index';
      }
      return;
    }

    if (!code.trim()) {
      errorElement.textContent = 'Please enter a tracking code';
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://expressback-kylv.onrender.com/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.redirect) {
        window.location.href = data.redirect;
      } else if (data.found) {
        setFound(true);
        setFullRoute([...data.route]);
        setCurrent(data.current);

        setHideStatusMessages(false);

        const currentIndex = data.currentRouteIndex || 0;
        setRoute(data.traveled || data.route.slice(0, currentIndex + 1));
        setCurrentRouteIndex(currentIndex);

        setIsMoving(data.isMoving === 'true' || data.isMoving === true);
        setIsTracking(true);
        setTrackingCode(code.trim()); // Store the tracking code
        socket.emit('startTracking', code.trim());
        setMapKey(prev => prev + 1); // Force remount for clean state
      } else {
        errorElement.textContent = 'Package tracking code not found';
        setFound(false);
        setCurrent(null);
        setRoute([]);
        setFullRoute([]);
        setCurrentRouteIndex(0);
        setIsMoving(true); // reset
        setTrackingCode(''); // Clear tracking code
      }
    } catch (error) {
      errorElement.textContent = 'Error connecting to package tracking service. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  // UPDATED useEffect for Socket.IO events with proper marker updates
  useEffect(() => {
    const handleLocationUpdate = (trackingData: any) => {
      //console.log('📍 Received location update:', trackingData);

      if (trackingData && trackingData.currentLocation) {
        // Update state
        setCurrent(trackingData.currentLocation);
        if (trackingData.traveledPath) {
          setRoute(trackingData.traveledPath);
          setCurrentRouteIndex(trackingData.traveledPath.length - 1);
        }
        setIsMoving(trackingData.isMoving === 'true' || trackingData.isMoving === true);

        // Update marker position using DriftingMarker's built-in animation
        if (markerRef.current) {
          //console.log('🎯 Updating marker to:', trackingData.currentLocation);
          // DriftingMarker automatically animates to new position
          markerRef.current.setLatLng([
            trackingData.currentLocation.lat,
            trackingData.currentLocation.lng
          ]);
        }
      }
    };

    const handleJourneyComplete = () => {
      //console.log('🏁 Journey completed');
      setIsTracking(false);
      setIsMoving(false);
    };

    const handleTrackingError = (error: string) => {
      //console.error('❌ Tracking error:', error);
      const errorElement = document.getElementById('errmsg') as HTMLElement;
      if (errorElement) {
        errorElement.textContent = error;
      }
      setIsTracking(false);
    };

    socket.on('locationUpdate', handleLocationUpdate);
    socket.on('journeyComplete', handleJourneyComplete);
    socket.on('trackingError', handleTrackingError);

    return () => {
      socket.off('locationUpdate', handleLocationUpdate);
      socket.off('journeyComplete', handleJourneyComplete);
      socket.off('trackingError', handleTrackingError);
    };
  }, []);

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      if (trackingCode) {
        socket.emit('stopTracking', trackingCode);
      }
    };
  }, [trackingCode]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleTrack();
    }
  };

  // --- Status Message Logic ---
  const isAtEnd = found && currentRouteIndex >= fullRoute.length - 1;
  const showPaused = found && !isMoving && !isAtEnd;
  const showLive = isTracking && isMoving && !isAtEnd;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 pt-32 pb-16">
          <h1 className="text-4xl font-bold text-indigo-100 mb-6">
            Track Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
              Shipment{' '}
            </span>
          </h1>
        </div>

        <div className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-xl mt-10 max-w-3xl mx-auto">
          <p className="text-lg text-gray-700 mb-10">
            Stay updated on the status of your package in real-time.
            <br />
            Enter your tracking number below to get detailed delivery insights.
          </p>
          <input
            type="text"
            placeholder="Enter tracking number"
            className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <p className="text-lg text-red-700 mt-2" id="errmsg"></p>
          <button
            className={`mt-4 w-full py-3 ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white rounded-lg transition duration-200`}
            onClick={handleTrack}
            disabled={loading}
          >
            {loading ? 'Tracking...' : 'Track Package'}
          </button>
          {!hideStatusMessages && showLive && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-700 font-medium">
                 Live tracking - Package updates every 1 minute
              </p>
            </div>
          )}

          {!hideStatusMessages && showPaused && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-700 font-medium">
                ⏸️ Tracking Paused - Package is not moving
              </p>
            </div>
          )}

          {!hideStatusMessages && isAtEnd && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-blue-700 font-medium">
                🏁 Package has reached final destination
              </p>
            </div>
          )}

        </div>
      </div>

      {found && current && (
        <div className="mt-10 max-w-6xl mx-auto px-4 relative z-0">
          <MapContainer
            key={mapKey}
            ref={mapContainerRef}
            center={[current.lat, current.lng]}
            zoom={13}
            style={{ height: '400px', borderRadius: '1rem', zIndex: 1 }}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution=""
            />
            <MapUpdater route={route} current={current} fullRoute={fullRoute} />
            {fullRoute.length > 1 && (
              <Polyline
                positions={fullRoute.map(p => [p.lat, p.lng])}
                color="#94a3b8"
                weight={3}
                opacity={0.9}
                dashArray="8, 12"
              />
            )}
            {route.length > 1 && (
              <Polyline
                positions={route.map(p => [p.lat, p.lng])}
                color="#1d4ed8"
                weight={6}
                opacity={1}
              />
            )}
            <DriftingMarker
              ref={markerRef}
              position={[current.lat, current.lng]}
              duration={58000} // Match your interval - 58 seconds for smooth animation
              keepAtCenter={false}
              key={`ship-marker-${current.lat}-${current.lng}`} // Force re-render on position change
            />
          </MapContainer>
        </div>
      )}

      <section className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-10 px-4">
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-md text-center">
          <LucideSearchCheck size={36} className="mx-auto mb-4 text-indigo-600" />
          <h3 className="text-xl font-semibold mb-2">Accurate Tracking</h3>
          <p className="text-gray-700">
            Get up-to-the-minute updates on your shipment's location and status
            across every checkpoint.
          </p>
        </div>
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-md text-center">
          <LucideMapPin size={36} className="mx-auto mb-4 text-indigo-600" />
          <h3 className="text-xl font-semibold mb-2">Real-time Location</h3>
          <p className="text-gray-700">
            View precise GPS tracking updates and visualize where your package
            is at any given time.
          </p>
        </div>
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-md text-center">
          <LucideClock4 size={36} className="mx-auto mb-4 text-indigo-600" />
          <h3 className="text-xl font-semibold mb-2">Predictive Delivery</h3>
          <p className="text-gray-700">
            Leverage intelligent ETA forecasting based on current traffic,
            weather, and route efficiency.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div>
          <TestimonialCarousel />
        </div>
      </section>
    </main>
  );
};

export default TrackPage;