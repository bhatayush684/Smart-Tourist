import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent: boolean;
}

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      title: 'Emergency Alert',
      message: 'Tourist Robert Chen has been inactive for 2 hours in Karol Bagh area',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      urgent: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'Geo-fence Violation',
      message: 'Emma Johnson entered high-risk zone at Chandni Chowk',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      urgent: false
    },
    {
      id: '3',
      type: 'info',
      title: 'System Update',
      message: 'Tourist tracking system updated with new safety algorithms',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      urgent: false
    },
    {
      id: '4',
      type: 'success',
      title: 'Safety Score Improved',
      message: 'Overall tourist safety score increased to 89% this week',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      urgent: false
    }
  ]);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotifications = [
        {
          type: 'info',
          title: 'New Tourist Registration',
          message: 'A new tourist has completed digital ID verification'
        },
        {
          type: 'warning',
          title: 'Weather Alert',
          message: 'Heavy rain predicted - tourism activities may be affected'
        },
        {
          type: 'success',
          title: 'Safety Milestone',
          message: 'Zero incidents reported in the last 24 hours'
        }
      ];

      const randomNotification = newNotifications[Math.floor(Math.random() * newNotifications.length)];
      
      const notification: Notification = {
        id: Date.now().toString(),
        type: randomNotification.type as Notification['type'],
        title: randomNotification.title,
        message: randomNotification.message,
        timestamp: new Date(),
        read: false,
        urgent: Math.random() > 0.7
      };

      setNotifications(prev => [notification, ...prev.slice(0, 9)]);

      // Play notification sound if enabled
      if (soundEnabled && !notification.read) {
        // In a real app, you would play an actual sound
        console.log('🔔 New notification sound');
      }
    }, 45000); // New notification every 45 seconds

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.urgent).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'alert': return 'text-emergency bg-emergency/10 border-emergency/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'success': return 'text-safety bg-safety/10 border-safety/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="h-full shadow-card-custom">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-primary" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emergency text-emergency-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </div>
              )}
            </div>
            <span className="font-display">Notifications</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 p-0"
            >
              {soundEnabled ? 
                <Volume2 className="w-4 h-4" /> : 
                <VolumeX className="w-4 h-4" />
              }
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        {urgentCount > 0 && (
          <div className="bg-emergency/10 border border-emergency/20 rounded-lg p-2">
            <p className="text-xs font-medium text-emergency">
              ⚠️ {urgentCount} urgent notification{urgentCount > 1 ? 's' : ''} requiring immediate attention
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-2 hover:bg-secondary/50 transition-all animate-slide-up ${
                      !notification.read ? 'bg-primary/5' : ''
                    } ${
                      notification.urgent ? 'border-l-emergency' : 'border-l-transparent'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${getNotificationColor(notification.type)}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                              {notification.urgent && (
                                <span className="ml-1 text-xs bg-emergency text-emergency-foreground px-1 rounded">
                                  URGENT
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTime(notification.timestamp)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" size="sm" className="w-full">
            Mark All as Read
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;