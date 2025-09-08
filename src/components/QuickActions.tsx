import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Send, 
  Bell,
  Settings,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create comprehensive safety report',
      icon: FileText,
      variant: 'government' as const,
      action: () => console.log('Generate report')
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download tourist data as CSV/Excel',
      icon: Download,
      variant: 'outline' as const,
      action: () => console.log('Export data')
    },
    {
      id: 'send-alert',
      title: 'Send Alert',
      description: 'Broadcast safety alert to tourists',
      icon: Send,
      variant: 'warning' as const,
      action: () => console.log('Send alert')
    },
    {
      id: 'notifications',
      title: 'Manage Notifications',
      description: 'Configure notification settings',
      icon: Bell,
      variant: 'outline' as const,
      action: () => console.log('Manage notifications')
    }
  ];

  return (
    <Card className="shadow-card-custom">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant}
              className="w-full justify-start h-auto p-4"
              onClick={action.action}
            >
              <Icon className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">{action.title}</p>
                <p className="text-xs opacity-80">{action.description}</p>
              </div>
            </Button>
          );
        })}
        
        <div className="pt-3 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;