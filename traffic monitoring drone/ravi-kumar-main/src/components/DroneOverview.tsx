import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { MapPin, Activity, AlertTriangle, Car, Truck, Bus, Bike } from 'lucide-react';

export default function DroneOverview() {
  const { drones, totalVehicles, activeAccidents } = useTraffic();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Vehicles</p>
              <p className="text-2xl font-bold text-white">{totalVehicles}</p>
            </div>
            <Car className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Drones</p>
              <p className="text-2xl font-bold text-white">{drones.filter(d => d.status === 'online').length}</p>
            </div>
            <Activity className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Incidents</p>
              <p className="text-2xl font-bold text-white">{activeAccidents}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Coverage Areas</p>
              <p className="text-2xl font-bold text-white">{drones.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Drone Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {drones.map((drone) => (
          <div key={drone.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(drone.status)} animate-pulse`}></div>
                <h3 className="text-lg font-semibold text-white">{drone.id}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                drone.status === 'online' ? 'bg-green-900 text-green-300' :
                drone.status === 'offline' ? 'bg-red-900 text-red-300' :
                'bg-yellow-900 text-yellow-300'
              }`}>
                {drone.status.toUpperCase()}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {drone.location}
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Congestion Level:</span>
                <span className={`font-medium capitalize ${getCongestionColor(drone.congestionLevel)}`}>
                  {drone.congestionLevel}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Cars</p>
                    <p className="font-semibold text-white">{drone.vehicleCount.cars}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-orange-400" />
                  <div>
                    <p className="text-xs text-gray-400">Trucks</p>
                    <p className="font-semibold text-white">{drone.vehicleCount.trucks}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Bus className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Buses</p>
                    <p className="font-semibold text-white">{drone.vehicleCount.buses}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Bike className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-400">Bikes</p>
                    <p className="font-semibold text-white">{drone.vehicleCount.bikes}</p>
                  </div>
                </div>
              </div>
              
              {drone.accidents > 0 && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">
                      {drone.accidents} Active Incident{drone.accidents > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}