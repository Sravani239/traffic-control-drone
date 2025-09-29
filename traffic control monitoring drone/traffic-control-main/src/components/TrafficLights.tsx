import React, { useState, useEffect } from 'react';
import { TrafficCone, Settings, PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';

interface TrafficLight {
  id: string;
  location: string;
  status: 'red' | 'yellow' | 'green';
  mode: 'auto' | 'manual' | 'emergency';
  timeRemaining: number;
  avgWaitTime: number;
  vehicleCount: number;
}

export const TrafficLights: React.FC = () => {
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([
    {
      id: 'tl-001',
      location: 'Highway Junction A1',
      status: 'green',
      mode: 'auto',
      timeRemaining: 45,
      avgWaitTime: 120,
      vehicleCount: 15
    },
    {
      id: 'tl-002',
      location: 'Downtown Intersection',
      status: 'red',
      mode: 'manual',
      timeRemaining: 30,
      avgWaitTime: 180,
      vehicleCount: 25
    },
    {
      id: 'tl-003',
      location: 'Airport Road Entry',
      status: 'yellow',
      mode: 'auto',
      timeRemaining: 5,
      avgWaitTime: 90,
      vehicleCount: 8
    },
    {
      id: 'tl-004',
      location: 'City Center Bridge',
      status: 'green',
      mode: 'emergency',
      timeRemaining: 60,
      avgWaitTime: 45,
      vehicleCount: 32
    }
  ]);

  // Simulate traffic light timing
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficLights(prev => prev.map(light => {
        if (light.mode === 'manual') return light;
        
        let newTimeRemaining = light.timeRemaining - 1;
        let newStatus = light.status;
        
        if (newTimeRemaining <= 0) {
          switch (light.status) {
            case 'green':
              newStatus = 'yellow';
              newTimeRemaining = 5;
              break;
            case 'yellow':
              newStatus = 'red';
              newTimeRemaining = 30;
              break;
            case 'red':
              newStatus = 'green';
              newTimeRemaining = light.mode === 'emergency' ? 90 : 45;
              break;
          }
        }
        
        return {
          ...light,
          status: newStatus,
          timeRemaining: newTimeRemaining,
          vehicleCount: Math.max(0, light.vehicleCount + (Math.random() > 0.5 ? 1 : -1))
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleModeChange = (lightId: string, newMode: 'auto' | 'manual' | 'emergency') => {
    setTrafficLights(prev => prev.map(light => 
      light.id === lightId ? { ...light, mode: newMode } : light
    ));
  };

  const handleManualControl = (lightId: string, newStatus: 'red' | 'yellow' | 'green') => {
    setTrafficLights(prev => prev.map(light => 
      light.id === lightId && light.mode === 'manual' 
        ? { ...light, status: newStatus, timeRemaining: 60 } 
        : light
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red': return 'text-red-500 bg-red-500/20';
      case 'yellow': return 'text-yellow-500 bg-yellow-500/20';
      case 'green': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'auto': return 'bg-blue-600';
      case 'manual': return 'bg-purple-600';
      case 'emergency': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-600 p-2 rounded-lg">
              <TrafficCone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Traffic Light Control</h2>
              <p className="text-gray-400">Smart signal management</p>
            </div>
          </div>
          
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Settings className="h-4 w-4" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Traffic Lights Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trafficLights.map((light) => (
            <div key={light.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              {/* Light Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">{light.location}</h3>
                  <p className="text-gray-400 text-sm">{light.id}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getModeColor(light.mode)}`}>
                    {light.mode.toUpperCase()}
                  </div>
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(light.status).split(' ')[1]}`}></div>
                </div>
              </div>

              {/* Traffic Light Visualization */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className={`w-6 h-6 rounded-full ${
                      light.status === 'red' ? 'bg-red-500' : 'bg-gray-600'
                    }`}></div>
                    <div className={`w-6 h-6 rounded-full ${
                      light.status === 'yellow' ? 'bg-yellow-500' : 'bg-gray-600'
                    }`}></div>
                    <div className={`w-6 h-6 rounded-full ${
                      light.status === 'green' ? 'bg-green-500' : 'bg-gray-600'
                    }`}></div>
                  </div>
                </div>
                
                <div className="ml-4 text-center">
                  <div className="text-2xl font-bold text-white">{light.timeRemaining}s</div>
                  <div className={`text-sm font-medium ${getStatusColor(light.status).split(' ')[0]}`}>
                    {light.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-gray-400">Vehicles</div>
                  <div className="text-white font-semibold">{light.vehicleCount}</div>
                </div>
                <div className="bg-gray-800/50 rounded p-3">
                  <div className="text-gray-400">Avg Wait</div>
                  <div className="text-white font-semibold">{light.avgWaitTime}s</div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                {/* Mode Selection */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Control Mode</label>
                  <select
                    value={light.mode}
                    onChange={(e) => handleModeChange(light.id, e.target.value as any)}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:border-blue-500"
                  >
                    <option value="auto">Automatic</option>
                    <option value="manual">Manual Control</option>
                    <option value="emergency">Emergency Mode</option>
                  </select>
                </div>

                {/* Manual Controls */}
                {light.mode === 'manual' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleManualControl(light.id, 'red')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                        light.status === 'red' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Red
                    </button>
                    <button
                      onClick={() => handleManualControl(light.id, 'yellow')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                        light.status === 'yellow' 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Yellow
                    </button>
                    <button
                      onClick={() => handleManualControl(light.id, 'green')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                        light.status === 'green' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Green
                    </button>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs transition-colors">
                    <RotateCcw className="h-3 w-3" />
                    <span>Optimize</span>
                  </button>
                  <button className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs transition-colors">
                    {light.mode === 'auto' ? <PauseCircle className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
                    <span>{light.mode === 'auto' ? 'Pause' : 'Resume'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* System-wide Controls */}
        <div className="mt-6 bg-gray-700/50 rounded-lg p-4 border border-gray-600">
          <h3 className="text-white font-medium mb-3">System-wide Controls</h3>
          <div className="flex flex-wrap gap-3">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Optimize All Signals
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Emergency Mode - All Red
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Rush Hour Protocol
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};