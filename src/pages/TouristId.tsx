import React, { useEffect, useState } from 'react';
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
  const [generatedId, setGeneratedId] = useState<{
    serial?: string;
    qrCode?: string;
    blockchainHash?: string;
    issuedAt?: string;
    validUntil?: string;
  }>({});
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // Removed local file uploads in favor of DigiLocker verification
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentId = async () => {
    try {
      const res = await fetch('/api/tourists/me/digital-id', { credentials: 'include' });
      const json = await res.json();
      if (json?.success && json.data) {
        setGeneratedId({
          serial: undefined,
          qrCode: json.data.qrCode,
          blockchainHash: json.data.blockchainHash,
          issuedAt: json.data.issuedAt,
          validUntil: json.data.expiresAt
        });
      }
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/tourists/me/digital-id/history', { credentials: 'include' });
      const json = await res.json();
      if (json?.success) setHistory(json.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchCurrentId();
    fetchHistory();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep(2);
    // Wait on step 2 for user to verify via DigiLocker; issuance is triggered from a button in step 2
    setLoading(false);
  };

  const handleGenerateAfterKyc = async () => {
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append('documentType', formData.passportNumber ? 'passport' : 'aadhaar');
      form.append('documentNumber', formData.passportNumber || formData.aadhaarNumber);
      form.append('validDays', String(30));

      const res = await fetch('/api/tourists/me/digital-id', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: form
      });
      const json = await res.json();
      if (json?.success) {
        setGeneratedId({
          serial: json.data.card.serial,
          qrCode: json.data.card.qrDataUrl,
          blockchainHash: json.data.blockchainHash,
          issuedAt: json.data.card.issuedAt,
          validUntil: json.data.card.expiresAt
        });
        setStep(3);
        fetchHistory();
      } else {
        setError(json?.message || 'Failed to issue Digital ID');
        setStep(1);
      }
    } catch (err) {
      setError('Network or server error while issuing Digital ID');
      setStep(1);
    } finally {
      setLoading(false);
    }
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
              {error && (
                <div className="mb-4 text-sm text-red-600">{error}</div>
              )}
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

                <div className="space-y-2">
                  <h4 className="font-semibold">Verification</h4>
                  <p className="text-sm text-muted-foreground">We use DigiLocker for secure document verification.</p>
                </div>

                <Button type="submit" variant="government" size="lg" className="w-full" disabled={loading}>
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
                <span>DigiLocker Verification</span>
              </CardTitle>
              <CardDescription>Verify your identity documents securely via DigiLocker</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 space-y-4">
              {error && (
                <div className="mb-2 text-sm text-red-600">{error}</div>
              )}
              <a
                href="https://www.digilocker.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary/10"
              >
                Open DigiLocker
              </a>
              <p className="text-sm text-muted-foreground">After verifying your documents, click Generate Digital ID.</p>
              <Button onClick={handleGenerateAfterKyc} variant="government" disabled={loading}>
                Generate Digital ID
              </Button>
              <div className="text-xs text-muted-foreground">Having trouble? Make sure your tourist profile is created first.</div>
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
                        <h4 className="text-xl font-bold">{formData.fullName || 'Your Name'}</h4>
                        <p className="text-sm opacity-90">Serial: {generatedId.serial || '—'}</p>
                        <p className="text-sm opacity-90">Nationality: {formData.nationality || '—'}</p>
                        <p className="text-sm opacity-90">Valid Until: {generatedId.validUntil ? new Date(generatedId.validUntil).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* QR Code and Details */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">QR Code & Blockchain Details</h3>
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto bg-background border rounded-lg flex items-center justify-center overflow-hidden">
                        {generatedId.qrCode ? (
                          <img src={generatedId.qrCode} alt="QR Code" className="w-full h-full object-contain" />
                        ) : (
                          <QrCode className="w-32 h-32 text-muted-foreground" />
                        )}
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
                    <p className="font-mono text-sm break-all">{generatedId.blockchainHash || '—'}</p>
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
          
          {/* History */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IdCard className="w-6 h-6 text-primary" />
                <span>Digital ID History</span>
              </CardTitle>
              <CardDescription>Your previously issued trip IDs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((card) => (
                  <div key={card.serial} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{card.serial}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${card.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{card.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Issued: {new Date(card.issuedAt).toLocaleDateString()}</div>
                      <div>Expires: {new Date(card.expiresAt).toLocaleDateString()}</div>
                    </div>
                    <div className="border rounded md:h-40 h-32 overflow-hidden flex items-center justify-center bg-background">
                      <img src={card.qrDataUrl} alt={card.serial} className="max-h-full" />
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-muted-foreground">No IDs issued yet.</p>
                )}
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