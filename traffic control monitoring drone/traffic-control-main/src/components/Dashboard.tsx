import React, { useState } from 'react';
import { Header } from './Header';
import { LiveFeed } from './LiveFeed';
import { Analytics } from './Analytics';
import { Alerts } from './Alerts';
import { TrafficLights } from './TrafficLights';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onLogout={onLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pt-16">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <LiveFeed />
              <Alerts />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Analytics />
              <TrafficLights />
            </div>
          </div>
        )}
        
        {activeTab === 'live-feed' && (
          <div className="p-6">
            <LiveFeed expanded />
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="p-6">
            <Analytics expanded />
          </div>
        )}
        
        {activeTab === 'alerts' && (
          <div className="p-6">
            <Alerts expanded />
          </div>
        )}
      </main>
    </div>
  );
};