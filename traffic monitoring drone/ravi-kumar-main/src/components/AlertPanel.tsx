import React from 'react';
import { useTraffic } from '../context/TrafficContext';
import { AlertTriangle, CheckCircle, Clock, MapPin, Phone, Ambulance } from 'lucide-react';

export default function AlertPanel() {
  const { alerts, resolveAlert } = useTraffic();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'accident': return <AlertTriangle className="h-5 w-5" />;
      case 'congestion': return <Clock className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (priority: string, resolved: boolean) => {
    if (resolved) return 'border-green-700 bg-green-900/20';
    switch (priority) {
      case 'high': return 'border-red-700 bg-red-900/20';
      case 'medium': return 'border-yellow-700 bg-yellow-900/20';
      case 'low': return 'border-blue-700 bg-blue-900/20';
      default: return 'border-gray-700 bg-gray-900/20';
    }
  };

  const getTextColor = (priority: string, resolved: boolean) => {
    if (resolved) return 'text-green-400';
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Alert Management</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">{activeAlerts.length} Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-300">{resolvedAlerts.length} Resolved</span>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Active Alerts</h3>
        <div className="space-y-4">
          {activeAlerts.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">No active alerts. All systems operating normally.</p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 rounded-xl border ${getAlertColor(alert.priority, alert.resolved)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`${getTextColor(alert.priority, alert.resolved)} mt-1`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-white font-semibold capitalize">{alert.type} Alert</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.priority === 'high' ? 'bg-red-900 text-red-300' :
                          alert.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{alert.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.type === 'accident' && (
                      <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all text-sm">
                        <Ambulance className="h-4 w-4" />
                        <span>Emergency</span>
                      </button>
                    )}
                    <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-sm">
                      <Phone className="h-4 w-4" />
                      <span>Contact</span>
                    </button>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Resolve</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recently Resolved</h3>
          <div className="space-y-4">
            {resolvedAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${getAlertColor(alert.priority, alert.resolved)} opacity-60`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-green-400">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium capitalize">{alert.type} Alert - Resolved</h4>
                      <span className="text-gray-400 text-sm">{formatTime(alert.timestamp)}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{alert.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}