import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Maximize2, Radio } from 'lucide-react';

interface LiveFeedProps {
  expanded?: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ expanded = false }) => {
  const [activeCamera, setActiveCamera] = useState('drone-1');
  const [vehicleCount, setVehicleCount] = useState(0);

  const cameras = [
    { id: 'drone-1', name: 'Drone Alpha', location: 'Highway Junction A1', status: 'active' },
    { id: 'drone-2', name: 'Drone Beta', location: 'Downtown Intersection', status: 'active' },
    { id: 'drone-3', name: 'Drone Gamma', location: 'Airport Road', status: 'maintenance' },
  ];

  // Simulate real-time vehicle counting
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(0, prev + change);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${expanded ? 'col-span-full' : ''}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Live Drone Feed</h2>
              <p className="text-gray-400">Real-time traffic monitoring</p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Camera Selection */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-wrap gap-2">
          {cameras.map((camera) => (
            <button
              key={camera.id}
              onClick={() => setActiveCamera(camera.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                activeCamera === camera.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${
                camera.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm font-medium">{camera.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Video Feed Simulation */}
      <div className="p-6">
        <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${
          expanded ? 'aspect-video' : 'aspect-[4/3]'
        }`}>
          {/* Simulated Video Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>
          
          {/* Overlay Information */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Radio className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">LIVE</span>
            </div>
            <div className="text-white text-sm">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-3 w-3" />
                <span>{cameras.find(c => c.id === activeCamera)?.location}</span>
              </div>
              <div>Altitude: 150m</div>
              <div>Speed: 15 km/h</div>
            </div>
          </div>

          {/* Vehicle Count Overlay */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="text-white text-sm">
              <div className="font-semibold mb-1">Vehicle Count</div>
              <div className="text-2xl font-bold text-blue-400">{vehicleCount}</div>
              <div className="text-xs text-gray-300">Last updated: now</div>
            </div>
          </div>

          {/* Simulated Road with Moving Elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl text-gray-600">🛣️</div>
          </div>
          
          {/* Detection Boxes Simulation */}
          <div className="absolute bottom-1/3 left-1/4 w-8 h-6 border-2 border-red-500 bg-red-500/10 rounded animate-pulse">
            <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">Car</div>
          </div>
          
          <div className="absolute bottom-1/2 right-1/3 w-12 h-8 border-2 border-blue-500 bg-blue-500/10 rounded">
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded">Truck</div>
          </div>
        </div>

        {/* Feed Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              Emergency Alert
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
              Take Screenshot
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Resolution: 4K</span>
            <span>•</span>
            <span>FPS: 30</span>
            <span>•</span>
            <span className="text-green-400">Signal: Strong</span>
          </div>
        </div>
      </div>
    </div>
  );
};