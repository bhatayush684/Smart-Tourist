import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  Wifi, 
  IdCard,
  Users,
  AlertTriangle,
  MapPin,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  Globe,
  BarChart3,
  CheckCircle,
  Heart,
  Battery,
  Signal,
  Eye,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  XCircle
} from 'lucide-react';
import heroImage from '@/assets/hero-banner.jpg';
import ActivityFeed from '@/components/ActivityFeed';
import StatsChart from '@/components/StatsChart';
import WeatherWidget from '@/components/WeatherWidget';
import NotificationPanel from '@/components/NotificationPanel';
import QuickActions from '@/components/QuickActions';
import IoTMonitor from '@/components/IoTMonitor';
import TouristManagement from '@/components/TouristManagement';
import NotificationSystem from '@/components/NotificationSystem';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'iot' | 'tourists' | 'notifications'>('overview');
  const [systemStatus, setSystemStatus] = useState({
    uptime: '99.9%',
    responseTime: '142ms',
    activeConnections: 8934,
    dataProcessed: '2.4TB',
    safetyScore: 92,
    activeTourists: 1247,
    activeDevices: 2156,
    criticalAlerts: 3
  });

  const [touristStats, setTouristStats] = useState({
    total: 1247,
    active: 1156,
    atRisk: 23,
    safe: 1133
  });

  const [deviceStats, setDeviceStats] = useState({
    total: 2156,
    online: 2103,
    offline: 53,
    batteryLow: 12
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        responseTime: `${Math.floor(Math.random() * 100 + 100)}ms`,
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 10 - 5)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSystemStatus(prev => ({
      ...prev,
      safetyScore: Math.floor(Math.random() * 20) + 80,
      activeTourists: Math.floor(Math.random() * 100) + 1200,
      activeDevices: Math.floor(Math.random() * 300) + 2000,
      criticalAlerts: Math.floor(Math.random() * 5)
    }));
    setIsRefreshing(false);
  };

  const quickStats = [
    {
      label: 'Active Tourists',
      value: systemStatus.activeTourists.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      trend: 'up' as const,
      change: '+12%'
    },
    {
      label: 'IoT Devices',
      value: systemStatus.activeDevices.toLocaleString(),
      icon: Smartphone,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      trend: 'up' as const,
      change: '+8%'
    },
    {
      label: 'Critical Alerts',
      value: systemStatus.criticalAlerts,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      trend: 'down' as const,
      change: '-3%'
    },
    {
      label: 'System Uptime',
      value: systemStatus.uptime,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      trend: 'up' as const,
      change: '+0.1%'
    }
  ];

  const systemMetrics = [
    { label: 'Response Time', value: systemStatus.responseTime, icon: Zap, color: 'text-green-500' },
    { label: 'Active Connections', value: systemStatus.activeConnections.toLocaleString(), icon: Wifi, color: 'text-blue-500' },
    { label: 'Data Processed', value: systemStatus.dataProcessed, icon: Globe, color: 'text-purple-500' },
    { label: 'Safety Score', value: `${systemStatus.safetyScore}%`, icon: Shield, color: 'text-orange-500' }
  ];

  const modules = [
    {
      id: 'tourist-management',
      title: 'Tourist Management',
      description: 'Monitor and manage tourist registrations, locations, and safety status',
      stats: '1,247 Active Tourists',
      features: ['Real-time tracking', 'Emergency alerts', 'Profile management', 'Safety reports'],
      path: '/tourists',
      icon: Users,
      variant: 'default' as const
    },
    {
      id: 'iot-monitoring',
      title: 'IoT Device Monitoring',
      description: 'Monitor IoT devices, sensors, and equipment health status',
      stats: '2,156 Connected Devices',
      features: ['Device health', 'Battery monitoring', 'Signal strength', 'Maintenance alerts'],
      path: '/iot',
      icon: Smartphone,
      variant: 'secondary' as const
    },
    {
      id: 'emergency-response',
      title: 'Emergency Response',
      description: 'Handle emergency situations and coordinate rescue operations',
      stats: '3 Active Alerts',
      features: ['Alert management', 'Response coordination', 'Location tracking', 'Communication'],
      path: '/emergency',
      icon: AlertTriangle,
      variant: 'destructive' as const
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'Generate insights and reports on tourist safety metrics',
      stats: '99.9% Uptime',
      features: ['Performance metrics', 'Safety trends', 'Custom reports', 'Data export'],
      path: '/analytics',
      icon: BarChart3,
      variant: 'outline' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your tourist safety platform today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="secondary" className="gap-2">
              <Clock className="w-3 h-3" />
              {currentTime.toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeView === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('overview')}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </Button>
          <Button
            variant={activeView === 'iot' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('iot')}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            IoT Monitor
          </Button>
          <Button
            variant={activeView === 'tourists' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('tourists')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Tourists
          </Button>
          <Button
            variant={activeView === 'notifications' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('notifications')}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </Button>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero shadow-government">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Tourist Safety Platform" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
          </div>
          <div className="relative z-10 p-8 md:p-12">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-primary-foreground animate-pulse-slow" />
                <span className="text-sm text-primary-foreground/90 font-medium">
                  Government of India • Ministry of Tourism
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-display text-primary-foreground mb-4 animate-slide-up">
                Tourist Safety Platform
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/90 mb-6 max-w-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Ensuring tourist safety through digital innovation, real-time monitoring, 
                and seamless government integration.
              </p>
              <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <Button variant="secondary" size="lg" className="shadow-card-custom font-medium">
                  <Shield className="w-5 h-5" />
                  Get Started
                </Button>
                <Button variant="outline" size="lg" className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                  <Activity className="w-5 h-5" />
                  View Analytics
                </Button>
              </div>
            </div>
            
            {/* Real-time system status */}
            <div className="mt-8 p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl border border-primary-foreground/20">
              <div className="flex items-center justify-between text-primary-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-safety rounded-full animate-pulse"></div>
                  <span className="text-sm">System Status: All systems operational</span>
                </div>
                <span className="text-sm font-mono">
                  {currentTime.toLocaleTimeString('en-IN')} IST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Content Rendering */}
        {activeView === 'overview' && (
          <>
            {/* Quick Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card 
                    key={index} 
                    className="group shadow-card-custom border-card-border hover:shadow-glow transition-all duration-300 animate-scale-in hover:scale-105"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                        <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                          {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold font-display">{stat.value}</p>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={stat.trend === 'up' ? 75 : 25} 
                            className="h-2 flex-1"
                          />
                          <span className="text-xs text-muted-foreground">vs yesterday</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Safety Score Card */}
            <Card className="shadow-government animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-display">
                  <Heart className="w-6 h-6 text-red-500" />
                  <span>Overall Safety Score</span>
                  <Badge variant="outline" className="ml-auto">
                    Real-time
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-4xl font-bold text-foreground">
                        {systemStatus.safetyScore}%
                      </div>
                      <Badge variant={systemStatus.safetyScore >= 90 ? 'default' : systemStatus.safetyScore >= 70 ? 'secondary' : 'destructive'}>
                        {systemStatus.safetyScore >= 90 ? 'Excellent' : systemStatus.safetyScore >= 70 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on active tourists, device health, and incident reports
                    </p>
                  </div>
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - systemStatus.safetyScore / 100)}`}
                        className="text-primary transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Performance Metrics */}
            <Card className="shadow-government animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 font-display">
                  <Activity className="w-6 h-6 text-primary" />
                  <span>System Performance Metrics</span>
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="w-2 h-2 bg-safety rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Live</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {systemMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <div 
                        key={index} 
                        className="text-center p-4 bg-secondary/30 rounded-xl animate-bounce-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${metric.color}`} />
                        <p className="text-lg font-bold font-display">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="animate-slide-in-right">
                <ActivityFeed />
              </div>
              <div className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                <NotificationPanel />
              </div>
              <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <WeatherWidget />
              </div>
              <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                <QuickActions />
              </div>
            </div>

            {/* Charts Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <StatsChart />
            </div>

            {/* Main Modules */}
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-3xl font-bold font-display mb-6 flex items-center space-x-3">
                <span>Platform Modules</span>
                <div className="h-1 flex-1 bg-gradient-primary rounded-full opacity-20"></div>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {modules.map((module, index) => {
                  const Icon = module.icon;
                  return (
                    <Card 
                      key={module.id} 
                      className="shadow-card-custom border-card-border hover:shadow-glow transition-all duration-300 group animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-display">{module.title}</CardTitle>
                            <CardDescription className="text-base">
                              {module.description}
                            </CardDescription>
                            <div className="mt-2 text-sm font-medium text-primary">
                              {module.stats}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          {module.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Link to={module.path} className="block">
                          <Button 
                            variant={module.variant} 
                            className="w-full group-hover:scale-[1.02] transition-transform" 
                            size="lg"
                          >
                            Access Module
                            <Icon className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Security Notice */}
            <Card className="bg-gradient-surface border-primary/20 shadow-government animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <CardContent className="p-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl font-display mb-2">Secure & Compliant Platform</h3>
                    <p className="text-muted-foreground mb-4">
                      This platform follows government security protocols and data privacy standards. 
                      All tourist data is encrypted and stored securely with blockchain verification.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2 bg-safety/10 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 text-safety" />
                        <span className="text-sm">ISO 27001 Certified</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-safety/10 px-3 py-1 rounded-full">
                        <Shield className="w-4 h-4 text-safety" />
                        <span className="text-sm">End-to-End Encryption</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-safety/10 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 text-safety" />
                        <span className="text-sm">24/7 Monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeView === 'iot' && <IoTMonitor />}
        {activeView === 'tourists' && <TouristManagement />}
        {activeView === 'notifications' && <NotificationSystem />}
      </div>
    </div>
  );
};

export default Dashboard;