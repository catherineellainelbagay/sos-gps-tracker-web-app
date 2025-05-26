import React from 'react';
import axios from 'axios';

function SendTestData() {
  const sendTest = async () => {
    const fakeLat = 14.317 + Math.random() * 0.001;
    const fakeLon = 121.082 + Math.random() * 0.001;
    try {
      await axios.post('http://localhost:5000/api/location', {
        latitude: fakeLat,
        longitude: fakeLon,
      });
      alert(`📡 Sent test data: ${fakeLat.toFixed(5)}, ${fakeLon.toFixed(5)}`);
    } catch (err) {
      alert('Failed to send test data');
      console.error(err);
    }
  };

  return (
    <button
      onClick={sendTest}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      📤 Send Test GPS Data
    </button>
  );
}

export default SendTestData;
