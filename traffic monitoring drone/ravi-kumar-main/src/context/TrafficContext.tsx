import React, { createContext, useContext, useState, useEffect } from 'react';

interface DroneData {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  vehicleCount: {
    cars: number;
    trucks: number;
    buses: number;
    bikes: number;
  };
  accidents: number;
  congestionLevel: 'low' | 'medium' | 'high';
}

interface Alert {
  id: string;
  type: 'accident' | 'congestion' | 'maintenance';
  location: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  resolved: boolean;
}

interface TrafficLight {
  id: string;
  location: string;
  currentPhase: 'red' | 'yellow' | 'green';
  timeRemaining: number;
  mode: 'manual' | 'auto' | 'smart';
}

interface TrafficContextType {
  drones: DroneData[];
  alerts: Alert[];
  trafficLights: TrafficLight[];
  totalVehicles: number;
  activeAccidents: number;
  resolveAlert: (id: string) => void;
  updateTrafficLight: (id: string, mode: 'manual' | 'auto' | 'smart') => void;
}

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export function TrafficProvider({ children }: { children: React.ReactNode }) {
  const [drones, setDrones] = useState<DroneData[]>([
    {
      id: 'DRONE_01',
      location: 'Highway 101 - Main Junction',
      latitude: 37.7749,
      longitude: -122.4194,
      status: 'online',
      vehicleCount: { cars: 45, trucks: 8, buses: 3, bikes: 12 },
      accidents: 0,
      congestionLevel: 'medium'
    },
    {
      id: 'DRONE_02', 
      location: 'Downtown Bridge',
      latitude: 37.7849,
      longitude: -122.4094,
      status: 'online',
      vehicleCount: { cars: 67, trucks: 12, buses: 5, bikes: 8 },
      accidents: 1,
      congestionLevel: 'high'
    },
    {
      id: 'DRONE_03',
      location: 'Airport Access Road',
      latitude: 37.7649,
      longitude: -122.4294,
      status: 'offline',
      vehicleCount: { cars: 23, trucks: 15, buses: 7, bikes: 4 },
      accidents: 0,
      congestionLevel: 'low'
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'accident',
      location: 'Downtown Bridge',
      message: 'Vehicle collision detected - Emergency services dispatched',
      timestamp: new Date(Date.now() - 5 * 60000),
      priority: 'high',
      resolved: false
    },
    {
      id: '2',
      type: 'congestion',
      location: 'Highway 101 - Main Junction',
      message: 'Heavy traffic congestion detected',
      timestamp: new Date(Date.now() - 15 * 60000),
      priority: 'medium',
      resolved: false
    }
  ]);

  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([
    {
      id: 'TL_001',
      location: 'Highway 101 & Oak St',
      currentPhase: 'green',
      timeRemaining: 45,
      mode: 'smart'
    },
    {
      id: 'TL_002',
      location: 'Downtown Bridge Entry',
      currentPhase: 'red',
      timeRemaining: 30,
      mode: 'manual'
    },
    {
      id: 'TL_003',
      location: 'Airport Access & Main',
      currentPhase: 'yellow',
      timeRemaining: 5,
      mode: 'auto'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update drone data
      setDrones(prev => prev.map(drone => ({
        ...drone,
        vehicleCount: {
          cars: Math.max(0, drone.vehicleCount.cars + Math.floor(Math.random() * 10 - 5)),
          trucks: Math.max(0, drone.vehicleCount.trucks + Math.floor(Math.random() * 4 - 2)),
          buses: Math.max(0, drone.vehicleCount.buses + Math.floor(Math.random() * 2 - 1)),
          bikes: Math.max(0, drone.vehicleCount.bikes + Math.floor(Math.random() * 6 - 3))
        }
      })));

      // Update traffic lights
      setTrafficLights(prev => prev.map(light => {
        const newTime = Math.max(0, light.timeRemaining - 1);
        if (newTime === 0) {
          const phases: ('red' | 'yellow' | 'green')[] = ['red', 'yellow', 'green'];
          const currentIndex = phases.indexOf(light.currentPhase);
          const nextPhase = phases[(currentIndex + 1) % phases.length];
          return {
            ...light,
            currentPhase: nextPhase,
            timeRemaining: nextPhase === 'green' ? 60 : nextPhase === 'red' ? 45 : 5
          };
        }
        return { ...light, timeRemaining: newTime };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalVehicles = drones.reduce((total, drone) => 
    total + Object.values(drone.vehicleCount).reduce((sum, count) => sum + count, 0), 0
  );

  const activeAccidents = alerts.filter(alert => alert.type === 'accident' && !alert.resolved).length;

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  const updateTrafficLight = (id: string, mode: 'manual' | 'auto' | 'smart') => {
    setTrafficLights(prev => prev.map(light => 
      light.id === id ? { ...light, mode } : light
    ));
  };

  const value = {
    drones,
    alerts,
    trafficLights,
    totalVehicles,
    activeAccidents,
    resolveAlert,
    updateTrafficLight
  };

  return <TrafficContext.Provider value={value}>{children}</TrafficContext.Provider>;
}

export function useTraffic() {
  const context = useContext(TrafficContext);
  if (context === undefined) {
    throw new Error('useTraffic must be used within a TrafficProvider');
  }
  return context;
}