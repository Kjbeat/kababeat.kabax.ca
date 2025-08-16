import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function OrderSummary() {
  const { items, getTotalPrice } = useCart();
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('checkout.orderSummary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.licenseType}`} className="flex items-center gap-4">
            <img 
              src={item.artwork || "/placeholder.svg"} 
              alt={item.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{t('checkout.by')} {item.producer}</p>
              <p className="text-sm text-muted-foreground">{item.licenseType} {t('checkout.license')}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${item.price}</p>
              <p className="text-sm text-muted-foreground">{t('checkout.qty')}: {item.quantity}</p>
            </div>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between items-center font-bold text-lg">
          <span>{t('checkout.total')}</span>
          <span>${getTotalPrice()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
