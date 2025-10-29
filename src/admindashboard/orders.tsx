import React, { useState, useEffect } from 'react';
import { PauseCircle, PlayCircle, Flag, MapPin } from 'lucide-react';
import { io } from 'socket.io-client';
import Modal from 'react-modal';
import { Marker, Polyline, MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// const socket = io('http://localhost:4000');
const socket = io('https://expressback-kylv.onrender.com', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Fix for Leaflet marker icon path issues in React/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  shadowUrl: '',
});

// Custom ship icon
const shipIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

type Order = {
  code: string;
  isMoving: boolean | string; // Can be boolean, 'true', 'false', 'end', 'final'
  current: { lat: number; lng: number };
  route: { lat: number; lng: number; name?: string }[];
  currentRouteIndex: number;
  _currentSubPosition: number;
};

const fetchOrders = async (): Promise<Order[]> => {
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('https://expressback-kylv.onrender.com/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Ensure we return an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    //console.error('Error fetching orders:', error);
    return []; // Return empty array on error
  }
};

const updateIsMoving = async (code: string, isMoving: boolean) => {
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch('https://expressback-kylv.onrender.com/orders/update-moving', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ code, isMoving })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  } catch (error) {
    //console.error('Error updating order:', error);
  }
};

// Helper component to fit bounds to the route
const FitBounds: React.FC<{ route: { lat: number; lng: number }[] }> = ({ route }) => {
  const map = useMap();
  useEffect(() => {
    if (route.length > 1) {
      const bounds = route.map(p => [p.lat, p.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [route, map]);
  return null;
};

const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- AUTH CHECK ---
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const expiry = localStorage.getItem('admin_token_expiry');
    if (!token || !expiry || Date.now() > Number(expiry)) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token_expiry');
      window.location.href = '/admindashboard/';
      return;
    }
  }, []);
  // --- END AUTH CHECK ---

  useEffect(() => {
    fetchOrders().then(setOrders);

    // Listen to updates
    socket.on('orderUpdate', (update: Order) => {
      setOrders(prev =>
        prev.map(o => (o.code === update.code ? update : o))
      );
    });

    return () => {
      socket.off('orderUpdate');
    };
  }, []);

  const handleToggleMoving = async (order: Order) => {
    if (order.isMoving === 'end' || order.isMoving === 'final') return;

    // Fix: Properly determine current state and toggle it
    const currentlyMoving = order.isMoving === 'true' || order.isMoving === true;
    await updateIsMoving(order.code, !currentlyMoving);

    // Refresh orders after update
    const updatedOrders = await fetchOrders();
    setOrders(updatedOrders);
  };

  const getCurrentRouteName = (order: Order) => {
    const idx = order.currentRouteIndex;
    if (!order.route || order.route.length === 0) return '';
    // If at or past last point
    if (idx >= order.route.length - 1) {
      return order.route[order.route.length - 1].name || 'Arrived';
    }
    // If interpolating, show current segment name and position
    const segName = order.route[idx + 1]?.name || order.route[idx]?.name || '';
    if (order.current && typeof order.current.lat === 'number' && typeof order.current.lng === 'number') {
      return `${segName} (Lat: ${order.current.lat.toFixed(4)}, Lng: ${order.current.lng.toFixed(4)})`;
    }
    return segName;
  };

  const openMapModal = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      <div className="text-center relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 pt-5 pb-16"></div>
      <div className="text-center max-w-5xl mx-auto bg-white/30 backdrop-blur-md rounded-2xl shadow-xl px-6 pt-12 pb-16 mt-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-4">Order List</h1>
        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-white/50 rounded-lg">
            <thead>
              <tr className="text-left text-indigo-800 uppercase bg-indigo-100">
                <th className="p-3">Tracking Code</th>
                <th className="p-3">Is Moving?</th>
                <th className="p-3">Current Position</th>
                <th className="p-3">Map</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                let isEnd = order.isMoving === 'end' || order.isMoving === 'final' ||
                  (order.currentRouteIndex >= order.route.length - 1);

                // Fix: Properly check if moving (handle both string and boolean)
                let isMoving = order.isMoving === 'true' || order.isMoving === true;

                return (
                  <tr
                    key={order.code}
                    className="border-t border-indigo-200 hover:bg-indigo-50 transition"
                  >
                    <td className="p-3">{order.code}</td>
                    <td className="p-3 flex items-center gap-2">
                      {isEnd ? (
                        <>
                          End <Flag className="text-green-600" />
                        </>
                      ) : isMoving ? (
                        <>
                          Yes
                          <span title="Pause">
                            <PauseCircle
                              className="text-yellow-600 cursor-pointer"
                              onClick={() => handleToggleMoving(order)}
                            />
                          </span>
                        </>
                      ) : (
                        <>
                          No
                          <span title="Resume">
                            <PlayCircle
                              className="text-blue-600 cursor-pointer"
                              onClick={() => handleToggleMoving(order)}
                            />
                          </span>
                        </>
                      )}
                    </td>
                    <td className="p-3">
                      {getCurrentRouteName(order)}
                    </td>
                    <td className="p-3">
                      <button
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-900 text-white rounded hover:bg-indigo-700"
                        onClick={() => openMapModal(order)}
                      >
                        <MapPin size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-600">
                    No orders currently.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal for Map */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="Order Map"
        ariaHideApp={false}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40"
      >
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
          >
            ×
          </button>
          {selectedOrder && (
            <>
              <h2 className="text-xl font-bold mb-2">{selectedOrder.code}</h2>
              <div className="mb-2">
                <span className="font-semibold">Current:</span> {getCurrentRouteName(selectedOrder)}
              </div>
              <div style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}>
                <MapContainer
                  key={selectedOrder.code}
                  center={[
                    selectedOrder.current?.lat || selectedOrder.route[0].lat,
                    selectedOrder.current?.lng || selectedOrder.route[0].lng
                  ]}
                  zoom={6}
                  style={{ height: '300px', width: '100%', borderRadius: 12 }}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution=""
                  />
                  {/* Fit bounds to route */}
                  <FitBounds route={selectedOrder.route} />
                  {/* Thin line: full route */}
                  {selectedOrder.route.length > 1 && (
                    <Polyline
                      positions={selectedOrder.route.map(p => [p.lat, p.lng])}
                      color="#94a3b8"
                      weight={3}
                      opacity={0.9}
                      dashArray="8, 12"
                    />
                  )}
                  {/* Thick line: traveled route */}
                  {selectedOrder.route.length > 1 && selectedOrder.currentRouteIndex > 0 && (
                    <Polyline
                      positions={selectedOrder.route
                        .slice(0, selectedOrder.currentRouteIndex + 1)
                        .map(p => [p.lat, p.lng])}
                      color="#1d4ed8"
                      weight={6}
                      opacity={1}
                    />
                  )}
                  {/* Marker at current location */}
                  {selectedOrder.current && (
                    <Marker
                      position={[
                        selectedOrder.current.lat,
                        selectedOrder.current.lng
                      ]}
                      icon={shipIcon}
                    />
                  )}
                </MapContainer>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrderListPage;