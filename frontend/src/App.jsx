import React from 'react';
import Dashboard from './components/Dashboard';
import SendTestData from './components/SendTestData';

function App() {
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">SOS Tracker Dashboard</h1>
      <SendTestData />
      <Dashboard />
    </div>
  );
}

export default App;
