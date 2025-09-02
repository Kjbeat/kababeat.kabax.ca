/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Download, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface License {
  _id: string;
  name: string;
  type: 'FREE' | 'MP3' | 'WAV' | 'STEMS' | 'EXCLUSIVE';
  description: string;
  price: number;
  features: string[];
  usageRights: string;
  restrictions: string[];
  isActive: boolean;
  sortOrder: number;
}

interface LicenseOption {
  value: string;
  label: string;
  price: number;
  description: string;
}

interface LicenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  beatId: string;
  beatTitle: string;
  beatPrice: number;
  onDownload: (licenseType: string) => void;
  onAddToCart: (licenseType: string) => void;
  licenseOptions?: LicenseOption[];
  getLicenseDetails?: (licenseType: string) => string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export function LicenseDialog({ 
  isOpen, 
  onClose, 
  beatId, 
  beatTitle, 
  beatPrice, 
  onDownload, 
  onAddToCart,
  licenseOptions = [],
  getLicenseDetails
}: LicenseDialogProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculatedPrices, setCalculatedPrices] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (licenseOptions.length > 0) {
        // Use passed license options
        setLoading(false);
        const prices: Record<string, number> = {};
        licenseOptions.forEach(option => {
          prices[option.value] = option.price;
        });
        setCalculatedPrices(prices);
      } else {
        // Fallback to fetching from API
        fetchLicenses();
      }
    }
  }, [isOpen, licenseOptions]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/licenses/active`);
      if (!response.ok) throw new Error('Failed to fetch licenses');
      
      const data = await response.json();
      if (data.success) {
        setLicenses(data.data || []);
        
        // Calculate prices for each license
        const prices: Record<string, number> = {};
        for (const license of data.data || []) {
          if (license.type === 'FREE') {
            prices[license.type] = 0;
          } else {
            const priceResponse = await fetch(
              `${API_BASE_URL}/licenses/calculate-price?licenseType=${license.type}&beatBasePrice=${beatPrice}`
            );
            if (priceResponse.ok) {
              const priceData = await priceResponse.json();
              prices[license.type] = priceData.data?.price || license.price;
            } else {
              prices[license.type] = license.price;
            }
          }
        }
        setCalculatedPrices(prices);
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast({
        title: "Error",
        description: "Failed to load license options. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedLicense) return;
    onDownload((selectedLicense as any).type || (selectedLicense as any).value);
    onClose();
  };

  const handleAddToCart = () => {
    if (!selectedLicense) return;
    onAddToCart((selectedLicense as any).type || (selectedLicense as any).value);
    onClose();
  };

  const getLicenseIcon = (type: string) => {
    switch (type) {
      case 'FREE': return '🆓';
      case 'MP3': return '🎵';
      case 'WAV': return '🎶';
      case 'STEMS': return '🎛️';
      case 'EXCLUSIVE': return '👑';
      default: return '📄';
    }
  };

  const getLicenseColor = (type: string) => {
    switch (type) {
      case 'FREE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'MP3': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'WAV': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'STEMS': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'EXCLUSIVE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Choose License for "{beatTitle}"
          </DialogTitle>
          <DialogDescription>
            Select the license type that best fits your needs. Each license includes different rights and file formats.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {(licenseOptions.length > 0 ? licenseOptions : licenses).map((license) => {
              const price = calculatedPrices[license.value || license.type] || license.price;
              const isSelected = selectedLicense?._id === license._id || selectedLicense?.type === license.value;
              
              return (
                <div
                  key={license._id || license.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedLicense(license)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getLicenseIcon(license.type || license.value)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{license.name || license.label}</h3>
                          <Badge className={getLicenseColor(license.type || license.value)}>
                            {license.type || license.value}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{license.description}</p>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Features:</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                          {(getLicenseDetails ? getLicenseDetails(license.type || license.value) : license.features || []).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {license.restrictions && license.restrictions.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm text-muted-foreground">Restrictions:</h4>
                          <ul className="text-sm text-muted-foreground">
                            {license.restrictions.map((restriction, index) => (
                              <li key={index}>• {restriction}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold">
                        {price === 0 ? 'FREE' : `$${price}`}
                      </div>
                      {price > 0 && (
                        <div className="text-sm text-muted-foreground">
                          Base: ${beatPrice}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-2">Usage Rights:</h4>
                        <p className="text-sm text-muted-foreground">{license.usageRights || 'See features above for usage details.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedLicense ? (
              <>
                Selected: <span className="font-medium">{(selectedLicense as any).name || (selectedLicense as any).label}</span>
                {calculatedPrices[(selectedLicense as any).type || (selectedLicense as any).value] > 0 && (
                  <span className="ml-2">- ${calculatedPrices[(selectedLicense as any).type || (selectedLicense as any).value]}</span>
                )}
              </>
            ) : (
              'Please select a license to continue'
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {selectedLicense && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleAddToCart}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {calculatedPrices[(selectedLicense as any).type || (selectedLicense as any).value] === 0 ? 'Download Free' : 'Buy & Download'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
