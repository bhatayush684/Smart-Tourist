import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  Shield, 
  MapPin, 
  Phone,
  Globe,
  Volume2,
  Settings,
  ChevronRight,
  Zap,
  Heart
} from 'lucide-react';

const TouristApp = () => {
  const [safetyScore, setSafetyScore] = useState(87);
  const [currentLocation, setCurrentLocation] = useState('Connaught Place, New Delhi');
  const [isTracking, setIsTracking] = useState(true);
  const [language, setLanguage] = useState('English');

  const languages = [
    'English', 'हिंदी', 'বাংলা', 'తెలుగు', 'മലയാളം', 
    'தமிழ்', 'ಕನ್ನಡ', 'ગુજરાતી', 'मराठी', 'ਪੰਜਾਬੀ'
  ];

  const emergencyContacts = [
    { name: 'Tourist Police', number: '1363', type: 'Primary' },
    { name: 'Emergency Services', number: '112', type: 'Emergency' },
    { name: 'Local Police', number: '100', type: 'Local' },
  ];

  const nearbyAlerts = [
    { id: 1, type: 'warning', message: 'High crowd density area - stay alert', location: '500m away' },
    { id: 2, type: 'info', message: 'Tourist information center available', location: '200m away' },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-foreground">Tourist Safety App</h1>
          <p className="text-muted-foreground">Stay safe, stay connected</p>
        </div>

        {/* Safety Score */}
        <Card className="shadow-card-custom border-card-border bg-gradient-safety text-safety-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Current Safety Score</h3>
                <p className="text-3xl font-bold">{safetyScore}%</p>
                <p className="text-sm opacity-90">You're in a safe zone</p>
              </div>
              <Shield className="w-16 h-16 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Panic Button */}
        <Card className="shadow-emergency border-emergency/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Emergency Assistance</h3>
              <Button 
                variant="emergency" 
                size="lg" 
                className="w-full h-20 text-xl font-bold animate-pulse"
              >
                <AlertCircle className="w-8 h-8" />
                PANIC BUTTON - SEND SOS
              </Button>
              <p className="text-sm text-muted-foreground">
                Press and hold for 3 seconds to send emergency alert with your location
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-card-custom">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Current Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{currentLocation}</p>
              <p className="text-sm text-muted-foreground">Last updated: 2 minutes ago</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-safety' : 'bg-warning'}`}></div>
                <span className="text-sm">
                  Tracking {isTracking ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card-custom">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-primary" />
                <span>Language</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-between">
                  {language}
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Volume2 className="w-4 h-4" />
                  Voice Commands Available
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-primary" />
              <span>Emergency Contacts</span>
            </CardTitle>
            <CardDescription>
              Quick access to important numbers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.type}</p>
                  </div>
                  <Button variant="government" size="sm">
                    Call {contact.number}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nearby Alerts */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-warning" />
              <span>Nearby Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'warning' ? 'bg-warning/10 border-warning' : 'bg-primary/10 border-primary'
                  }`}
                >
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">{alert.location}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" size="lg" className="h-16">
            <Settings className="w-5 h-5" />
            Settings
          </Button>
          <Button 
            variant={isTracking ? "safety" : "warning"} 
            size="lg" 
            className="h-16"
            onClick={() => setIsTracking(!isTracking)}
          >
            <MapPin className="w-5 h-5" />
            {isTracking ? 'Tracking On' : 'Enable Tracking'}
          </Button>
        </div>

        {/* Health Status */}
        <Card className="shadow-card-custom border-safety/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-safety" />
                <div>
                  <p className="font-medium">Health Status</p>
                  <p className="text-sm text-muted-foreground">All vitals normal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="font-medium">5 min ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TouristApp;