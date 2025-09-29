import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Car, Truck, Bike, Bus } from 'lucide-react';

interface AnalyticsProps {
  expanded?: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({ expanded = false }) => {
  const [timeRange, setTimeRange] = useState('1h');
  const [vehicleData, setVehicleData] = useState({
    cars: 1250,
    trucks: 320,
    bikes: 180,
    buses: 45
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleData(prev => ({
        cars: prev.cars + Math.floor(Math.random() * 5) - 2,
        trucks: prev.trucks + Math.floor(Math.random() * 3) - 1,
        bikes: prev.bikes + Math.floor(Math.random() * 4) - 2,
        buses: prev.buses + Math.floor(Math.random() * 2) - 1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalVehicles = Object.values(vehicleData).reduce((sum, count) => sum + count, 0);

  const vehicleTypes = [
    { name: 'Cars', count: vehicleData.cars, icon: Car, color: 'bg-blue-500', percentage: (vehicleData.cars / totalVehicles) * 100 },
    { name: 'Trucks', count: vehicleData.trucks, icon: Truck, color: 'bg-orange-500', percentage: (vehicleData.trucks / totalVehicles) * 100 },
    { name: 'Bikes', count: vehicleData.bikes, icon: Bike, color: 'bg-green-500', percentage: (vehicleData.bikes / totalVehicles) * 100 },
    { name: 'Buses', count: vehicleData.buses, icon: Bus, color: 'bg-purple-500', percentage: (vehicleData.buses / totalVehicles) * 100 },
  ];

  const congestionData = [
    { location: 'Highway Junction A1', level: 85, status: 'high' },
    { location: 'Downtown Intersection', level: 45, status: 'medium' },
    { location: 'Airport Road', level: 20, status: 'low' },
    { location: 'City Center Bridge', level: 70, status: 'high' },
  ];

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${expanded ? 'col-span-full' : ''}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Traffic Analytics</h2>
              <p className="text-gray-400">Real-time vehicle statistics</p>
            </div>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Total Vehicle Count */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Total Vehicles Detected</h3>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{totalVehicles.toLocaleString()}</div>
          <div className="text-sm text-gray-400">
            <span className="text-green-400">+12.5%</span> from previous {timeRange}
          </div>
        </div>

        {/* Vehicle Type Breakdown */}
        <div>
          <h3 className="text-white font-semibold mb-4">Vehicle Type Distribution</h3>
          <div className="space-y-3">
            {vehicleTypes.map((vehicle) => {
              const Icon = vehicle.icon;
              return (
                <div key={vehicle.name} className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${vehicle.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{vehicle.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300 text-sm">{vehicle.percentage.toFixed(1)}%</span>
                        <span className="text-white font-semibold">{vehicle.count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${vehicle.color}`}
                        style={{ width: `${vehicle.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Congestion Levels */}
        <div>
          <h3 className="text-white font-semibold mb-4">Congestion Levels</h3>
          <div className="space-y-3">
            {congestionData.map((location) => (
              <div key={location.location} className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{location.location}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    location.status === 'high' 
                      ? 'bg-red-500 text-white' 
                      : location.status === 'medium' 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {location.level}% {location.status.toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      location.status === 'high' 
                        ? 'bg-red-500' 
                        : location.status === 'medium' 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${location.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};