/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
  const [selectedLicense, setSelectedLicense] = useState<License | LicenseOption | null>(null);
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
      <DialogContent className="max-w-md w-[95vw] sm:w-auto">
        <DialogHeader>
          <DialogTitle>Select License</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Choose the license you want before adding to cart or free download.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <ToggleGroup type="single" value={selectedLicense ? ((selectedLicense as any).value || (selectedLicense as any).type) : ''} onValueChange={(v) => {
            if (v) {
              const license = (licenseOptions.length > 0 ? licenseOptions : licenses).find(l => (l as any).value === v || (l as any).type === v);
              if (license) setSelectedLicense(license);
            }
          }} className="flex flex-col gap-2 items-stretch">
            {(licenseOptions.length > 0 ? licenseOptions : licenses).map(opt => (
              <ToggleGroupItem
                key={(opt as any)._id || (opt as any).value}
                value={(opt as any).value || (opt as any).type}
                aria-label={(opt as any).label || (opt as any).name}
                className={`flex justify-between items-center w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-md border text-left ${selectedLicense && ((selectedLicense as any).value === (opt as any).value || (selectedLicense as any).type === (opt as any).type) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 hover:bg-muted/70'} transition-colors`}
              >
                <div className="flex flex-col text-[10px] sm:text-xs">
                  <span className="font-semibold text-[12px] sm:text-[13px] leading-tight">{(opt as any).label || (opt as any).name}</span>
                  {(opt as any).description && <span className="text-[9px] sm:text-[10px] opacity-70 mt-0.5">{(opt as any).description}</span>}
                </div>
                <div className="text-[10px] sm:text-[11px] font-medium">{calculatedPrices[(opt as any).value || (opt as any).type] === 0 ? 'FREE' : `$${calculatedPrices[(opt as any).value || (opt as any).type]?.toFixed(2) || (opt as any).price?.toFixed(2)}`}</div>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {selectedLicense && (
            <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2 sm:p-3">
              <p className="text-[11px] sm:text-xs font-medium mb-1">What's included:</p>
              <ul className="text-[9px] sm:text-[10px] leading-relaxed grid gap-1 list-disc pl-3 sm:pl-4">
                {(getLicenseDetails ? getLicenseDetails((selectedLicense as any).type || (selectedLicense as any).value) : (selectedLicense as any).features || []).map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter className="mt-2 flex gap-2 justify-end">
          <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs" onClick={handleAddToCart} disabled={!selectedLicense}>Add to Cart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
