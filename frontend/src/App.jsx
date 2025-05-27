import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🚨 SOS Tracker Dashboard
      </h1>
      <Dashboard />
    </div>
  );
}

export default App;
