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
      alert(`Sent text data: ${fakeLat.toFixed(5)}, ${fakeLon.toFixed(5)}`);
    } catch (err) {
      alert('Failed to send test data');
      console.error(err);
    }
  };

  return (
    <button
      onClick={sendTest}
      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
    >
      📤 Send Test Data
    </button>
  );
}

export default SendTestData;
