import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Smartphone, 
  Monitor,
  Wifi,
  IdCard,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  ChevronDown,
  Globe,
  Zap,
  UserCheck,
  ShieldCheck,
  ScanLine,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Monitor, roles: ['tourist', 'admin', 'police', 'id_issuer'] },
    { path: '/tourist-id', label: 'Digital ID', icon: IdCard, roles: ['tourist', 'admin'] },
    { path: '/tourist-app', label: 'Tourist App', icon: Smartphone, roles: ['tourist', 'admin'] },
    { path: '/admin', label: 'Admin Panel', icon: Shield, roles: ['admin'] },
    { path: '/admin/approvals', label: 'User Approvals', icon: UserCheck, roles: ['admin'] },
    { path: '/iot-monitor', label: 'IoT Monitor', icon: Wifi, roles: ['admin', 'police'] },
    { path: '/police-dashboard', label: 'Police Center', icon: ShieldCheck, roles: ['police'] },
    { path: '/id-verification', label: 'ID Verification', icon: ScanLine, roles: ['id_issuer'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-primary shadow-government border-b border-primary/20 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary-foreground drop-shadow" />
            <div>
              <h1 className="text-xl font-bold text-primary-foreground drop-shadow">
                Tourist Safety Platform
              </h1>
              <p className="text-xs text-primary-foreground/90">
                Government of India Initiative
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? 'secondary' : 'ghost'}
                    className={`group relative text-primary-foreground/95 hover:bg-primary-light/25 hover:text-primary-foreground`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="relative">
                      {item.label}
                      <span
                        className={`pointer-events-none absolute left-0 -bottom-1 h-0.5 w-full origin-left scale-x-0 bg-primary-foreground/90 transition-transform duration-200 ease-smooth group-hover:scale-x-100 ${
                          isActive(item.path) ? 'scale-x-100' : ''
                        }`}
                      />
                    </span>
                  </Button>
                </Link>
              );
            })}
            
            {/* Desktop Search */}
            <div className="ml-4 hidden lg:flex items-center">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                <Input
                  aria-label="Search"
                  placeholder="Search..."
                  className="pl-9 bg-primary-foreground/10 placeholder-primary-foreground/70 text-primary-foreground border-primary-foreground/20 focus-visible:ring-primary-foreground/40 w-56"
                />
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2 ml-4">
              {isConnected ? (
                <Badge variant="secondary" className="bg-safety/25 text-safety border-safety/30 backdrop-blur-sm">
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-warning/25 text-warning border-warning/30 backdrop-blur-sm">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Notifications" variant="ghost" className="relative text-primary-foreground/95 hover:bg-primary-light/25">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emergency ring-2 ring-primary/60"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="px-3 py-2 text-sm font-medium">Notifications</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-safety" />
                  <div>
                    <p className="text-sm">System is running smoothly.</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-warning" />
                  <div>
                    <p className="text-sm">New device connected.</p>
                    <p className="text-xs text-muted-foreground">2m ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emergency" />
                  <div>
                    <p className="text-sm">Alert threshold reached.</p>
                    <p className="text-xs text-muted-foreground">10m ago</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-primary-foreground/95 hover:bg-primary-light/25 p-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8 ring-2 ring-primary-foreground/20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-primary-foreground truncate max-w-24">
                        {user?.name}
                      </p>
                      <p className="text-xs text-primary-foreground/70 capitalize">
                        {user?.role?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 ring-2 ring-blue-500/20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${
                            user?.role === 'admin' ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            user?.role === 'police' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300' :
                            user?.role === 'id_issuer' ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          }`}
                        >
                          {user?.role?.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {user?.status && (
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              user.status === 'active' ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300' :
                              user.status === 'pending' ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                              'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}
                          >
                            {user.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <User className="mr-3 h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">Profile Settings</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <Settings className="mr-3 h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">Preferences</p>
                      <p className="text-xs text-gray-500">Customize your experience</p>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                    <Bell className="mr-3 h-4 w-4 text-gray-500" />
                    <div className="flex items-center justify-between flex-1">
                      <div>
                        <p className="font-medium text-sm">Notifications</p>
                        <p className="text-xs text-gray-500">Manage alerts</p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">3</Badge>
                    </div>
                  </DropdownMenuItem>

                  {user?.role === 'admin' && (
                    <DropdownMenuItem className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <Shield className="mr-3 h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">Admin Panel</p>
                        <p className="text-xs text-gray-500">System management</p>
                      </div>
                    </DropdownMenuItem>
                  )}
                </div>
                
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                
                <div className="py-2">
                  <DropdownMenuItem 
                    onClick={logout}
                    className="px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-red-600 dark:text-red-400"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <div>
                      <p className="font-medium text-sm">Sign Out</p>
                      <p className="text-xs opacity-75">End your session</p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden text-primary-foreground/95 hover:bg-primary-light/25"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-primary-foreground/95 hover:bg-primary-light/25"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="pt-4 border-t border-primary/20">
                <div className="flex items-center space-x-3 p-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-primary-foreground">{user?.name}</p>
                    <p className="text-xs text-primary-foreground/80">{user?.email}</p>
                    <Badge variant="outline" className="text-xs">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary-foreground/95 hover:bg-primary-light/25"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;