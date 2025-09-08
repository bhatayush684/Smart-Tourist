import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets,
  Eye,
  MapPin
} from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData>({
    location: 'New Delhi, India',
    temperature: 28,
    condition: 'sunny',
    humidity: 65,
    windSpeed: 12,
    visibility: 8,
    feelsLike: 32
  });

  // Simulate weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        humidity: Math.max(30, Math.min(90, prev.humidity + (Math.random() - 0.5) * 10)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 5),
        feelsLike: prev.temperature + Math.random() * 4
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return Sun;
      case 'cloudy': return Cloud;
      case 'rainy': return CloudRain;
      default: return Sun;
    }
  };

  const getConditionColor = () => {
    switch (weather.condition) {
      case 'sunny': return 'text-yellow-500';
      case 'cloudy': return 'text-gray-500';
      case 'rainy': return 'text-blue-500';
      default: return 'text-yellow-500';
    }
  };

  const getConditionBg = () => {
    switch (weather.condition) {
      case 'sunny': return 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20';
      case 'cloudy': return 'bg-gradient-to-br from-gray-400/20 to-slate-400/20';
      case 'rainy': return 'bg-gradient-to-br from-blue-400/20 to-indigo-400/20';
      default: return 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20';
    }
  };

  const WeatherIcon = getWeatherIcon();

  return (
    <Card className={`shadow-card-custom animate-bounce-in ${getConditionBg()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WeatherIcon className={`w-5 h-5 ${getConditionColor()}`} />
            <span className="font-display">Weather Conditions</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Temperature */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3">
            <WeatherIcon className={`w-12 h-12 ${getConditionColor()}`} />
            <div>
              <div className="text-3xl font-bold font-display">
                {Math.round(weather.temperature)}°C
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {weather.condition}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <MapPin className="w-3 h-3 inline mr-1" />
            {weather.location}
          </p>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Thermometer className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Feels like</p>
            <p className="text-sm font-semibold">{Math.round(weather.feelsLike)}°C</p>
          </div>
          
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-sm font-semibold">{Math.round(weather.humidity)}%</p>
          </div>
          
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Wind className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="text-sm font-semibold">{Math.round(weather.windSpeed)} km/h</p>
          </div>
          
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Eye className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Visibility</p>
            <p className="text-sm font-semibold">{weather.visibility} km</p>
          </div>
        </div>

        {/* Weather Impact Alert */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-warning" />
            <div>
              <p className="text-xs font-medium">Weather Impact</p>
              <p className="text-xs text-muted-foreground">
                {weather.temperature > 30 
                  ? "High temperature - Advise tourists to stay hydrated"
                  : weather.condition === 'rainy'
                  ? "Rain expected - Tourist activities may be affected"
                  : "Favorable conditions for outdoor activities"
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;