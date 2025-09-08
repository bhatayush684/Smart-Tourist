import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Eye, 
  EyeOff,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Download,
  Trash2,
  Archive
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  source: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  tourist?: {
    id: string;
    name: string;
    nationality: string;
  };
  device?: {
    id: string;
    type: string;
    battery: number;
  };
  actions?: Array<{
    id: string;
    label: string;
    action: () => void;
    variant: 'default' | 'destructive' | 'outline';
  }>;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency' | 'warning'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateMockNotifications = (): Notification[] => {
      const types: Notification['type'][] = ['emergency', 'warning', 'info', 'success'];
      const priorities: Notification['priority'][] = ['high', 'medium', 'low'];
      const sources = ['IoT Device', 'Tourist App', 'Admin Panel', 'System Monitor', 'Emergency Services'];
      
      return Array.from({ length: 25 }, (_, i) => ({
        id: `notification-${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        title: `Notification ${i + 1}`,
        message: `This is a sample notification message for testing purposes. It contains important information about the tourist safety platform.`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: Math.random() > 0.3,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        location: Math.random() > 0.5 ? {
          lat: 28.6139 + (Math.random() - 0.5) * 0.1,
          lng: 77.2090 + (Math.random() - 0.5) * 0.1,
          address: `Location ${i + 1}, Delhi, India`
        } : undefined,
        tourist: Math.random() > 0.4 ? {
          id: `tourist-${i + 1}`,
          name: `Tourist ${i + 1}`,
          nationality: ['India', 'USA', 'UK', 'Germany', 'France'][Math.floor(Math.random() * 5)]
        } : undefined,
        device: Math.random() > 0.3 ? {
          id: `device-${i + 1}`,
          type: ['Smart Band', 'GPS Tracker', 'Health Monitor'][Math.floor(Math.random() * 3)],
          battery: Math.floor(Math.random() * 100)
        } : undefined,
        actions: [
          {
            id: 'view',
            label: 'View Details',
            action: () => console.log('View details'),
            variant: 'outline' as const
          },
          {
            id: 'dismiss',
            label: 'Dismiss',
            action: () => console.log('Dismiss'),
            variant: 'default' as const
          }
        ]
      }));
    };

    setNotifications(generateMockNotifications());
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate new notifications
    const newNotification: Notification = {
      id: `notification-${Date.now()}`,
      type: 'info',
      title: 'New System Update',
      message: 'A new system update is available for the tourist safety platform.',
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: 'medium',
      source: 'System Monitor',
      actions: [
        {
          id: 'view',
          label: 'View Details',
          action: () => console.log('View details'),
          variant: 'outline' as const
        }
      ]
    };
    setNotifications(prev => [newNotification, ...prev]);
    setIsRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'emergency': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    emergency: notifications.filter(n => n.type === 'emergency').length,
    warning: notifications.filter(n => n.type === 'warning').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notification Center</h2>
          <p className="text-muted-foreground">Real-time alerts and system notifications</p>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Mark All Read
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <EyeOff className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emergency</p>
                <p className="text-2xl font-bold text-red-600">{stats.emergency}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'unread', 'emergency', 'warning'] as const).map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterType)}
            className="capitalize"
          >
            {filterType === 'all' ? 'All Notifications' : filterType}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`transition-all duration-300 hover:shadow-lg ${
              !notification.isRead ? 'ring-2 ring-primary/20' : ''
            } ${getTypeColor(notification.type)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <Badge className={`${getPriorityColor(notification.priority)} border-0 text-xs`}>
                        {notification.priority}
                      </Badge>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{notification.source}</span>
                      {notification.tourist && (
                        <>
                          <span>•</span>
                          <span>{notification.tourist.name} ({notification.tourist.nationality})</span>
                        </>
                      )}
                      {notification.device && (
                        <>
                          <span>•</span>
                          <span>{notification.device.type} ({notification.device.battery}%)</span>
                        </>
                      )}
                    </div>

                    {notification.location && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>📍 {notification.location.address}</span>
                      </div>
                    )}

                    {notification.actions && (
                      <div className="flex items-center space-x-2 pt-2">
                        {notification.actions.map((action) => (
                          <Button
                            key={action.id}
                            variant={action.variant}
                            size="sm"
                            onClick={action.action}
                            className="h-7 px-3 text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'You have no notifications at the moment.' 
                : `No ${filter} notifications found.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationSystem;
