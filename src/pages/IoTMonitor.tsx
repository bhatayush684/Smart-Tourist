import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wifi, 
  Heart, 
  Activity,
  Thermometer,
  MapPin,
  Battery,
  AlertTriangle,
  Zap,
  Smartphone,
  Clock,
  Signal
} from 'lucide-react';

interface IoTDevice {
  id: string;
  touristName: string;
  deviceType: 'smartband' | 'tracker' | 'phone';
  batteryLevel: number;
  signalStrength: number;
  lastUpdate: string;
  status: 'active' | 'warning' | 'offline';
  vitals: {
    heartRate: number;
    temperature: number;
    steps: number;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
  };
}

const IoTMonitor = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([
    {
      id: 'SB-001-7829',
      touristName: 'John Smith',
      deviceType: 'smartband',
      batteryLevel: 78,
      signalStrength: 85,
      lastUpdate: '30 seconds ago',
      status: 'active',
      vitals: {
        heartRate: 72,
        temperature: 36.5,
        steps: 8429,
        location: {
          lat: 28.6139,
          lng: 77.2090,
          address: 'India Gate, New Delhi'
        }
      }
    },
    {
      id: 'TR-002-7830',
      touristName: 'Emma Johnson',
      deviceType: 'tracker',
      batteryLevel: 23,
      signalStrength: 45,
      lastUpdate: '2 minutes ago',
      status: 'warning',
      vitals: {
        heartRate: 95,
        temperature: 37.2,
        steps: 12456,
        location: {
          lat: 28.6562,
          lng: 77.2410,
          address: 'Chandni Chowk, Delhi'
        }
      }
    },
    {
      id: 'PH-003-7831',
      touristName: 'Robert Chen',
      deviceType: 'phone',
      batteryLevel: 0,
      signalStrength: 0,
      lastUpdate: '2 hours ago',
      status: 'offline',
      vitals: {
        heartRate: 0,
        temperature: 0,
        steps: 15623,
        location: {
          lat: 28.6448,
          lng: 77.2167,
          address: 'Last known: Karol Bagh'
        }
      }
    },
    {
      id: 'SB-004-7832',
      touristName: 'Sofia Müller',
      deviceType: 'smartband',
      batteryLevel: 92,
      signalStrength: 95,
      lastUpdate: '15 seconds ago',
      status: 'active',
      vitals: {
        heartRate: 68,
        temperature: 36.3,
        steps: 6234,
        location: {
          lat: 28.6562,
          lng: 77.2410,
          address: 'Red Fort, Delhi'
        }
      }
    }
  ]);

  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices => 
        prevDevices.map(device => ({
          ...device,
          vitals: {
            ...device.vitals,
            heartRate: device.status === 'active' ? 
              Math.max(60, Math.min(100, device.vitals.heartRate + (Math.random() - 0.5) * 4)) : 0,
            steps: device.status !== 'offline' ? device.vitals.steps + Math.floor(Math.random() * 3) : device.vitals.steps
          },
          lastUpdate: device.status === 'active' ? 'Just now' : device.lastUpdate
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartband': return Activity;
      case 'tracker': return MapPin;
      case 'phone': return Smartphone;
      default: return Wifi;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-safety bg-safety/10 border-safety/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'offline': return 'text-muted-foreground bg-muted/20 border-border';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-safety';
    if (level > 20) return 'text-warning';
    return 'text-emergency';
  };

  const activeDevices = devices.filter(d => d.status === 'active').length;
  const warningDevices = devices.filter(d => d.status === 'warning').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">IoT Device Monitor</h1>
            <p className="text-xl text-muted-foreground">Real-time monitoring of smart bands and tracking devices</p>
          </div>
          <Button variant="government" size="lg">
            <Zap className="w-4 h-4" />
            Send Test SOS
          </Button>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card-custom border-safety/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Devices</p>
                  <p className="text-3xl font-bold text-safety">{activeDevices}</p>
                </div>
                <Activity className="w-8 h-8 text-safety" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Warning Status</p>
                  <p className="text-3xl font-bold text-warning">{warningDevices}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom border-muted">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offline Devices</p>
                  <p className="text-3xl font-bold text-muted-foreground">{offlineDevices}</p>
                </div>
                <Wifi className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Monitored</p>
                  <p className="text-3xl font-bold text-primary">{devices.length}</p>
                </div>
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device List */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-6 h-6 text-primary" />
              <span>Connected IoT Devices</span>
            </CardTitle>
            <CardDescription>
              Real-time health and location monitoring from wearable devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {devices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.deviceType);
                return (
                  <Card 
                    key={device.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedDevice?.id === device.id ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-card-custom'
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <CardContent className="p-6">
                      {/* Device Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <DeviceIcon className="w-6 h-6 text-primary" />
                          <div>
                            <h4 className="font-semibold">{device.touristName}</h4>
                            <p className="text-sm text-muted-foreground">ID: {device.id}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(device.status)}`}>
                          {device.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Device Status */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Battery className={`w-4 h-4 ${getBatteryColor(device.batteryLevel)}`} />
                          <span className="text-sm">{device.batteryLevel}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Signal className="w-4 h-4 text-primary" />
                          <span className="text-sm">{device.signalStrength}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{device.lastUpdate}</span>
                        </div>
                      </div>

                      {/* Vitals */}
                      {device.status !== 'offline' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <Heart className={`w-5 h-5 mx-auto mb-1 ${
                                device.vitals.heartRate > 90 ? 'text-warning' : 'text-safety'
                              }`} />
                              <p className="text-sm font-medium">{device.vitals.heartRate}</p>
                              <p className="text-xs text-muted-foreground">BPM</p>
                            </div>
                            <div className="text-center">
                              <Thermometer className={`w-5 h-5 mx-auto mb-1 ${
                                device.vitals.temperature > 37 ? 'text-warning' : 'text-safety'
                              }`} />
                              <p className="text-sm font-medium">{device.vitals.temperature}°C</p>
                              <p className="text-xs text-muted-foreground">Temp</p>
                            </div>
                            <div className="text-center">
                              <Activity className="w-5 h-5 mx-auto mb-1 text-primary" />
                              <p className="text-sm font-medium">{device.vitals.steps.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Steps</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{device.vitals.location.address}</span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        {device.status === 'warning' && (
                          <Button variant="emergency" size="sm">
                            <Zap className="w-3 h-3" />
                            Send SOS
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Device Details */}
        {selectedDevice && (
          <Card className="shadow-government border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-primary" />
                <span>Device Details: {selectedDevice.touristName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Device Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Device Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Device ID:</span>
                      <span className="font-mono">{selectedDevice.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{selectedDevice.deviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        selectedDevice.status === 'active' ? 'text-safety' :
                        selectedDevice.status === 'warning' ? 'text-warning' : 'text-muted-foreground'
                      }`}>
                        {selectedDevice.status.charAt(0).toUpperCase() + selectedDevice.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Battery:</span>
                      <span className={getBatteryColor(selectedDevice.batteryLevel)}>
                        {selectedDevice.batteryLevel}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Signal Strength:</span>
                      <span>{selectedDevice.signalStrength}%</span>
                    </div>
                  </div>
                </div>

                {/* Health Monitoring */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Health Monitoring</h4>
                  {selectedDevice.status !== 'offline' ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-5 h-5 text-emergency" />
                            <span>Heart Rate</span>
                          </div>
                          <span className="text-lg font-bold">{selectedDevice.vitals.heartRate} BPM</span>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-5 h-5 text-warning" />
                            <span>Temperature</span>
                          </div>
                          <span className="text-lg font-bold">{selectedDevice.vitals.temperature}°C</span>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-primary" />
                            <span>Steps Today</span>
                          </div>
                          <span className="text-lg font-bold">{selectedDevice.vitals.steps.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wifi className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Device is offline - no health data available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setSelectedDevice(null)}>
                  Close Details
                </Button>
                <Button variant="government">
                  Export Data
                </Button>
                <Button variant="emergency">
                  <Zap className="w-4 h-4" />
                  Trigger SOS Test
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IoTMonitor;