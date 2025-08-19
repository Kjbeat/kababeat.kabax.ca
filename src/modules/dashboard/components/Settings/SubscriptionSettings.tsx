/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { CheckCircle, Crown, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/LanguageContext"

export default function SubscriptionSettings() {
  const { t } = useLanguage();
  
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [useSaved, setUseSaved] = useState(true)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>("card_1")
  // Mocked saved payment methods - replace with your real data source
  const [savedCards] = useState([
    { id: "card_1", brand: "Visa", last4: "4242", exp: "12/28", holder: "John Doe" },
    { id: "card_2", brand: "Mastercard", last4: "1881", exp: "03/27", holder: "Studio Account" },
  ])
  const [savedMomos] = useState([
    { id: "momo_1", provider: "MTN", country: "benin", phone: "+229 90 00 00 00" },
    { id: "momo_2", provider: "Orange", country: "ivory-coast", phone: "+225 07 00 00 00" },
  ])
  const [checkoutPlan, setCheckoutPlan] = useState<"Pro" | "Enterprise">("Enterprise")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [payMethod, setPayMethod] = useState<"card" | "momo">("card")
  const [country, setCountry] = useState<"benin" | "ivory-coast">("benin")
  const [coupon, setCoupon] = useState("")

  const planPrice = (plan: "Pro" | "Enterprise", cycle: "monthly" | "yearly") => {
    const monthly = plan === "Pro" ? 29 : 99
    if (cycle === "monthly") return monthly
    // yearly = 2 months free
    return monthly * 10
  }

  const openCheckout = (plan: "Pro" | "Enterprise") => {
    setCheckoutPlan(plan)
    setCheckoutOpen(true)
  }

  const handleConfirm = () => {
    // TODO: integrate with your payments backend
    console.log("Checkout submit", { plan: checkoutPlan, billingCycle, payMethod, country, coupon, useSaved, selectedPaymentId })
    setCheckoutOpen(false)
    setSuccessOpen(true)
  }

  return (
    <>
      {/* Subscription Management */}
      <Card >
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            {t('subscription.title')}
          </CardTitle>
          <p className="text-muted-foreground">{t('subscription.subtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan Overview */}
          <div className="p-5 border rounded-xl bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{t('subscription.current')}</Badge>
                <h3 className="text-xl font-semibold">Pro</h3>
                <span className="text-sm text-muted-foreground">{t('subscription.monthly')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => openCheckout("Enterprise")}>{t('subscription.changePlan')}</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">{t('subscription.cancel')}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        {t('subscription.cancelSubscription')}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>{t('subscription.cancelConfirm')}</p>
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">{t('subscription.whatHappensWhenCancel')}</h4>
                          <ul className="text-sm text-orange-700 space-y-1">
                            <li>• {t('subscription.accountRemainsPro')}</li>
                            <li>• {t('subscription.downgradedToFree')}</li>
                            <li>• {t('subscription.uploadLimitReduced')}</li>
                            <li>• {t('subscription.aiCreditsReset')}</li>
                            <li>• {t('subscription.loseAnalytics')}</li>
                          </ul>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('subscription.reactivateAnytime')}
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('subscription.keepSubscription')}</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('subscription.yesCancel')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Compact stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border px-3 py-2">
                <p className="text-[11px] text-muted-foreground">{t('subscription.standardUploads')}</p>
                <p className="text-sm font-medium">{t('subscription.unlimited')}</p>
              </div>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-[11px] text-muted-foreground">{t('subscription.aiUploadCredits')}</p>
                <p className="text-sm font-medium">200 / {t('subscription.monthly')}</p>
              </div>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-[11px] text-muted-foreground">{t('subscription.serviceFee')}</p>
                <p className="text-sm font-medium">0%</p>
              </div>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-[11px] text-muted-foreground">{t('subscription.nextPayment')}</p>
                <p className="text-sm font-medium">Feb 15, 2024</p>
              </div>
            </div>
          </div>
         
         
          {/* Plan Comparison */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('subscription.comparePlans')}</h3>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Free */}
              <div className="rounded-xl border p-5 hover:shadow-sm transition">
                <h4 className="text-base font-semibold">{t('subscription.free')}</h4>
                <div className="mt-1 text-3xl font-bold">$0 <span className="text-base text-muted-foreground font-normal">{t('subscription.perMonth')}</span></div>
                <p className="mt-1 text-sm text-muted-foreground">{t('subscription.createWithEssentials')}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>• 5 {t('subscription.uploadsPerMonth')}</li>
                  <li>• 10 {t('subscription.aiUploadCreditsPerMonth')}</li>
                  <li>• {t('subscription.communitySupport')}</li>
                  <li>• {t('subscription.basicAnalytics')}</li>
                  <li>• {t('subscription.accessPublicLibrary')}</li>
                </ul>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-5">{t('subscription.downgrade')}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('subscription.downgradeToFree')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('subscription.moveToFreePlan')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('subscription.cancel')}</AlertDialogCancel>
                      <AlertDialogAction>{t('subscription.confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Pro (current) */}
              <div className="relative rounded-xl border-2 border-primary bg-primary/5 p-5">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">{t('subscription.currentPlan')}</Badge>
                <h4 className="text-base font-semibold">{t('subscription.pro')}</h4>
                <div className="mt-1 text-3xl font-bold">$29 <span className="text-base text-muted-foreground font-normal">{t('subscription.perMonth')}</span></div>
                <p className="mt-1 text-sm text-muted-foreground">{t('subscription.speedInsightsGrowth')}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>• {t('subscription.unlimitedStandardUploads')}</li>
                  <li>• 200 {t('subscription.aiUploadCreditsPerMonth')}</li>
                  <li>• {t('subscription.prioritySupport')}</li>
                  <li>• {t('subscription.advancedAnalytics')}</li>
                  <li>• {t('subscription.accessBetaFeatures')}</li>
                </ul>
                <Button className="w-full mt-5" disabled>{t('subscription.currentPlan')}</Button>
              </div>

              {/* Enterprise */}
              <div className="rounded-xl border p-5 hover:shadow-sm transition">
                <h4 className="text-base font-semibold">{t('subscription.enterprise')}</h4>
                <div className="mt-1 text-3xl font-bold">$99 <span className="text-base text-muted-foreground font-normal">{t('subscription.perMonth')}</span></div>
                <p className="mt-1 text-sm text-muted-foreground">{t('subscription.forStudiosTeams')}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>• {t('subscription.unlimitedUploads')}</li>
                  <li>• 1000 {t('subscription.aiUploadCreditsPerMonth')}</li>
                  <li>• {t('subscription.prioritySupport247')}</li>
                  <li>• {t('subscription.dedicatedAccountManager')}</li>
                  <li>• {t('subscription.customIntegrations')}</li>
                </ul>
                <Button className="w-full mt-5" onClick={() => openCheckout("Enterprise")}>{t('subscription.upgrade')}</Button>
              </div>
            </div>
          </div>
          {/* Billing Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>{t('subscription.billingPreferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('subscription.autoRenewal')}</Label>
                  <p className="text-sm text-muted-foreground">{t('subscription.autoRenewalDescription')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('subscription.emailReceipts')}</Label>
                  <p className="text-sm text-muted-foreground">{t('subscription.emailReceiptsDescription')}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('subscription.billingReminders')}</Label>
                  <p className="text-sm text-muted-foreground">{t('subscription.billingRemindersDescription')}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('subscription.checkout')}</DialogTitle>
                <DialogDescription className="sr-only">{t('subscription.activateSubscription')}</DialogDescription>
              </DialogHeader>

              {/* Compact plan & billing selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{checkoutPlan}</Badge>
                    <span className="text-sm text-muted-foreground">{billingCycle === "monthly" ? t('subscription.monthly') : t('subscription.annual')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-semibold">${planPrice(checkoutPlan, billingCycle)}{billingCycle === "monthly" ? "/mo" : "/yr"}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Button size="sm" variant={checkoutPlan === "Pro" ? "default" : "outline"} onClick={() => setCheckoutPlan("Pro")}>{t('subscription.pro')}</Button>
                  <Button size="sm" variant={checkoutPlan === "Enterprise" ? "default" : "outline"} onClick={() => setCheckoutPlan("Enterprise")}>{t('subscription.enterprise')}</Button>

                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t('subscription.monthly')}</span>
                    <Switch
                      checked={billingCycle === "yearly"}
                      onCheckedChange={(v) => setBillingCycle(v ? "yearly" : "monthly")}
                    />
                    <span className="text-xs text-muted-foreground">{t('subscription.annual')}</span>
                  </div>
                </div>
                {/* <div className="text-right">
                  <button className="text-xs underline text-muted-foreground" onClick={() => {}}>{t('subscription.addPromoCode')}</button>
                </div> */}
              </div>

              {/* Payment method minimal */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" variant={payMethod === "card" ? "default" : "outline"} onClick={() => { setPayMethod("card"); setUseSaved(true); setSelectedPaymentId(savedCards[0]?.id ?? null) }}>{t('billing.card')}</Button>
                  <Button size="sm" variant={payMethod === "momo" ? "default" : "outline"} onClick={() => { setPayMethod("momo"); setUseSaved(true); setSelectedPaymentId(savedMomos[0]?.id ?? null) }}>{t('billing.mobileMoney')}</Button>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant={useSaved ? "default" : "outline"} onClick={() => setUseSaved(true)}>{t('subscription.saved')}</Button>
                    <Button size="sm" variant={!useSaved ? "default" : "outline"} onClick={() => setUseSaved(false)}>{t('subscription.new')}</Button>
                  </div>
                </div>

                {useSaved ? (
                  payMethod === "card" ? (
                    <div className="space-y-2">
                      {savedCards.map((c) => (
                        <label key={c.id} className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${selectedPaymentId === c.id ? 'border-primary' : ''}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="saved-method" checked={selectedPaymentId === c.id} onChange={() => setSelectedPaymentId(c.id)} />
                            <span className="text-sm">{c.brand} •••• {c.last4}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Exp {c.exp}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedMomos.map((m) => (
                        <label key={m.id} className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${selectedPaymentId === m.id ? 'border-primary' : ''}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="saved-method" checked={selectedPaymentId === m.id} onChange={() => setSelectedPaymentId(m.id)} />
                            <span className="text-sm">{m.provider} — {m.phone}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{m.country === 'benin' ? 'BJ' : 'CI'}</span>
                        </label>
                      ))}
                    </div>
                  )
                ) : (
                  payMethod === "card" ? (
                    <div className="grid gap-2">
                      <Input placeholder={t('subscription.name')} />
                      <Input placeholder={t('billing.cardNumber')} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="MM/YY" />
                        <Input placeholder="CVC" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <select className="w-full border rounded-md px-3 py-2" value={country} onChange={(e) => setCountry(e.target.value as any)}>
                        <option value="benin">{t('billing.benin')}</option>
                        <option value="ivory-coast">{t('billing.ivoryCoast')}</option>
                      </select>
                      <Input placeholder={t('subscription.phoneNumber')} />
                    </div>
                  )
                )}
              </div>

              {/* Summary & action */}
              <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-muted/20">
                <span className="text-sm text-muted-foreground">{t('subscription.total')}</span>
                <span className="text-lg font-semibold">${planPrice(checkoutPlan, billingCycle)}{billingCycle === "monthly" ? "/mo" : "/yr"}</span>
              </div>
              {billingCycle === "yearly" && (
                <p className="text-xs text-green-600 text-right">{t('subscription.save2Months')}</p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setCheckoutOpen(false)}>{t('subscription.close')}</Button>
                <Button onClick={handleConfirm}>{t('subscription.pay')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Success Dialog */}
          <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
            <DialogContent className="sm:max-w-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-14 w-14 mb-3">
                  <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="absolute inset-0 rounded-full bg-green-500" />
                  <CheckCircle className="absolute inset-0 m-auto h-8 w-8 text-white" />
                </div>
                <DialogTitle className="mb-1">{t('subscription.paymentSuccessful')}</DialogTitle>
                <DialogDescription className="mb-4">{checkoutPlan} {t('subscription.isNowActive')}</DialogDescription>
                <Button className="w-full" onClick={() => setSuccessOpen(false)}>{t('subscription.done')}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  )
}
