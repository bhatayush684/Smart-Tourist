import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Clock, 
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Radio,
  Car,
  Phone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Alert {
  id: string;
  type: 'emergency' | 'medical' | 'security' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  touristName?: string;
  touristId?: string;
}

interface Tourist {
  id: string;
  name: string;
  nationality: string;
  location: string;
  status: 'safe' | 'at_risk' | 'emergency';
  lastSeen: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const PoliceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'emergency',
      severity: 'critical',
      title: 'Tourist Emergency Alert',
      description: 'Tourist reported missing in Old Delhi area',
      location: 'Chandni Chowk, Old Delhi',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'active',
      touristName: 'John Smith',
      touristId: 'T001'
    },
    {
      id: '2',
      type: 'medical',
      severity: 'high',
      title: 'Medical Emergency',
      description: 'Tourist collapsed at Red Fort',
      location: 'Red Fort, Delhi',
      timestamp: '2024-01-15T13:45:00Z',
      status: 'investigating',
      touristName: 'Maria Garcia',
      touristId: 'T002'
    },
    {
      id: '3',
      type: 'suspicious',
      severity: 'medium',
      title: 'Suspicious Activity',
      description: 'Unusual crowd gathering reported',
      location: 'India Gate',
      timestamp: '2024-01-15T12:15:00Z',
      status: 'active'
    }
  ]);

  const [tourists, setTourists] = useState<Tourist[]>([
    {
      id: 'T001',
      name: 'John Smith',
      nationality: 'USA',
      location: 'Chandni Chowk',
      status: 'emergency',
      lastSeen: '2 hours ago',
      riskLevel: 'high'
    },
    {
      id: 'T002',
      name: 'Maria Garcia',
      nationality: 'Spain',
      location: 'Red Fort',
      status: 'at_risk',
      lastSeen: '30 minutes ago',
      riskLevel: 'medium'
    },
    {
      id: 'T003',
      name: 'David Wilson',
      nationality: 'UK',
      location: 'Connaught Place',
      status: 'safe',
      lastSeen: '5 minutes ago',
      riskLevel: 'low'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'at_risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAlertAction = (alertId: string, action: 'investigate' | 'resolve') => {
    setActiveAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === 'investigate' ? 'investigating' : 'resolved' }
        : alert
    ));
  };

  const filteredTourists = tourists.filter(tourist =>
    tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              Police Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, Officer {user?.name} • Badge: {user?.badgeNumber} • {user?.department}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Radio className="w-3 h-3 mr-1" />
              On Duty
            </Badge>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Phone className="w-4 h-4 mr-2" />
              Emergency Dispatch
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Active Alerts</p>
                  <p className="text-3xl font-bold">{activeAlerts.filter(a => a.status === 'active').length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Under Investigation</p>
                  <p className="text-3xl font-bold">{activeAlerts.filter(a => a.status === 'investigating').length}</p>
                </div>
                <Eye className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tourists Monitored</p>
                  <p className="text-3xl font-bold">{tourists.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Resolved Today</p>
                  <p className="text-3xl font-bold">{activeAlerts.filter(a => a.status === 'resolved').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
            <TabsTrigger value="tourists">Tourist Monitoring</TabsTrigger>
            <TabsTrigger value="patrol">Patrol Routes</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Active Emergency Alerts
                </CardTitle>
                <CardDescription>
                  Real-time alerts requiring immediate police attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{alert.type}</span>
                        </div>
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <p className="text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {alert.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          {alert.touristName && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {alert.touristName} ({alert.touristId})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAlertAction(alert.id, 'investigate')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Investigate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, 'resolve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tourists" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Tourist Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time tracking and status of tourists in your jurisdiction
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tourists by name, ID, or nationality..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTourists.map((tourist) => (
                    <div key={tourist.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{tourist.name}</h3>
                            <Badge variant="outline">{tourist.nationality}</Badge>
                            <Badge className={getStatusColor(tourist.status)}>
                              {tourist.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {tourist.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Last seen: {tourist.lastSeen}
                            </span>
                            <span>Risk Level: {tourist.riskLevel}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MapPin className="w-4 h-4 mr-1" />
                            Track Location
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patrol" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-green-500" />
                  Patrol Routes & Assignments
                </CardTitle>
                <CardDescription>
                  Manage patrol routes and officer assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Patrol Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Patrol route management and GPS tracking features will be available here.
                  </p>
                  <Button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                    Configure Patrol Routes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PoliceDashboard;
 