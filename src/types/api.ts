// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tourist' | 'admin' | 'government';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  nationality?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

export interface TokenVerificationResponse {
  success: boolean;
  user: User;
}

// Tourist Types
export interface TouristProfile {
  id: string;
  userId: string;
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber: string;
    phone: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  travelInfo: {
    arrivalDate: string;
    departureDate: string;
    accommodation: string;
    travelPurpose: string;
  };
  location: {
    coordinates: [number, number];
    address: string;
    lastUpdated: string;
    accuracy?: number;
  };
  safetyScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface TouristListResponse {
  success: boolean;
  data: TouristProfile[];
  pagination: PaginationInfo;
}

// Device Types
export interface Device {
  id: string;
  deviceType: 'smart_band' | 'tracker' | 'sensor' | 'camera';
  manufacturer: string;
  model: string;
  serialNumber: string;
  touristId?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  batteryLevel?: number;
  lastSeen: string;
  location?: {
    coordinates: [number, number];
    address: string;
    accuracy?: number;
  };
  vitals?: {
    heartRate?: number;
    temperature?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    oxygenSaturation?: number;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DeviceListResponse {
  success: boolean;
  data: Device[];
  pagination: PaginationInfo;
}

// Alert Types
export interface Alert {
  id: string;
  type: 'emergency' | 'medical' | 'security' | 'device' | 'location' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'false_alarm';
  title: string;
  description: string;
  touristId?: string;
  deviceId?: string;
  location?: {
    coordinates: [number, number];
    address: string;
  };
  metadata?: Record<string, unknown>;
  actions: AlertAction[];
  escalatedTo?: string[];
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertAction {
  id: string;
  action: string;
  notes?: string;
  performedBy: string;
  performedAt: string;
}

export interface AlertListResponse {
  success: boolean;
  data: Alert[];
  pagination: PaginationInfo;
}

// Dashboard and Analytics Types
export interface DashboardOverview {
  totalTourists: number;
  activeTourists: number;
  totalDevices: number;
  activeDevices: number;
  activeAlerts: number;
  criticalAlerts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface StatisticsData {
  period: string;
  tourists: {
    total: number;
    active: number;
    new: number;
    byNationality: Record<string, number>;
  };
  devices: {
    total: number;
    active: number;
    offline: number;
    byType: Record<string, number>;
  };
  alerts: {
    total: number;
    active: number;
    resolved: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'login' | 'logout' | 'alert' | 'device_update' | 'location_update';
  description: string;
  userId?: string;
  touristId?: string;
  deviceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Common Types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  nationality?: string;
  phone?: string;
}

export interface LocationUpdateRequest {
  coordinates: [number, number];
  address: string;
  accuracy?: number;
}

export interface EmergencyRequest {
  type: string;
  description?: string;
}

export interface DeviceVitalsRequest {
  heartRate?: number;
  temperature?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  oxygenSaturation?: number;
}

export interface DeviceLocationRequest {
  coordinates: [number, number];
  address: string;
  accuracy?: number;
}

export interface AlertActionRequest {
  action: string;
  notes?: string;
}

export interface AlertResolutionRequest {
  resolution: string;
  notes?: string;
}

export interface BroadcastRequest {
  message: string;
  type: string;
  targetUsers?: string[];
}
