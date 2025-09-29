import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { MapPin, Settings, Zap, Clock } from 'lucide-react';

export default function TrafficLights() {
  const { trafficLights, updateTrafficLight } = useTraffic();

  const getLightColor = (phase: string) => {
    switch (phase) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'smart': return 'text-purple-400 bg-purple-900/20';
      case 'auto': return 'text-blue-400 bg-blue-900/20';
      case 'manual': return 'text-orange-400 bg-orange-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'smart': return <Zap className="h-4 w-4" />;
      case 'auto': return <Clock className="h-4 w-4" />;
      case 'manual': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Traffic Light Control</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-purple-400" />
            <span className="text-gray-300">Smart AI Control</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {trafficLights.map((light) => (
          <div key={light.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{light.id}</h3>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getModeColor(light.mode)}`}>
                {getModeIcon(light.mode)}
                <span className="text-sm font-medium capitalize">{light.mode}</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-6 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {light.location}
            </p>
            
            {/* Traffic Light Visual */}
            <div className="flex justify-center mb-6">
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                <div className="space-y-3">
                  <div className={`h-8 w-8 rounded-full border-2 ${
                    light.currentPhase === 'red' 
                      ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50' 
                      : 'bg-red-900 border-red-800'
                  }`}></div>
                  <div className={`h-8 w-8 rounded-full border-2 ${
                    light.currentPhase === 'yellow' 
                      ? 'bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/50' 
                      : 'bg-yellow-900 border-yellow-800'
                  }`}></div>
                  <div className={`h-8 w-8 rounded-full border-2 ${
                    light.currentPhase === 'green' 
                      ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' 
                      : 'bg-green-900 border-green-800'
                  }`}></div>
                </div>
              </div>
            </div>
            
            {/* Status Info */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Current Phase</p>
                <p className={`text-lg font-bold capitalize ${
                  light.currentPhase === 'red' ? 'text-red-400' :
                  light.currentPhase === 'yellow' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {light.currentPhase}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {light.timeRemaining}s remaining
                </p>
              </div>
              
              {/* Mode Controls */}
              <div className="space-y-2">
                <p className="text-gray-400 text-sm font-medium">Control Mode:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateTrafficLight(light.id, 'manual')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      light.mode === 'manual'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => updateTrafficLight(light.id, 'auto')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      light.mode === 'auto'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => updateTrafficLight(light.id, 'smart')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      light.mode === 'smart'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    Smart
                  </button>
                </div>
              </div>
              
              {light.mode === 'smart' && (
                <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3 text-center">
                  <Zap className="h-5 w-5 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-400 text-sm font-medium">AI Optimization Active</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Adjusting timing based on traffic density
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* System Overview */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {trafficLights.filter(l => l.mode === 'smart').length}
            </div>
            <p className="text-gray-400 text-sm">Smart Control</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {trafficLights.filter(l => l.mode === 'auto').length}
            </div>
            <p className="text-gray-400 text-sm">Auto Mode</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {trafficLights.filter(l => l.mode === 'manual').length}
            </div>
            <p className="text-gray-400 text-sm">Manual Control</p>
          </div>
        </div>
      </div>
    </div>
  );
}