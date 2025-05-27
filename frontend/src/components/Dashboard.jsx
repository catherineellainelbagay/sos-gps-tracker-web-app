import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SendTestData from './SendTestData';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const responder = {
  latitude: 14.3137,
  longitude: 121.0809,
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

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/location/latest');
        if (
          res.data &&
          typeof res.data.latitude === 'number' &&
          typeof res.data.longitude === 'number'
        ) {
          setLocation(res.data);
          const dist = haversineDistance(
            [responder.latitude, responder.longitude],
            [res.data.latitude, res.data.longitude]
          );
          setDistance(dist.toFixed(2));
        } else {
          console.warn('Invalid data from backend:', res.data);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  const linePositions =
    location && responder
      ? [
          [responder.latitude, responder.longitude],
          [location.latitude, location.longitude],
        ]
      : [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl text-center">
      <h2 className="text-xl font-semibold mb-2 text-gray-700">Live GPS Tracker</h2>
      {location ? (
        <>
          <p className="mb-1">User: {location.latitude}, {location.longitude}</p>
          <p className="mb-1">Responder: {responder.latitude}, {responder.longitude}</p>
          <p className="mb-4 text-blue-600 font-semibold">Distance: {distance} km</p>
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={16}
            style={{ height: '550px', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[responder.latitude, responder.longitude]}>
              <Popup>Responder</Popup>
            </Marker>
            <Marker position={[location.latitude, location.longitude]}>
              <Popup>User</Popup>
            </Marker>
            <Polyline
              positions={linePositions}
              pathOptions={{ color: 'red', dashArray: '6' }}
            />
          </MapContainer>
        </>
      ) : (
        <p className="text-gray-500 mb-4">⏳ Waiting for valid GPS data...</p>
      )}

      <div className="mt-6 flex justify-center">
        <SendTestData />
      </div>
    </div>
  );
}

export default Dashboard;
