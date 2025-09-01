import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentFormProps {
  onPayment: (e: React.FormEvent) => void;
  isProcessing: boolean;
}

export function PaymentForm({ onPayment, isProcessing }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedSavedMethod, setSelectedSavedMethod] = useState('');
  const { getTotalPrice } = useCart();
  const { t } = useLanguage();
  // Example: Replace with actual user payment methods from context or props
  const savedMethods = [
    { id: 'pm_1', label: 'Visa **** 1234' },
    { id: 'pm_2', label: 'Mastercard **** 5678' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t('checkout.paymentInformation')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onPayment} className="space-y-6">
          {/* Payment Method */}
          <div className="space-y-3">
            <Label>{t('checkout.paymentMethod')}</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {t('checkout.creditDebitCard')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal">{t('checkout.paypal')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile">{t('checkout.mobileMoney') || 'Mobile Money'}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saved" id="saved" />
                <Label htmlFor="saved">{t('checkout.savedPaymentMethod') || 'Saved Payment Method'}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Card Payment Fields */}
          {paymentMethod === 'card' && (
            <>
              {/* Card Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">{t('checkout.cardNumber')}</Label>
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">{t('checkout.expiryDate')}</Label>
                    <Input 
                      id="expiry" 
                      placeholder="MM/YY" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">{t('checkout.cvv')}</Label>
                    <Input 
                      id="cvv" 
                      placeholder="123" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardName">{t('checkout.cardholderName')}</Label>
                  <Input 
                    id="cardName" 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h3 className="font-semibold">{t('checkout.billingAddress')}</h3>
                <div>
                  <Label htmlFor="email">{t('checkout.email')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="address">{t('checkout.address')}</Label>
                  <Input 
                    id="address" 
                    placeholder="123 Main St" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{t('checkout.city')}</Label>
                    <Input 
                      id="city" 
                      placeholder="New York" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">{t('checkout.zipCode')}</Label>
                    <Input 
                      id="zip" 
                      placeholder="10001" 
                      required 
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mobile Money Fields */}
          {paymentMethod === 'mobile' && (
            <div className="space-y-4">
              <h3 className="font-semibold">{t('checkout.mobileMoneyDetails') || 'Mobile Money Details'}</h3>
              <div>
                <Label htmlFor="mobileNumber">{t('checkout.mobileNumber') || 'Mobile Number'}</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="e.g. +233 24 123 4567"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Saved Payment Method Fields */}
          {paymentMethod === 'saved' && (
            <div className="space-y-4">
              <h3 className="font-semibold">{t('checkout.selectSavedPayment') || 'Select Saved Payment Method'}</h3>
              <RadioGroup value={selectedSavedMethod} onValueChange={setSelectedSavedMethod}>
                {savedMethods.map(method => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id}>{method.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('checkout.processingPayment')}
              </>
            ) : (
              `${t('checkout.completeOrder')} - $${Number(getTotalPrice()).toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('checkout.securePayment')}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
