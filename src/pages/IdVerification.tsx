import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  IdCard, 
  Scan, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Camera,
  FileText,
  Clock,
  Shield,
  Plane,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VerificationRequest {
  id: string;
  touristName: string;
  documentType: 'passport' | 'visa' | 'id_card' | 'driving_license';
  documentNumber: string;
  nationality: string;
  issueDate: string;
  expiryDate: string;
  status: 'pending' | 'verified' | 'rejected' | 'flagged';
  submittedAt: string;
  location: string;
  purpose: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TouristProfile {
  id: string;
  name: string;
  nationality: string;
  passportNumber: string;
  visaStatus: 'valid' | 'expired' | 'pending' | 'rejected';
  arrivalDate: string;
  departureDate: string;
  accommodation: string;
  purpose: string;
  verificationHistory: VerificationRecord[];
}

interface VerificationRecord {
  id: string;
  timestamp: string;
  location: string;
  verifiedBy: string;
  status: 'verified' | 'flagged';
  notes?: string;
}

const IdVerification: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<VerificationRequest[]>([
    {
      id: 'VR001',
      touristName: 'John Smith',
      documentType: 'passport',
      documentNumber: 'US123456789',
      nationality: 'USA',
      issueDate: '2020-01-15',
      expiryDate: '2030-01-15',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      location: 'IGI Airport Terminal 3',
      purpose: 'Tourism',
      riskLevel: 'low'
    },
    {
      id: 'VR002',
      touristName: 'Maria Garcia',
      documentType: 'passport',
      documentNumber: 'ES987654321',
      nationality: 'Spain',
      issueDate: '2019-06-20',
      expiryDate: '2029-06-20',
      status: 'pending',
      submittedAt: '2024-01-15T11:15:00Z',
      location: 'Hotel Taj Palace',
      purpose: 'Business',
      riskLevel: 'medium'
    },
    {
      id: 'VR003',
      touristName: 'Ahmed Hassan',
      documentType: 'passport',
      documentNumber: 'EG456789123',
      nationality: 'Egypt',
      issueDate: '2018-03-10',
      expiryDate: '2025-03-10',
      status: 'flagged',
      submittedAt: '2024-01-15T09:45:00Z',
      location: 'Red Fort Checkpoint',
      purpose: 'Tourism',
      riskLevel: 'high'
    }
  ]);

  const [scanMode, setScanMode] = useState(false);
  const [scannedData, setScannedData] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'flagged': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleVerification = (requestId: string, action: 'verify' | 'reject' | 'flag') => {
    setPendingRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : 'flagged' }
        : req
    ));
  };

  const handleScan = () => {
    setScanMode(true);
    // Simulate scanning process
    setTimeout(() => {
      setScannedData('Passport: US123456789 | Name: John Smith | Nationality: USA | Valid until: 2030-01-15');
      setScanMode(false);
    }, 3000);
  };

  const getLocationIcon = (location: string) => {
    if (location.includes('Airport')) return <Plane className="w-4 h-4" />;
    if (location.includes('Hotel')) return <Building className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-green-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <IdCard className="w-6 h-6 text-white" />
              </div>
              ID Verification Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {user?.name} • {user?.idType || 'ID'} Verification Officer • {user?.location}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Authorized
            </Badge>
            <Button 
              onClick={handleScan}
              disabled={scanMode}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              <Scan className="w-4 h-4 mr-2" />
              {scanMode ? 'Scanning...' : 'Quick Scan'}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Verification</p>
                  <p className="text-3xl font-bold">{pendingRequests.filter(r => r.status === 'pending').length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-teal-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Verified Today</p>
                  <p className="text-3xl font-bold">{pendingRequests.filter(r => r.status === 'verified').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Flagged Cases</p>
                  <p className="text-3xl font-bold">{pendingRequests.filter(r => r.status === 'flagged').length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold">{pendingRequests.filter(r => r.status === 'rejected').length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Scan Result */}
        {scannedData && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold">Document Scanned Successfully</h3>
              </div>
              <p className="text-muted-foreground mb-4">{scannedData}</p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verify & Approve
                </Button>
                <Button size="sm" variant="outline">
                  <Camera className="w-4 h-4 mr-1" />
                  Capture Photo
                </Button>
                <Button size="sm" variant="outline" onClick={() => setScannedData('')}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending Verification</TabsTrigger>
            <TabsTrigger value="scanner">Document Scanner</TabsTrigger>
            <TabsTrigger value="history">Verification History</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-500" />
                  Pending Verification Requests
                </CardTitle>
                <CardDescription>
                  Documents awaiting verification and approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.toUpperCase()}
                          </Badge>
                          <Badge className={getRiskColor(request.riskLevel)}>
                            Risk: {request.riskLevel.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">ID: {request.id}</span>
                        </div>
                        <h3 className="font-semibold text-lg">{request.touristName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <p><span className="font-medium">Document:</span> {request.documentType.replace('_', ' ').toUpperCase()}</p>
                            <p><span className="font-medium">Number:</span> {request.documentNumber}</p>
                            <p><span className="font-medium">Nationality:</span> {request.nationality}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="flex items-center gap-1">
                              {getLocationIcon(request.location)}
                              <span className="font-medium">Location:</span> {request.location}
                            </p>
                            <p><span className="font-medium">Purpose:</span> {request.purpose}</p>
                            <p className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Expires:</span> {new Date(request.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(request.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleVerification(request.id, 'verify')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerification(request.id, 'flag')}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Flag
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerification(request.id, 'reject')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-blue-500" />
                  Document Scanner
                </CardTitle>
                <CardDescription>
                  Scan and verify tourist documents in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-6">
                  {scanMode ? (
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Scan className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">Scanning Document...</h3>
                      <p className="text-muted-foreground">Please hold the document steady</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                        <IdCard className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">Ready to Scan</h3>
                      <p className="text-muted-foreground mb-4">
                        Position the document within the scanner area and click scan
                      </p>
                      <Button 
                        onClick={handleScan}
                        className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                        size="lg"
                      >
                        <Scan className="w-5 h-5 mr-2" />
                        Start Scanning
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Verification History
                </CardTitle>
                <CardDescription>
                  Recent verification activities and records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Verification History</h3>
                  <p className="text-muted-foreground mb-4">
                    Historical verification records and audit trails will be displayed here.
                  </p>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Full History
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

export default IdVerification;
