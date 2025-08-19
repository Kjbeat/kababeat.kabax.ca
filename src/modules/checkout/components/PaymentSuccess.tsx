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
            <div className="text-lg font-medium">{typeof total !== 'undefined' ? `$${Number(total).toFixed(2)}` : "N/A"}</div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="text-base text-primary font-semibold">
              {t('paymentSuccess.nextStepsTitle') || 'What happens next?'}
            </div>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>{t('paymentSuccess.libraryAccess') || 'Your purchased beats are now available in your Library.'}</li>
              <li>{t('paymentSuccess.downloadInfo') || 'You can download your beats and access license documents from the Library page.'}</li>
              <li>{t('paymentSuccess.supportInfo') || 'If you have any issues, contact support or check your email for order details.'}</li>
            </ul>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-2">
            <Button onClick={() => navigate("/library")}>{t('paymentSuccess.goToLibrary')}</Button>
            <Button variant="outline" onClick={() => navigate("/browse")}>{t('paymentSuccess.continueBrowsing')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
