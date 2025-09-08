import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Flag,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  RefreshCw
} from 'lucide-react';

interface Tourist {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  arrivalDate: string;
  departureDate: string;
  status: 'active' | 'at-risk' | 'emergency' | 'inactive';
  location: {
    lat: number;
    lng: number;
    address: string;
    lastUpdate: string;
  };
  device: {
    id: string;
    type: string;
    battery: number;
    status: 'online' | 'offline';
  };
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  healthInfo?: {
    allergies: string[];
    medicalConditions: string[];
    bloodType: string;
  };
}

const TouristManagement: React.FC = () => {
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'at-risk' | 'emergency' | 'inactive'>('all');
  const [nationalityFilter, setNationalityFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);

  // Mock data generation
  useEffect(() => {
    const generateMockTourists = (): Tourist[] => {
      const nationalities = ['India', 'USA', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'Canada', 'Italy', 'Spain'];
      const statuses: Tourist['status'][] = ['active', 'at-risk', 'emergency', 'inactive'];
      const deviceTypes = ['Smart Band', 'GPS Tracker', 'Health Monitor'];
      
      return Array.from({ length: 100 }, (_, i) => ({
        id: `tourist-${i + 1}`,
        name: `Tourist ${i + 1}`,
        email: `tourist${i + 1}@example.com`,
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
        passportNumber: `P${Math.floor(Math.random() * 9000000) + 1000000}`,
        arrivalDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        departureDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        location: {
          lat: 28.6139 + (Math.random() - 0.5) * 0.1,
          lng: 77.2090 + (Math.random() - 0.5) * 0.1,
          address: `Location ${i + 1}, Delhi, India`,
          lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString()
        },
        device: {
          id: `device-${i + 1}`,
          type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
          battery: Math.floor(Math.random() * 100),
          status: Math.random() > 0.1 ? 'online' : 'offline'
        },
        emergencyContacts: [
          {
            name: `Emergency Contact ${i + 1}`,
            phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            relationship: 'Family'
          }
        ],
        healthInfo: Math.random() > 0.3 ? {
          allergies: ['None'],
          medicalConditions: ['None'],
          bloodType: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'][Math.floor(Math.random() * 8)]
        } : undefined
      }));
    };

    setTourists(generateMockTourists());
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate data refresh
    setTourists(prev => prev.map(tourist => ({
      ...tourist,
      device: {
        ...tourist.device,
        battery: Math.max(0, tourist.device.battery + Math.floor(Math.random() * 6) - 3),
        status: Math.random() > 0.05 ? 'online' : 'offline'
      },
      location: {
        ...tourist.location,
        lastUpdate: new Date().toISOString()
      }
    })));
    setIsRefreshing(false);
  };

  const filteredTourists = tourists.filter(tourist => {
    const matchesSearch = tourist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tourist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tourist.passportNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tourist.status === statusFilter;
    const matchesNationality = nationalityFilter === 'all' || tourist.nationality === nationalityFilter;
    
    return matchesSearch && matchesStatus && matchesNationality;
  });

  const getStatusColor = (status: Tourist['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Tourist['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'at-risk': return <AlertTriangle className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    total: tourists.length,
    active: tourists.filter(t => t.status === 'active').length,
    atRisk: tourists.filter(t => t.status === 'at-risk').length,
    emergency: tourists.filter(t => t.status === 'emergency').length,
    inactive: tourists.filter(t => t.status === 'inactive').length
  };

  const nationalities = Array.from(new Set(tourists.map(t => t.nationality)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tourist Management</h2>
          <p className="text-muted-foreground">Monitor and manage tourist information and safety status</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Tourist
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tourists</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
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
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tourists by name, email, or passport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="at-risk">At Risk</option>
                <option value="emergency">Emergency</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Nationalities</option>
                {nationalities.map(nationality => (
                  <option key={nationality} value={nationality}>{nationality}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tourist List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTourists.map((tourist) => (
          <Card 
            key={tourist.id} 
            className="hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedTourist(tourist)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{tourist.name}</CardTitle>
                </div>
                <Badge className={`${getStatusColor(tourist.status)} border-0`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(tourist.status)}
                    <span className="capitalize">{tourist.status.replace('-', ' ')}</span>
                  </div>
                </Badge>
              </div>
              <CardDescription>{tourist.email}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tourist.nationality}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tourist.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tourist.passportNumber}</span>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Current Location</span>
                </div>
                <p className="text-sm font-medium">{tourist.location.address}</p>
                <p className="text-xs text-muted-foreground">
                  Last update: {new Date(tourist.location.lastUpdate).toLocaleTimeString()}
                </p>
              </div>

              {/* Device Status */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{tourist.device.type}</p>
                  <p className="text-xs text-muted-foreground">Battery: {tourist.device.battery}%</p>
                </div>
                <Badge variant={tourist.device.status === 'online' ? 'default' : 'secondary'}>
                  {tourist.device.status}
                </Badge>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Arrival</p>
                  <p className="font-medium">{new Date(tourist.arrivalDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Departure</p>
                  <p className="font-medium">{new Date(tourist.departureDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="h-8 px-3">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tourist Detail Modal would go here */}
      {selectedTourist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tourist Details - {selectedTourist.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTourist(null)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedTourist.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedTourist.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{selectedTourist.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nationality:</span>
                        <span className="font-medium">{selectedTourist.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Passport:</span>
                        <span className="font-medium">{selectedTourist.passportNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Travel Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Arrival:</span>
                        <span className="font-medium">{new Date(selectedTourist.arrivalDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Departure:</span>
                        <span className="font-medium">{new Date(selectedTourist.departureDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Current Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={`${getStatusColor(selectedTourist.status)} border-0`}>
                          {selectedTourist.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Device:</span>
                        <span className="font-medium">{selectedTourist.device.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Battery:</span>
                        <span className="font-medium">{selectedTourist.device.battery}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium text-right">{selectedTourist.location.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Update:</span>
                        <span className="font-medium">{new Date(selectedTourist.location.lastUpdate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TouristManagement;
