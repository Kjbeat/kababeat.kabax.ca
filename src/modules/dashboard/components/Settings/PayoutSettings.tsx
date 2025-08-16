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

export default function PayoutSettings() {
  const { t } = useLanguage();
  
  const [payoutMethod, setPayoutMethod] = useState<"paypal" | "momo">("paypal")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [momoCountry, setMomoCountry] = useState<"benin" | "ivory-coast">("benin")
  const [momoPhone, setMomoPhone] = useState("")

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          {t('payouts.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
        </div>

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
  )
}
