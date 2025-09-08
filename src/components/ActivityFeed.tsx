import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  MapPin, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Wifi
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'login' | 'location' | 'alert' | 'safety' | 'iot';
  message: string;
  user: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'alert',
      message: 'Emergency alert triggered - Location: Chandni Chowk',
      user: 'Emma Johnson',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      priority: 'high'
    },
    {
      id: '2',
      type: 'safety',
      message: 'Safety score improved to 92%',
      user: 'John Smith',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      priority: 'low'
    },
    {
      id: '3',
      type: 'iot',
      message: 'Smart band connected successfully',
      user: 'Sofia Müller',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      priority: 'medium'
    },
    {
      id: '4',
      type: 'location',
      message: 'Entered geo-fence zone: India Gate',
      user: 'Robert Chen',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      priority: 'low'
    },
    {
      id: '5',
      type: 'login',
      message: 'Digital ID verified successfully',
      user: 'Maria Rodriguez',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      priority: 'medium'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: ['login', 'location', 'safety', 'iot'][Math.floor(Math.random() * 4)] as ActivityItem['type'],
        message: getRandomMessage(),
        user: getRandomUser(),
        timestamp: new Date(),
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as ActivityItem['priority']
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 15000); // Add new activity every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getRandomMessage = () => {
    const messages = [
      'Safety check completed',
      'Location updated successfully',
      'Geo-fence boundary crossed',
      'Health vitals recorded',
      'Emergency contact updated',
      'Digital ID refreshed'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomUser = () => {
    const users = ['John Doe', 'Alice Smith', 'Bob Wilson', 'Carol Brown', 'David Lee'];
    return users[Math.floor(Math.random() * users.length)];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'safety': return Shield;
      case 'location': return MapPin;
      case 'iot': return Wifi;
      default: return User;
    }
  };

  const getActivityColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-emergency';
    switch (type) {
      case 'alert': return 'text-warning';
      case 'safety': return 'text-safety';
      case 'location': return 'text-primary';
      case 'iot': return 'text-primary-light';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-emergency/10 border-l-emergency';
      case 'medium': return 'bg-warning/10 border-l-warning';
      default: return 'bg-primary/10 border-l-primary';
    }
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
            <Activity className="w-5 h-5 text-primary" />
            <span>Live Activity Feed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-safety rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-0">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div 
                  key={activity.id} 
                  className={`p-4 border-l-2 hover:bg-secondary/50 transition-colors animate-slide-up ${getPriorityBg(activity.priority)}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-4 h-4 mt-0.5 ${getActivityColor(activity.type, activity.priority)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">{activity.user}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" size="sm" className="w-full">
            View All Activities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;