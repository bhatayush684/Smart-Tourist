import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building,
  IdCard
} from 'lucide-react';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'police' | 'id_issuer';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  department?: string;
  badgeNumber?: string;
  location?: string;
  idType?: string;
  documents: {
    idProof: string;
    authorization: string;
    certificate?: string;
  };
  reason?: string;
}

const AdminApproval: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([
    {
      id: 'PU001',
      name: 'Officer Rajesh Kumar',
      email: 'rajesh.kumar@delhipolice.gov.in',
      phone: '+91-9876543210',
      role: 'police',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      department: 'Delhi Police',
      badgeNumber: 'DP12345',
      location: 'Connaught Place Station',
      documents: {
        idProof: 'police_id_001.pdf',
        authorization: 'dept_authorization_001.pdf',
        certificate: 'training_cert_001.pdf'
      }
    },
    {
      id: 'PU002',
      name: 'Inspector Priya Sharma',
      email: 'priya.sharma@mumbaipolice.gov.in',
      phone: '+91-9876543211',
      role: 'police',
      status: 'pending',
      submittedAt: '2024-01-15T09:15:00Z',
      department: 'Mumbai Police',
      badgeNumber: 'MP67890',
      location: 'Gateway of India Station',
      documents: {
        idProof: 'police_id_002.pdf',
        authorization: 'dept_authorization_002.pdf'
      }
    },
    {
      id: 'PU003',
      name: 'Amit Patel',
      email: 'amit.patel@igi.airport.gov.in',
      phone: '+91-9876543212',
      role: 'id_issuer',
      status: 'pending',
      submittedAt: '2024-01-15T11:45:00Z',
      location: 'IGI Airport Terminal 3',
      idType: 'Airport Immigration',
      documents: {
        idProof: 'immigration_id_001.pdf',
        authorization: 'airport_authorization_001.pdf',
        certificate: 'immigration_cert_001.pdf'
      }
    },
    {
      id: 'PU004',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@tajhotels.com',
      phone: '+91-9876543213',
      role: 'id_issuer',
      status: 'pending',
      submittedAt: '2024-01-15T08:20:00Z',
      location: 'Taj Palace Hotel',
      idType: 'Hotel Reception',
      documents: {
        idProof: 'hotel_staff_id_001.pdf',
        authorization: 'hotel_authorization_001.pdf'
      }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');

  const handleApproval = (userId: string, action: 'approve' | 'reject', reason?: string) => {
    setPendingUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: action === 'approve' ? 'approved' : 'rejected', reason }
        : user
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'police' ? <Shield className="w-4 h-4" /> : <IdCard className="w-4 h-4" />;
  };

  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedTab === 'all' || user.status === selectedTab;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = pendingUsers.filter(u => u.status === 'pending').length;
  const approvedCount = pendingUsers.filter(u => u.status === 'approved').length;
  const rejectedCount = pendingUsers.filter(u => u.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 hover:text-blue-600 transition-colors duration-300">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <Users className="w-6 h-6 text-white" />
              </div>
              User Approval Center
            </h1>
            <p className="text-gray-600 mt-1">
              Review and approve registration requests for police officers and ID verification staff
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md">
              <Clock className="w-3 h-3 mr-1" />
              {pendingCount} Pending
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium group-hover:text-yellow-600 transition-colors duration-200">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-600 group-hover:scale-110 transition-transform duration-200">{pendingCount}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-full group-hover:bg-yellow-100 transition-colors duration-200">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium group-hover:text-green-600 transition-colors duration-200">Approved</p>
                  <p className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-200">{approvedCount}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-200">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium group-hover:text-red-600 transition-colors duration-200">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 group-hover:scale-110 transition-transform duration-200">{rejectedCount}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors duration-200">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium group-hover:text-blue-600 transition-colors duration-200">Total Requests</p>
                  <p className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-200">{pendingUsers.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-200">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, email, department, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 border border-gray-200">
            <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50">Rejected ({rejectedCount})</TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50">All ({pendingUsers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:border-blue-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                            {getRoleIcon(user.role)}
                            <span className="text-white text-xs ml-1">{user.role === 'police' ? 'P' : 'ID'}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{user.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getStatusColor(user.status)} hover:scale-105 transition-transform duration-200 cursor-pointer`}>
                                {user.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                                {user.role.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{user.email}</span>
                            </p>
                            <p className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{user.phone}</span>
                            </p>
                            <p className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{user.location}</span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            {user.department && (
                              <p className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                                <Building className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{user.department}</span>
                              </p>
                            )}
                            {user.badgeNumber && (
                              <p className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                                <Shield className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">Badge: {user.badgeNumber}</span>
                              </p>
                            )}
                            {user.idType && (
                              <p className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                                <IdCard className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{user.idType}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-800">Submitted Documents:</h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 cursor-pointer">
                              <FileText className="w-3 h-3 mr-1" />
                              {user.documents.idProof}
                            </Badge>
                            <Badge variant="outline" className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 cursor-pointer">
                              <FileText className="w-3 h-3 mr-1" />
                              {user.documents.authorization}
                            </Badge>
                            {user.documents.certificate && (
                              <Badge variant="outline" className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 cursor-pointer">
                                <FileText className="w-3 h-3 mr-1" />
                                {user.documents.certificate}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Submitted: {new Date(user.submittedAt).toLocaleString()}
                        </p>

                        {user.reason && (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {user.reason}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <Button
                          size="sm"
                          variant="outline"
                          className="whitespace-nowrap border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Documents
                        </Button>
                        
                        {user.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproval(user.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApproval(user.id, 'reject', 'Insufficient documentation')}
                              className="whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredUsers.length === 0 && (
                <Card className="border border-gray-200 shadow-lg bg-white">
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">No Users Found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'No users match your search criteria.' : `No ${selectedTab} users at this time.`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminApproval;
