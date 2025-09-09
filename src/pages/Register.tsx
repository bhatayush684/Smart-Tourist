import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, Eye, EyeOff, UserPlus, Users, BadgeCheck, MapPin, Phone, Building, CreditCard, Globe, Sparkles, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tourist' as 'tourist' | 'admin' | 'police' | 'id_issuer',
    nationality: '',
    phone: '',
    department: '',
    badgeNumber: '',
    location: '',
    idType: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        nationality: formData.nationality,
        phone: formData.phone,
        department: formData.department,
        badgeNumber: formData.badgeNumber,
        location: formData.location,
        idType: formData.idType,
      });
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { 
      value: 'tourist', 
      label: 'Tourist', 
      description: 'Travelers and visitors to India',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
    },
    { 
      value: 'admin', 
      label: 'System Administrator', 
      description: 'Full access to all platform features',
      icon: Shield,
      color: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
    },
    { 
      value: 'police', 
      label: 'Police Officer', 
      description: 'Law enforcement and emergency response',
      icon: BadgeCheck,
      color: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
    },
    { 
      value: 'id_issuer', 
      label: 'ID Issuer', 
      description: 'Airport checkpoints and hotel verification',
      icon: CreditCard,
      color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className={`w-full max-w-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative group">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">
                Join Our Platform
              </h1>
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                <Globe className="w-4 h-4" />
                Government of India • Ministry of Tourism
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl border border-gray-200 bg-white hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Choose your role and join the tourist safety network
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-shake bg-red-50 border-red-200 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div
                        key={role.value}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                          formData.role === role.value
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleChange('role', role.value)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${role.color.replace('dark:bg-', 'bg-').replace('dark:text-', 'text-')}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm text-gray-800">{role.label}</h3>
                            <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                          </div>
                          {formData.role === role.value && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Role-specific fields */}
              {formData.role === 'tourist' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-sm font-medium">Nationality</Label>
                    <Input
                      id="nationality"
                      type="text"
                      placeholder="Enter your nationality"
                      value={formData.nationality}
                      onChange={(e) => handleChange('nationality', e.target.value)}
                      disabled={loading}
                      className="h-12 bg-white/50 dark:bg-gray-800/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={loading}
                      className="h-12 bg-white/50 dark:bg-gray-800/50"
                    />
                  </div>
                </div>
              )}

              {formData.role === 'police' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                    <Input
                      id="department"
                      type="text"
                      placeholder="Police department"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      disabled={loading}
                      className="h-12 bg-white/50 dark:bg-gray-800/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badgeNumber" className="text-sm font-medium">Badge Number</Label>
                    <Input
                      id="badgeNumber"
                      type="text"
                      placeholder="Badge/ID number"
                      value={formData.badgeNumber}
                      onChange={(e) => handleChange('badgeNumber', e.target.value)}
                      disabled={loading}
                      className="h-12 bg-white/50 dark:bg-gray-800/50"
                    />
                  </div>
                </div>
              )}

              {formData.role === 'id_issuer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Airport/Hotel location"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      disabled={loading}
                      className="h-12 bg-white/50 dark:bg-gray-800/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idType" className="text-sm font-medium">ID Type</Label>
                    <Select
                      value={formData.idType}
                      onValueChange={(value) => handleChange('idType', value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-800/50">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airport">Airport Checkpoint</SelectItem>
                        <SelectItem value="hotel">Hotel Verification</SelectItem>
                        <SelectItem value="border">Border Control</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 pr-12 bg-white/50 dark:bg-gray-800/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 pr-12 bg-white/50 dark:bg-gray-800/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {(formData.role === 'police' || formData.role === 'id_issuer') && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Approval Required</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Your account will be reviewed by an administrator before activation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"

                
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200 hover:scale-105 inline-block"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2 hover:text-green-600 transition-colors duration-200 cursor-pointer">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Registration</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span>Government Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
