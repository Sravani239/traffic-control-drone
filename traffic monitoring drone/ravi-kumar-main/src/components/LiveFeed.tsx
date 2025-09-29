import React, { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { Play, Pause, Maximize, Camera, MapPin } from 'lucide-react';

export default function LiveFeed() {
  const { drones } = useTraffic();
  const [selectedDrone, setSelectedDrone] = useState(drones[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState(true);

  const activeDrone = drones.find(drone => drone.id === selectedDrone);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Live Drone Feeds</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedDrone}
            onChange={(e) => setSelectedDrone(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {drones.map((drone) => (
              <option key={drone.id} value={drone.id}>
                {drone.id} - {drone.location}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="aspect-video bg-slate-900 relative">
              {/* Simulated video feed */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto" />
                  <div className="space-y-2">
                    <p className="text-white text-lg font-semibold">Live Feed: {activeDrone?.id}</p>
                    <p className="text-gray-400">{activeDrone?.location}</p>
                  </div>
                </div>
              </div>
              
              {/* Simulated vehicle detection boxes */}
              <div className="absolute top-4 left-4 bg-green-500 bg-opacity-20 border-2 border-green-500 rounded w-16 h-10 flex items-center justify-center">
                <span className="text-green-400 text-xs font-bold">CAR</span>
              </div>
              <div className="absolute top-20 right-8 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded w-20 h-12 flex items-center justify-center">
                <span className="text-blue-400 text-xs font-bold">TRUCK</span>
              </div>
              <div className="absolute bottom-16 left-12 bg-purple-500 bg-opacity-20 border-2 border-purple-500 rounded w-12 h-8 flex items-center justify-center">
                <span className="text-purple-400 text-xs font-bold">BIKE</span>
              </div>
              
              {/* Status indicators */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">RECORDING</span>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 rounded px-3 py-2 text-white text-sm">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            {/* Controls */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all">
                  <Maximize className="h-4 w-4" />
                  <span>Fullscreen</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="text-sm">AI Detection Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">All Feeds</h3>
          <div className="space-y-3">
            {drones.map((drone) => (
              <button
                key={drone.id}
                onClick={() => setSelectedDrone(drone.id)}
                className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                  selectedDrone === drone.id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{drone.id}</span>
                  <div className={`h-2 w-2 rounded-full ${
                    drone.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>{drone.location}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Detection Stats */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-white font-medium mb-3">Current Detection</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cars:</span>
                <span className="text-white">{activeDrone?.vehicleCount.cars || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trucks:</span>
                <span className="text-white">{activeDrone?.vehicleCount.trucks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Buses:</span>
                <span className="text-white">{activeDrone?.vehicleCount.buses || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bikes:</span>
                <span className="text-white">{activeDrone?.vehicleCount.bikes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}