import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Users, 
  MapPin, 
  Activity, 
  Eye, 
  EyeOff,
  Loader2,
  CheckCircle,
  Globe,
  Smartphone,
  Wifi,
  AlertTriangle,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: Users, label: 'Active Users', value: '12,847' },
    { icon: MapPin, label: 'Locations Monitored', value: '1,250' },
    { icon: Activity, label: 'Real-time Alerts', value: '24/7' },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className={`w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Left Side - Branding and Info */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="relative group">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">
                  Tourist Safety Platform
                </h1>
                <p className="text-sm text-gray-600 flex items-center justify-center lg:justify-start gap-1 mt-1">
                  <Globe className="w-4 h-4" />
                  Government of India • Ministry of Tourism
                </p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Ensuring tourist safety through advanced monitoring, real-time alerts, and comprehensive security measures across India.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-white rounded-xl p-4 border border-gray-200 shadow-md transition-all duration-500 delay-${index * 100} hover:scale-105 hover:shadow-lg hover:border-blue-300 cursor-pointer group`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                    <stat.icon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Platform Features</h3>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200 cursor-pointer">
                <CheckCircle className="w-3 h-3 mr-1" />
                Real-time Monitoring
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors duration-200 cursor-pointer">
                <CheckCircle className="w-3 h-3 mr-1" />
                Emergency Alerts
              </Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors duration-200 cursor-pointer">
                <CheckCircle className="w-3 h-3 mr-1" />
                IoT Integration
              </Badge>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors duration-200 cursor-pointer">
                <CheckCircle className="w-3 h-3 mr-1" />
                Multi-role Access
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border border-gray-200 bg-white hover:shadow-3xl transition-all duration-300">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Sign in to access your dashboard and manage tourist safety operations
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-shake bg-red-50 border-red-200 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 pr-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Sign In Securely
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200 hover:scale-105 inline-block"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2 hover:text-green-600 transition-colors duration-200 cursor-pointer">
                <Shield className="w-4 h-4 text-green-500" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Government Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
