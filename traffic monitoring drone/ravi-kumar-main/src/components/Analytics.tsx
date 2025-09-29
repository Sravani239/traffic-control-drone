import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { BarChart3, TrendingUp, Clock, MapPin } from 'lucide-react';

export default function Analytics() {
  const { drones, alerts, totalVehicles } = useTraffic();

  // Generate mock analytics data
  const hourlyTraffic = [
    { hour: '00:00', vehicles: 45 },
    { hour: '06:00', vehicles: 120 },
    { hour: '08:00', vehicles: 280 },
    { hour: '12:00', vehicles: 190 },
    { hour: '17:00', vehicles: 320 },
    { hour: '20:00', vehicles: 150 },
  ];

  const vehicleTypes = [
    { type: 'Cars', count: drones.reduce((sum, drone) => sum + drone.vehicleCount.cars, 0), color: 'bg-blue-500' },
    { type: 'Trucks', count: drones.reduce((sum, drone) => sum + drone.vehicleCount.trucks, 0), color: 'bg-orange-500' },
    { type: 'Buses', count: drones.reduce((sum, drone) => sum + drone.vehicleCount.buses, 0), color: 'bg-green-500' },
    { type: 'Bikes', count: drones.reduce((sum, drone) => sum + drone.vehicleCount.bikes, 0), color: 'bg-purple-500' },
  ];

  const maxVehicles = Math.max(...vehicleTypes.map(v => v.count));

  const congestionAreas = drones.map(drone => ({
    location: drone.location,
    level: drone.congestionLevel,
    vehicles: Object.values(drone.vehicleCount).reduce((sum, count) => sum + count, 0)
  })).sort((a, b) => b.vehicles - a.vehicles);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Traffic Analytics</h2>
        <div className="flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Vehicles Today</p>
              <p className="text-2xl font-bold text-white">{totalVehicles * 12}</p>
              <p className="text-green-400 text-sm">+15% from yesterday</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Speed</p>
              <p className="text-2xl font-bold text-white">42 km/h</p>
              <p className="text-red-400 text-sm">-8% from yesterday</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Incidents Resolved</p>
              <p className="text-2xl font-bold text-white">{alerts.filter(a => a.resolved).length}</p>
              <p className="text-green-400 text-sm">Response: 4.2 min avg</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Coverage Areas</p>
              <p className="text-2xl font-bold text-white">{drones.length}</p>
              <p className="text-blue-400 text-sm">98.5% uptime</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Traffic Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Traffic by Hour</h3>
          <div className="space-y-4">
            {hourlyTraffic.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-gray-400 text-sm">{item.hour}</div>
                <div className="flex-1">
                  <div className="bg-slate-700 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(item.vehicles / 320) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-white text-sm font-medium text-right">{item.vehicles}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Vehicle Types</h3>
          <div className="space-y-4">
            {vehicleTypes.map((vehicle, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-4 w-4 rounded ${vehicle.color}`}></div>
                  <span className="text-gray-300">{vehicle.type}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-slate-700 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className={`${vehicle.color} h-full rounded-full transition-all duration-1000`}
                      style={{ width: `${(vehicle.count / maxVehicles) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium w-8 text-right">{vehicle.count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Vehicles:</span>
              <span className="text-white font-medium">{totalVehicles}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Congestion Hotspots */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Congestion Hotspots</h3>
        <div className="space-y-3">
          {congestionAreas.map((area, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-gray-400 font-medium">#{index + 1}</div>
                <div>
                  <p className="text-white font-medium">{area.location}</p>
                  <p className="text-gray-400 text-sm">{area.vehicles} vehicles detected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  area.level === 'high' ? 'bg-red-900 text-red-300' :
                  area.level === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-green-900 text-green-300'
                }`}>
                  {area.level.toUpperCase()}
                </span>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}