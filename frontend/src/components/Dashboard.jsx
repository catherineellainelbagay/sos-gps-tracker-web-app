import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

function Dashboard() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/location/latest');
        console.log("Fetched:", res.data); // Debug output
        if (
          res.data &&
          typeof res.data.latitude === 'number' &&
          typeof res.data.longitude === 'number'
        ) {
          setLocation(res.data);
        } else {
          console.warn("Invalid data from backend:", res.data);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };
    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Live GPS Tracker</h2>
      {location ? (
        <>
          <p>📍 Latitude: {location.latitude}, Longitude: {location.longitude}</p>
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={18}
            style={{ height: '400px', width: '100%', marginTop: '1rem' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[location.latitude, location.longitude]}>
              <Popup>Current Position</Popup>
            </Marker>
          </MapContainer>
        </>
      ) : (
        <p>⏳ Waiting for valid GPS data...</p>
      )}
    </div>
  );
}

export default Dashboard;
