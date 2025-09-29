import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, Phone, CheckCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'accident' | 'congestion' | 'maintenance' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  message: string;
  timestamp: Date;
  status: 'active' | 'responding' | 'resolved';
  respondingUnits?: string[];
}

interface AlertsProps {
  expanded?: boolean;
}

export const Alerts: React.FC<AlertsProps> = ({ expanded = false }) => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'accident',
      severity: 'critical',
      location: 'Highway Junction A1, Lane 2',
      message: 'Multi-vehicle collision detected. Emergency services required.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'responding',
      respondingUnits: ['Ambulance-01', 'Police-03', 'Fire-12']
    },
    {
      id: '2',
      type: 'congestion',
      severity: 'high',
      location: 'Downtown Intersection',
      message: 'Heavy traffic congestion. Traffic light optimization recommended.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'active'
    },
    {
      id: '3',
      type: 'maintenance',
      severity: 'medium',
      location: 'Airport Road',
      message: 'Drone Gamma requiring maintenance. Camera malfunction detected.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'active'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('all');

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance every 10 seconds
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: ['accident', 'congestion', 'emergency'][Math.floor(Math.random() * 3)] as any,
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          location: ['City Center Bridge', 'Park Avenue', 'Industrial District'][Math.floor(Math.random() * 3)],
          message: 'New incident detected requiring attention.',
          timestamp: new Date(),
          status: 'active'
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Keep only 10 most recent
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleMarkResolved = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
    ));
  };

  const getAlertColor = (severity: string, type: string) => {
    if (severity === 'critical') return 'border-red-500 bg-red-500/10';
    if (severity === 'high') return 'border-orange-500 bg-orange-500/10';
    if (severity === 'medium') return 'border-yellow-500 bg-yellow-500/10';
    return 'border-blue-500 bg-blue-500/10';
  };

  const getAlertIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'accident': return <AlertTriangle className={`${iconClass} text-red-400`} />;
      case 'congestion': return <Clock className={`${iconClass} text-yellow-400`} />;
      case 'emergency': return <Phone className={`${iconClass} text-red-400`} />;
      default: return <AlertTriangle className={`${iconClass} text-blue-400`} />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const diff = Date.now() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${expanded ? 'col-span-full' : ''}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Active Alerts</h2>
              <p className="text-gray-400">Real-time incident monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {['all', 'active', 'critical'].map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Active Alerts</h3>
            <p className="text-gray-400">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getAlertColor(alert.severity, alert.type)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-semibold capitalize">{alert.type}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'critical' 
                            ? 'bg-red-600 text-white'
                            : alert.severity === 'high'
                            ? 'bg-orange-600 text-white'
                            : alert.severity === 'medium'
                            ? 'bg-yellow-600 text-black'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          alert.status === 'active'
                            ? 'bg-red-100 text-red-800'
                            : alert.status === 'responding'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.location}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={() => handleMarkResolved(alert.id)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-3">{alert.message}</p>
                
                {alert.respondingUnits && alert.respondingUnits.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-400 mb-2 block">Responding Units:</span>
                    <div className="flex flex-wrap gap-2">
                      {alert.respondingUnits.map((unit) => (
                        <span
                          key={unit}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                        >
                          {unit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {alert.severity === 'critical' && alert.status === 'active' && (
                  <div className="mt-3 flex space-x-2">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Dispatch Emergency
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};