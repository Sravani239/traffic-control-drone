import React, { useState } from 'react';
import Header from './Header';
import DroneOverview from './DroneOverview';
import LiveFeed from './LiveFeed';
import AlertPanel from './AlertPanel';
import TrafficLights from './TrafficLights';
import Analytics from './Analytics';

type TabType = 'overview' | 'live' | 'alerts' | 'lights' | 'analytics';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '🎯' },
    { id: 'live' as TabType, label: 'Live Feed', icon: '📹' },
    { id: 'alerts' as TabType, label: 'Alerts', icon: '🚨' },
    { id: 'lights' as TabType, label: 'Traffic Lights', icon: '🚦' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: '📊' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DroneOverview />;
      case 'live':
        return <LiveFeed />;
      case 'alerts':
        return <AlertPanel />;
      case 'lights':
        return <TrafficLights />;
      case 'analytics':
        return <Analytics />;
      default:
        return <DroneOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}