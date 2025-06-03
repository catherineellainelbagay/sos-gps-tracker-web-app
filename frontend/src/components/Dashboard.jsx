import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const responder = {
  latitude: 14.3160,
  longitude: 121.0797,
};

function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function Dashboard() {
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [lastCoords, setLastCoords] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const alertSound = useRef(null);

  useEffect(() => {
    alertSound.current = new Audio('/alert.mp3');
    alertSound.current.volume = 1.0;
  }, []);

  useEffect(() => {
    if (!soundEnabled) return; // Wait for user interaction first

    const fetchEmergency = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/emergency');
        const data = res.data;

        if (data && data.latitude && data.longitude) {
          if (
            !lastCoords ||
            lastCoords.latitude !== data.latitude ||
            lastCoords.longitude !== data.longitude
          ) {
            // Play sound on new emergency alert
            alertSound.current.currentTime = 0;
            alertSound.current.play().catch((e) => {
              console.warn('Sound not played:', e);
            });
            setLastCoords({ latitude: data.latitude, longitude: data.longitude });
          }

          setLocation(data);
          const dist = haversineDistance(
            [responder.latitude, responder.longitude],
            [data.latitude, data.longitude]
          );
          setDistance(dist.toFixed(2));
        } else {
          setLocation(null);
          setDistance(null);
        }
      } catch (error) {
        console.error('Error fetching emergency:', error);
      }
    };

    fetchEmergency();
    const interval = setInterval(fetchEmergency, 3000);
    return () => clearInterval(interval);
  }, [lastCoords, soundEnabled]);

  const linePositions = location
    ? [
        [responder.latitude, responder.longitude],
        [location.latitude, location.longitude],
      ]
    : [];

  // Unlock audio context on user click
  const handleEnableSound = () => {
    setSoundEnabled(true);
    alertSound.current.play()
      .then(() => {
        alertSound.current.pause();
        alertSound.current.currentTime = 0;
      })
      .catch(() => {
        // Ignore play error here
      });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl text-center">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Emergency Response Dashboard</h2>

      {!soundEnabled && (
        <button
          onClick={handleEnableSound}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Enable Sound Notifications
        </button>
      )}

      {location ? (
        <>
          <p className="mb-1 font-bold text-red-500">
            Reported Location: Latitude {location.latitude}, Longitude {location.longitude}
          </p>
          <p className="mb-1 font-bold text-black-600">
            Responder: Latitude {responder.latitude}, Longitude {responder.longitude}
          </p>
          <p className="mb-4 font-semibold text-blue-600">
            Distance: {distance} km
          </p>

          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={16}
            style={{ height: '550px', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[responder.latitude, responder.longitude]} icon={blueIcon}>
              <Popup>Responder</Popup>
            </Marker>
            <Marker position={[location.latitude, location.longitude]} icon={redIcon}>
              <Popup>Reported Location</Popup>
            </Marker>
            <Polyline
              positions={linePositions}
              pathOptions={{ color: 'red', dashArray: '6' }}
            />
          </MapContainer>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => alert("Responder is en route to the user's location.")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Responding to Emergency
            </button>
            <button
              onClick={async () => {
                try {
                  await axios.post('http://localhost:5000/api/emergency/reset');
                  setLocation(null);
                  setDistance(null);
                  setLastCoords(null);
                } catch (err) {
                  console.error('Failed to reset emergency:', err);
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mark Emergency as Resolved
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500 mb-4">No active emergencies at this time.</p>
      )}
    </div>
  );
}

export default Dashboard;
