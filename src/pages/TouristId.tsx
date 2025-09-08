import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  IdCard, 
  Upload, 
  QrCode, 
  Shield, 
  CheckCircle,
  FileText,
  Camera,
  Hash,
  Download
} from 'lucide-react';

const TouristId = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    passportNumber: '',
    aadhaarNumber: '',
    phoneNumber: '',
    email: ''
  });
  const [generatedId, setGeneratedId] = useState({
    id: 'TST-2024-INB-7829',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UVIgQ29kZTwvdGV4dD4KPC9zdmc+',
    blockchainHash: '0x8f4a2e9c1d6b3a5f7e8c9d2a1b4c3e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    issuedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const verificationSteps = [
    { step: 1, title: 'Document Upload', desc: 'Upload identity documents', completed: step > 1 },
    { step: 2, title: 'KYC Verification', desc: 'Verify identity information', completed: step > 2 },
    { step: 3, title: 'ID Generation', desc: 'Generate digital tourist ID', completed: step >= 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-foreground mb-4">Digital Tourist ID System</h1>
          <p className="text-xl text-muted-foreground">Secure blockchain-based identity verification for tourists</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-8">
            {verificationSteps.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  item.completed 
                    ? 'bg-safety text-safety-foreground border-safety' 
                    : step === item.step
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border'
                }`}>
                  {item.completed ? <CheckCircle className="w-6 h-6" /> : item.step}
                </div>
                <div className="text-left">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto shadow-government">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-6 h-6 text-primary" />
                <span>Document Upload & KYC</span>
              </CardTitle>
              <CardDescription>
                Please provide your identity documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input 
                      id="nationality" 
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="Enter nationality"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input 
                      id="passportNumber" 
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      placeholder="Enter passport number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aadhaarNumber">Aadhaar Number (Indian Citizens)</Label>
                    <Input 
                      id="aadhaarNumber" 
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleInputChange}
                      placeholder="Enter Aadhaar number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input 
                      id="phoneNumber" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Document Upload</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium">Passport/ID Photo</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Upload Photo
                      </Button>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium">Supporting Documents</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Upload Documents
                      </Button>
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="government" size="lg" className="w-full">
                  Proceed to Verification
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="max-w-2xl mx-auto shadow-government">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <span>KYC Verification in Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">Verifying Your Documents</h3>
              <p className="text-muted-foreground mb-6">This process usually takes 2-3 minutes</p>
              <Button onClick={() => setStep(3)} variant="government">
                Simulate Verification Complete
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card className="max-w-4xl mx-auto shadow-government border-safety">
              <CardHeader className="text-center bg-gradient-safety text-safety-foreground rounded-t-lg">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-8 h-8" />
                  <span>Digital Tourist ID Generated Successfully!</span>
                </CardTitle>
                <CardDescription className="text-safety-foreground/80">
                  Your secure blockchain-based digital identity is ready
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* ID Card Display */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Digital ID Card</h3>
                    <div className="bg-gradient-primary p-6 rounded-xl text-primary-foreground shadow-glow">
                      <div className="flex items-center justify-between mb-4">
                        <Shield className="w-8 h-8" />
                        <span className="text-sm opacity-80">Government of India</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold">{formData.fullName || 'John Doe'}</h4>
                        <p className="text-sm opacity-90">Tourist ID: {generatedId.id}</p>
                        <p className="text-sm opacity-90">Nationality: {formData.nationality || 'USA'}</p>
                        <p className="text-sm opacity-90">Valid Until: {new Date(generatedId.validUntil).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* QR Code and Details */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">QR Code & Blockchain Details</h3>
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto bg-background border rounded-lg flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Scan for verification</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="text-xl font-semibold flex items-center space-x-2">
                    <Hash className="w-5 h-5 text-primary" />
                    <span>Blockchain Verification</span>
                  </h3>
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Transaction Hash:</p>
                    <p className="font-mono text-sm break-all">{generatedId.blockchainHash}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This ID is permanently recorded on the blockchain and cannot be tampered with.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Button variant="government" size="lg">
                    <Download className="w-4 h-4" />
                    Download Digital ID
                  </Button>
                  <Button variant="outline" size="lg">
                    <QrCode className="w-4 h-4" />
                    Print QR Code
                  </Button>
                  <Button variant="safety" size="lg">
                    Send to Mobile App
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="max-w-4xl mx-auto shadow-card-custom">
              <CardHeader>
                <CardTitle>Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold">Blockchain Security</h4>
                    <p className="text-sm text-muted-foreground">Immutable record on distributed ledger</p>
                  </div>
                  <div className="text-center">
                    <QrCode className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold">QR Code Verification</h4>
                    <p className="text-sm text-muted-foreground">Quick scan for instant authentication</p>
                  </div>
                  <div className="text-center">
                    <Hash className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h4 className="font-semibold">Cryptographic Hash</h4>
                    <p className="text-sm text-muted-foreground">Unique digital fingerprint</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristId;