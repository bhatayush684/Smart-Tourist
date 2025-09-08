import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  Activity,
  Search,
  Download,
  Filter,
  Eye,
  FileText,
  Zap,
  Clock
} from 'lucide-react';

interface Tourist {
  id: string;
  name: string;
  nationality: string;
  safetyScore: number;
  lastLocation: string;
  status: 'safe' | 'warning' | 'alert';
  lastSeen: string;
  alerts: number;
}

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [tourists] = useState<Tourist[]>([
    {
      id: 'TST-2024-INB-7829',
      name: 'John Smith',
      nationality: 'USA',
      safetyScore: 87,
      lastLocation: 'India Gate, New Delhi',
      status: 'safe',
      lastSeen: '2 minutes ago',
      alerts: 0
    },
    {
      id: 'TST-2024-INB-7830',
      name: 'Emma Johnson',
      nationality: 'UK',
      safetyScore: 45,
      lastLocation: 'Chandni Chowk, Delhi',
      status: 'warning',
      lastSeen: '15 minutes ago',
      alerts: 2
    },
    {
      id: 'TST-2024-INB-7831',
      name: 'Robert Chen',
      nationality: 'Canada',
      safetyScore: 12,
      lastLocation: 'Unknown - Last seen: Karol Bagh',
      status: 'alert',
      lastSeen: '2 hours ago',
      alerts: 5
    },
    {
      id: 'TST-2024-INB-7832',
      name: 'Sofia Müller',
      nationality: 'Germany',
      safetyScore: 92,
      lastLocation: 'Red Fort, Delhi',
      status: 'safe',
      lastSeen: '5 minutes ago',
      alerts: 0
    },
  ]);

  const [realtimeAlerts] = useState([
    {
      id: 1,
      type: 'anomaly',
      message: 'Tourist Robert Chen - Sudden location drop-off detected',
      time: '2 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'geofence',
      message: 'Tourist Emma Johnson entered high-risk zone',
      time: '15 minutes ago',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'inactivity',
      message: 'Tourist John Smith - Prolonged inactivity (45 minutes)',
      time: '1 hour ago',
      severity: 'low'
    },
  ]);

  const stats = [
    { label: 'Total Active Tourists', value: '12,847', change: '+234 today', icon: Users, color: 'text-primary' },
    { label: 'High Risk Zones', value: '23', change: '2 new alerts', icon: MapPin, color: 'text-warning' },
    { label: 'Emergency Alerts', value: '8', change: 'Last 24 hours', icon: AlertTriangle, color: 'text-emergency' },
    { label: 'IoT Devices Online', value: '8,934', change: '99.2% uptime', icon: Activity, color: 'text-safety' },
  ];

  const filteredTourists = tourists.filter(tourist => {
    const matchesSearch = tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tourist.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || tourist.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-safety bg-safety/10 border-safety/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'alert': return 'text-emergency bg-emergency/10 border-emergency/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xl text-muted-foreground">Monitor and manage tourist safety in real-time</p>
          </div>
          <Button variant="government" size="lg">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-card-custom border-card-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Real-time Alerts */}
        <Card className="shadow-government border-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-warning" />
              <span>Real-time Anomaly Alerts</span>
            </CardTitle>
            <CardDescription>
              Live monitoring of tourist safety anomalies and geo-fencing violations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realtimeAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'bg-emergency/10 border-emergency' :
                    alert.severity === 'medium' ? 'bg-warning/10 border-warning' :
                    'bg-primary/10 border-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button variant="emergency" size="sm">
                        Generate E-FIR
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tourist Monitoring */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-primary" />
              <span>Tourist Monitoring</span>
            </CardTitle>
            <CardDescription>
              Real-time tracking of all registered tourists
            </CardDescription>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={selectedFilter === 'all' ? 'government' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={selectedFilter === 'safe' ? 'safety' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('safe')}
                >
                  Safe
                </Button>
                <Button 
                  variant={selectedFilter === 'warning' ? 'warning' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('warning')}
                >
                  Warning
                </Button>
                <Button 
                  variant={selectedFilter === 'alert' ? 'emergency' : 'outline'} 
                  size="sm"
                  onClick={() => setSelectedFilter('alert')}
                >
                  Alert
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTourists.map((tourist) => (
                <div 
                  key={tourist.id}
                  className="p-4 border rounded-lg hover:shadow-card-custom transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tourist.status)}`}>
                        {tourist.status.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{tourist.name}</h4>
                        <p className="text-sm text-muted-foreground">ID: {tourist.id}</p>
                        <p className="text-sm text-muted-foreground">Nationality: {tourist.nationality}</p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Safety Score:</span>
                        <span className={`font-bold ${
                          tourist.safetyScore >= 70 ? 'text-safety' :
                          tourist.safetyScore >= 40 ? 'text-warning' : 'text-emergency'
                        }`}>
                          {tourist.safetyScore}%
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Last seen: {tourist.lastSeen}</p>
                      {tourist.alerts > 0 && (
                        <p className="text-sm text-emergency font-medium">
                          {tourist.alerts} active alerts
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm">{tourist.lastLocation}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3" />
                        Track
                      </Button>
                      <Button variant="government" size="sm">
                        <FileText className="w-3 h-3" />
                        Details
                      </Button>
                      {tourist.status === 'alert' && (
                        <Button variant="emergency" size="sm">
                          Generate E-FIR
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Heatmap Placeholder */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-primary" />
              <span>Tourist Density Heatmap</span>
            </CardTitle>
            <CardDescription>
              Visual representation of tourist clusters and high-risk zones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive heatmap would be displayed here</p>
                <p className="text-sm text-muted-foreground">Shows real-time tourist locations and risk zones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;