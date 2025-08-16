import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { OrderSummary } from './OrderSummary';
import { PaymentForm } from './PaymentForm';

export function CheckoutLayout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      toast({
        title: "Payment Successful!",
        description: "Your beats have been purchased and are now available in your library.",
      });
      navigate('/payment-success', { 
        state: { 
          items,
          total: getTotalPrice(),
          orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        }
      });
    }, 3000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{t('checkout.empty.title')}</h1>
            <p className="text-muted-foreground mb-6">{t('checkout.empty.description')}</p>
            <Button onClick={() => navigate('/browse')}>{t('checkout.empty.browse')}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('checkout.back')}
          </Button>
          <h1 className="text-3xl font-bold">{t('checkout.title')}</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <OrderSummary />
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <PaymentForm onPayment={handlePayment} isProcessing={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
}
