# Sample Login Credentials

## Test Users for Tourist Safety Platform

### 🎯 **Ready to Login (Active Users)**

| Role | Email | Password | Status | Notes |
|------|-------|----------|--------|-------|
| **👤 Tourist** | `tourist@test.com` | `password123` | ✅ Active | Complete profile with travel info |
| **⚖️ Admin** | `admin@test.com` | `admin123` | ✅ Active | Full system access, can approve users |
| **👮 Police** | `police@test.com` | `police123` | ✅ Active | Delhi Police, Badge: DP12345 |
| **🆔 ID Issuer** | `idissuer@test.com` | `issuer123` | ✅ Active | IGI Airport Terminal 3 |

### ⏳ **Pending Approval (Test Approval Workflow)**

| Role | Email | Password | Status | Notes |
|------|-------|----------|--------|-------|
| **👮 Police** | `police.pending@test.com` | `police123` | ⏳ Pending | Mumbai Police, Badge: MP67890 |
| **🆔 ID Issuer** | `idissuer.pending@test.com` | `issuer123` | ⏳ Pending | Taj Palace Hotel |

## 🧪 **Testing Instructions**

### 1. **Test Basic Login Flow**
- Use any active user credentials above
- Should redirect to appropriate dashboard based on role

### 2. **Test Approval Workflow**
1. Login as **Admin** (`admin@test.com`)
2. Navigate to **User Approvals** section
3. Approve/reject pending users
4. Test login with newly approved users

### 3. **Test Role-Based Access**
- **Tourist**: Access to Digital ID, Tourist App
- **Police**: Access to Police Dashboard, IoT Monitor
- **ID Issuer**: Access to ID Verification Center
- **Admin**: Access to all areas + User Management

### 4. **Test Pending Account Behavior**
- Try logging in with pending accounts
- Should show "Account Pending Approval" message
- Cannot access dashboard until approved

## 🚀 **Setup Instructions**

Run the sample user creation script:

```bash
cd backend
node scripts/createSampleUsers.js
```

This will:
- Create all 6 test users
- Set up complete tourist profile
- Hash passwords securely
- Display success confirmation

## 🔐 **Security Notes**

- These are **test credentials only**
- Passwords are intentionally simple for testing
- In production, enforce strong password policies
- Consider implementing 2FA for admin/police roles

## 🎨 **UI Features to Test**

- **Login Page**: Animated backgrounds, statistics display
- **Registration**: Role-specific fields, approval notices  
- **Navigation**: Role-based menu items, profile dropdown
- **Protected Routes**: Status-based access control
- **Dashboards**: Role-specific interfaces and features

---

*Generated for Tourist Safety Platform Authentication System*
