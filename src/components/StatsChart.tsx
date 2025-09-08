import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  safety?: number;
  alerts?: number;
}

const StatsChart = () => {
  const weeklyData: ChartData[] = [
    { name: 'Mon', value: 2400, safety: 85, alerts: 12 },
    { name: 'Tue', value: 1398, safety: 78, alerts: 8 },
    { name: 'Wed', value: 9800, safety: 92, alerts: 15 },
    { name: 'Thu', value: 3908, safety: 88, alerts: 6 },
    { name: 'Fri', value: 4800, safety: 95, alerts: 20 },
    { name: 'Sat', value: 3800, safety: 82, alerts: 25 },
    { name: 'Sun', value: 4300, safety: 90, alerts: 18 }
  ];

  const safetyDistribution = [
    { name: 'Safe (80-100%)', value: 65, color: 'hsl(134, 61%, 41%)' },
    { name: 'Moderate (50-79%)', value: 25, color: 'hsl(38, 92%, 50%)' },
    { name: 'At Risk (0-49%)', value: 10, color: 'hsl(0, 84%, 52%)' }
  ];

  const alertsData: ChartData[] = [
    { name: 'Geo-fence', value: 45 },
    { name: 'Inactivity', value: 23 },
    { name: 'Health', value: 18 },
    { name: 'Location Drop', value: 12 },
    { name: 'Emergency', value: 8 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tourist Activity Chart */}
      <Card className="shadow-card-custom animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-display">Weekly Tourist Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 24%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(217, 91%, 24%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(217, 91%, 24%)" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Safety Score Distribution */}
      <Card className="shadow-card-custom animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="text-lg font-display">Safety Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={safetyDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {safetyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {safetyDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card className="shadow-card-custom animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="text-lg font-display">Alert Types (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={alertsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" className="text-xs" width={80} />
              <Bar dataKey="value" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Safety Trends */}
      <Card className="shadow-card-custom animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="text-lg font-display">Safety Score Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorSafety" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(134, 61%, 41%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(134, 61%, 41%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Area 
                type="monotone" 
                dataKey="safety" 
                stroke="hsl(134, 61%, 41%)" 
                fillOpacity={1} 
                fill="url(#colorSafety)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsChart;