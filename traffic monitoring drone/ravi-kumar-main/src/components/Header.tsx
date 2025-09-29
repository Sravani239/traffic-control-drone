import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTraffic } from '../context/TrafficContext';
import { LogOut, User, Activity } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { totalVehicles, activeAccidents, drones } = useTraffic();

  const activeDrones = drones.filter(drone => drone.status === 'online').length;

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Traffic Control Center</h1>
              <p className="text-gray-400 text-sm">Real-time monitoring system</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300">{activeDrones}/{drones.length} Drones Online</span>
            </div>
            <div className="text-gray-300">
              <span className="font-medium">{totalVehicles}</span> Vehicles Tracked
            </div>
            {activeAccidents > 0 && (
              <div className="flex items-center space-x-2 bg-red-900/20 px-3 py-1 rounded-full">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400">{activeAccidents} Active Incident{activeAccidents > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-gray-300">
            <User className="h-5 w-5" />
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}