import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type PaymentState = { items?: unknown[]; total?: number; orderId?: string } | null;

export function PaymentSuccess() {
  const location = useLocation() as { state: PaymentState };
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { items, total, orderId } = location.state || {};

  useEffect(() => {
    toast({
      title: "Payment Successful",
      description: orderId ? `Order #${orderId} confirmed.` : "Your payment was processed successfully.",
    });
  }, [orderId, toast]);

  return (
    <div className="container mx-auto p-6 mt-5">
      <PageHeader title={t('paymentSuccess.title')} description={t('paymentSuccess.description')} />
      <Card>
        <CardContent className="py-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">{t('paymentSuccess.orderId')}</div>
            <div className="text-lg font-medium">{orderId || "N/A"}</div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="text-sm text-muted-foreground">{t('paymentSuccess.totalPaid')}</div>
            <div className="text-lg font-medium">{typeof total !== 'undefined' ? `$${total}` : "N/A"}</div>
          </div>
          <div className="mt-6">
            <Button onClick={() => navigate("/library")}>{t('paymentSuccess.goToLibrary')}</Button>
            <Button variant="outline" className="ml-2" onClick={() => navigate("/browse")}>{t('paymentSuccess.continueBrowsing')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
