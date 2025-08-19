/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function PayoutSettings() {
  const { t } = useLanguage();
  
  const [payoutMethod, setPayoutMethod] = useState<"paypal" | "momo">("paypal")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [momoCountry, setMomoCountry] = useState<"benin" | "ivory-coast">("benin")
  const [momoPhone, setMomoPhone] = useState("")

  // Add state for saved payout method
  const [savedMethod, setSavedMethod] = useState<null | { type: 'paypal' | 'momo', email?: string, country?: string, phone?: string }>(null);
  const [editing, setEditing] = useState(false);

  // Helper to get method summary
  const getMethodSummary = () => {
    if (!savedMethod) return '';
    if (savedMethod.type === 'paypal') return `PayPal: ${savedMethod.email}`;
    if (savedMethod.type === 'momo') return `Mobile Money: ${savedMethod.phone} (${savedMethod.country})`;
    return '';
  };

  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Time"

  // Compute next payout Date at local midnight on the 1st of next month
  const computeNextPayout = () => {
    const now = new Date()
    const year = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
    const month = (now.getMonth() + 1) % 12
    return new Date(year, month, 1, 0, 0, 0)
  }

  const [nextPayoutAt, setNextPayoutAt] = useState<Date>(computeNextPayout())
  const [remaining, setRemaining] = useState<{d:number;h:number;m:number;s:number}>({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime()
      const diff = Math.max(0, nextPayoutAt.getTime() - now)
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setRemaining({ d, h, m, s })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [nextPayoutAt])

  const nextPayoutDate = nextPayoutAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })

  // Mock payout history data
  const payoutHistory = [
    {
      date: "2024-06-01",
      amount: 500.00,
      method: "PayPal",
      details: "john@example.com",
      status: "Paid",
      id: "TXN-001"
    },
    {
      date: "2024-05-01",
      amount: 300.00,
      method: "Mobile Money",
      details: "+229 90 00 00 00 (Benin)",
      status: "Paid",
      id: "TXN-002"
    },
    {
      date: "2024-04-01",
      amount: 200.00,
      method: "PayPal",
      details: "john@example.com",
      status: "Paid",
      id: "TXN-003"
    },
  ];

  return (
    <Tabs defaultValue="settings" className="w-full mt-16 p-5">
      <TabsList className="mb-4 ">
        <TabsTrigger value="settings">{t('payouts.settingsTab') || 'Settings'}</TabsTrigger>
        <TabsTrigger value="history">{t('payouts.historyTab') || 'Payout History'}</TabsTrigger>
      </TabsList>
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center ">
              <DollarSign className="h-5 w-5 mr-2" />
              {t('payouts.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Always show available balance */}
            <div className="p-4 rounded-lg border bg-emerald-50/70 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">{t('payouts.availableBalance')}</h3>
                  <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">{t('payouts.readyForWithdrawal')}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$1,247.85</p>
                </div>
              </div>
            </div>
            {/* Payout method management */}
            {savedMethod && !editing ? (
              <div className="p-4 rounded-lg border bg-emerald-50/70 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">{t('payouts.savedMethod') || 'Saved Payout Method'}</h3>
                    <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">{getMethodSummary()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditing(true);
                      if (savedMethod.type === 'paypal') {
                        setPayoutMethod('paypal');
                        setPaypalEmail(savedMethod.email || '');
                      } else {
                        setPayoutMethod('momo');
                        setMomoCountry((savedMethod.country as any) || 'benin');
                        setMomoPhone(savedMethod.phone || '');
                      }
                    }}>{t('payouts.edit') || 'Edit'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => setSavedMethod(null)}>{t('payouts.remove') || 'Remove'}</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">{t('payouts.payoutMethod')}</h3>
                <Select value={payoutMethod} onValueChange={(v) => setPayoutMethod(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('payouts.selectMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">{t('payouts.paypal')}</SelectItem>
                    <SelectItem value="momo">{t('payouts.mobileMoney')}</SelectItem>
                  </SelectContent>
                </Select>
                {payoutMethod === "paypal" && (
                  <div className="space-y-2">
                    <Label htmlFor="paypal-email">{t('payouts.paypalEmail')}</Label>
                    <Input id="paypal-email" type="email" placeholder="you@example.com" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} />
                  </div>
                )}
                {payoutMethod === "momo" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t('billing.country')}</Label>
                      <Select value={momoCountry} onValueChange={(v) => setMomoCountry(v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('billing.country')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="benin">{t('billing.benin')}</SelectItem>
                          <SelectItem value="ivory-coast">{t('billing.ivoryCoast')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="momo-phone">{t('payouts.mobileMoneyNumber')}</Label>
                      <Input id="momo-phone" type="tel" placeholder="e.g., +229 90 00 00 00" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} />
                    </div>
                  </div>
                )}
                <Button className="mt-4" onClick={() => {
                  if (payoutMethod === 'paypal' && paypalEmail) {
                    setSavedMethod({ type: 'paypal', email: paypalEmail });
                    setEditing(false);
                  } else if (payoutMethod === 'momo' && momoPhone) {
                    setSavedMethod({ type: 'momo', country: momoCountry, phone: momoPhone });
                    setEditing(false);
                  }
                }}>{t('payouts.save') || 'Save'}</Button>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('payouts.howPayoutsWork')}</h3>
              <div className="space-y-4">
                <p className="text-sm text-foreground">
                  {t('payouts.payoutsProcessed')} <span className="font-medium">{t('payouts.onFirstOfMonth')}</span> {t('payouts.inLocalTimezone')}
                  (<span className="font-mono text-xs">{userTz}</span>). {t('payouts.fromPreviousMonth')}
                </p>

                <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-background">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('payouts.nextPayout')}</p>
                    <p className="text-sm font-medium">{nextPayoutDate} • 00:00 ({userTz})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t('payouts.timeRemaining')}</p>
                    <p className="font-semibold tabular-nums">{remaining.d}d {remaining.h}h {remaining.m}m {remaining.s}s</p>
                  </div>
                </div>

                <ul className="text-sm space-y-1">
                  <li>• {t('payouts.salesThisMonth')}</li>
                  <li>• {t('payouts.onFirstNextMonth')}</li>
                  <li>• {t('payouts.fundsGoTo')} {payoutMethod === 'paypal' ? t('payouts.paypalEmailLower') : t('payouts.momoNumber')}.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>{t('payouts.historyTab') || 'Payout History'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payouts.date') || 'Date'}</TableHead>
                  <TableHead>{t('payouts.amount') || 'Amount'}</TableHead>
                  <TableHead>{t('payouts.method') || 'Method'}</TableHead>
                  <TableHead>{t('payouts.details') || 'Details'}</TableHead>
                  <TableHead>{t('payouts.status') || 'Status'}</TableHead>
                  <TableHead>{t('payouts.id') || 'Transaction ID'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutHistory.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{new Date(payout.date).toLocaleDateString()}</TableCell>
                    <TableCell>${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{payout.method}</TableCell>
                    <TableCell>{payout.details}</TableCell>
                    <TableCell>{payout.status}</TableCell>
                    <TableCell>{payout.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
