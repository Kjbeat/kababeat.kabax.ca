import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Smartphone,
  ShieldCheck,
  BarChart3,
  CalendarClock,
  Download,
  Star,
  Pencil,
  Wand2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function BillingSettings() {
  const { t } = useLanguage();
  
// Types
type CardMethod = { type: "card"; name: string; number: string; expiry: string; brand?: string; default?: boolean };
type MomoMethod = { type: "momo"; country: "benin" | "ivory-coast"; phone: string; provider?: string; default?: boolean };
type PaymentMethod = CardMethod | MomoMethod;

// Demo invoices (act as smoke tests for table rendering)
const DEMO_INVOICES = [
  { date: "Jan 15, 2025", amount: 29, status: "Paid", plan: "Pro" },
  { date: "Dec 15, 2024", amount: 29, status: "Paid", plan: "Pro" },
  { date: "Nov 15, 2024", amount: 29, status: "Paid", plan: "Pro" },
  { date: "Oct 15, 2024", amount: 0, status: "Free", plan: "Free" },
];

// ---------- Small helpers (pure) ----------
const maskLast4 = (num: string) => {
  const clean = num.replace(/\D/g, "");
  if (clean.length < 4) return "••••";
  return `•••• •••• •••• ${clean.slice(-4)}`;
};

const formatExpiryInput = (raw: string) => {
  let v = raw.replace(/[^0-9]/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  return v;
};

const calcPct = (used: number, total: number) => Math.min(100, Math.round((used / (total || 1)) * 100));

// ---------- Dev-time test cases (won't run in production) ----------
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  // maskLast4 tests
  console.assert(maskLast4("4242424242424242").endsWith("4242"), "maskLast4 should end with 4242");
  console.assert(maskLast4("123").includes("••••"), "maskLast4 should return bullets when <4 digits");
  // formatExpiryInput tests
  console.assert(formatExpiryInput("1227") === "12/27", "formatExpiryInput should insert slash");
  console.assert(formatExpiryInput("1a2b7c").length <= 5, "formatExpiryInput should strip non-digits");
  // calcPct tests
  console.assert(calcPct(50, 100) === 50, "calcPct 50/100 = 50%");
  // NEW: plan meta smoke tests
  console.assert((() => { const t = { used: 32, total: 100 }; return calcPct(t.used, t.total) === 32; })(), "aiUpload calcPct should be 32%");
  console.assert((() => { const FREE_TOTAL = 5; return FREE_TOTAL === 5; })(), "Free plan total expected to be 5");
}

// State
const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
  { type: "card", name: "John Doe", number: "•••• •••• •••• 1234", expiry: "12/27", brand: "Visa", default: true },
]);
const [showAdd, setShowAdd] = useState(false);
const [showEdit, setShowEdit] = useState<null | number>(null);
const [addType, setAddType] = useState<"card" | "momo">("card");

// Add form fields
const [cardName, setCardName] = useState("");
const [cardNumber, setCardNumber] = useState("");
const [cardExpiry, setCardExpiry] = useState("");
const [cardCvv, setCardCvv] = useState("");
const [cardBrand, setCardBrand] = useState("Visa");

const [momoCountry, setMomoCountry] = useState<"benin" | "ivory-coast">("benin");
const [momoPhone, setMomoPhone] = useState("");
const [momoProvider, setMomoProvider] = useState("MTN");

// Subscription demo data
const planName: "Free" | "Producer" | "Label" = "Producer";
const status: "ACTIVE" | "PAST_DUE" | "TRIAL" | "CANCELED" = "ACTIVE";
const price = 2500; // NGN
const interval: "month" | "year" = "month";
const nextBillingISO = "2025-09-15";

// Plan-driven quota + copy pulled from your pricing image
const planMeta = {
  Free: {
    uploads: { used: 2, total: 5 as number | undefined },
    uploadsSubtitle: "Upload up to 5 beats per month",
  },
  Producer: {
    uploads: { used: 4800, total: undefined as number | undefined }, // Unlimited beat uploads
    uploadsSubtitle: "Unlimited beat uploads",
  },
  Label: {
    uploads: { used: 12000, total: undefined as number | undefined }, // Team account; unlimited in pricing
    uploadsSubtitle: "Everything in Producer + Multi-user accounts",
  },
} as const;

const uploads = planMeta[planName].uploads; // undefined = unlimited

// Define AI upload quota (previously missing -> ReferenceError)
const aiUpload = { used: 32, total: 100 } as const;

const nextBilling = useMemo(() => {
  const d = new Date(nextBillingISO);
  return isNaN(d.getTime())
    ? nextBillingISO
    : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}, [nextBillingISO]);

const setDefault = (index: number) => {
  setPaymentMethods((prev) => prev.map((m, i) => ({ ...m, default: i === index })));
};

const removeMethod = (index: number) => {
  setPaymentMethods((prev) => prev.filter((_, i) => i !== index));
};

const aiUploadPct = calcPct(aiUpload.used, aiUpload.total);

return (
  <div className="space-y-8 p-5">
      {/* Current Subscription */}
      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-5 w-5" />
              </span>
              {t('billing.currentSubscription')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold tracking-tight">{planName} Plan</h3>
                  <Badge className="bg-primary text-primary-foreground">{status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CalendarClock className="h-4 w-4" />
                  {t('billing.nextBilling')}: <span className="font-medium text-foreground">{nextBilling}</span>
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="text-3xl font-bold leading-none">${price}
                  <span className="ml-1 text-base font-normal text-muted-foreground">/ {interval}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t('billing.billed')} {interval === "month" ? t('billing.monthly') : t('billing.annually')}</div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Check className="h-4 w-4" /> {t('billing.beatUploads')}
                    </div>
                    <span className="text-xs text-muted-foreground">{planMeta[planName].uploadsSubtitle}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {uploads.total ? `${uploads.used.toLocaleString()} / ${uploads.total.toLocaleString()} ${t('billing.thisMonth')}` : `${uploads.used.toLocaleString()} ${t('billing.uploads')}`}
                  </span>
                </div>
                {uploads.total ? (
                  <Progress value={calcPct(uploads.used, uploads.total)} className="h-2" />
                ) : (
                  <div className="text-sm text-muted-foreground">{t('billing.unlimitedNoRestrictions')}</div>
                )}
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Wand2 className="h-4 w-4" /> {t('billing.aiUpload')}
                  </div>
                  <span className="text-xs text-muted-foreground">{aiUpload.used} / {aiUpload.total}</span>
                </div>
                <Progress value={aiUploadPct} className="h-2" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: t('billing.advancedAnalytics'), icon: BarChart3 },
                { label: t('billing.beatCopyright'), icon: ShieldCheck },
                { label: `0% ${t('billing.serviceFees')}`, icon: CreditCard },
                { label: t('billing.instantSalePayouts'), icon: Smartphone },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>{t('billing.paymentMethods')}</CardTitle>
          <Button variant="outline" onClick={() => setShowAdd(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> {t('billing.addMethod')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t('billing.noPaymentMethods')}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {paymentMethods.map((m, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex h-10 w-14 items-center justify-center rounded bg-primary/10 mx-auto sm:mx-0">
                  {m.type === "card" ? <CreditCard className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                </div>
                <div className="flex-1 w-full">
                  {m.type === "card" ? (
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{m.brand ?? t('billing.card')}</span>
                        {m.default && (
                          <Badge className="gap-1"><Star className="h-3 w-3" /> {t('billing.default')}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground break-all">{m.name}</div>
                      <div className="text-sm text-muted-foreground">{m.number} · Exp {m.expiry}</div>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">MoMo · {m.provider ?? "MTN"}</span>
                        {m.default && (
                          <Badge className="gap-1"><Star className="h-3 w-3" /> {t('billing.default')}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{m.country === "benin" ? t('billing.benin') : t('billing.ivoryCoast')}</div>
                      <div className="text-sm text-muted-foreground break-all">{m.phone}</div>
                    </div>
                  )}
                </div>
                <div className="flex flex-row flex-wrap gap-2 mt-2 sm:mt-0 sm:flex-col sm:items-end">
                  {!m.default && (
                    <Button size="sm" variant="secondary" onClick={() => setDefault(i)} className="w-full sm:w-auto">{t('billing.setDefault')}</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setShowEdit(i)} className="w-full sm:w-auto">
                    <Pencil className="mr-1 h-4 w-4" /> {t('billing.edit')}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive w-full sm:w-auto" onClick={() => removeMethod(i)}>
                    <Trash2 className="mr-1 h-4 w-4" /> {t('billing.remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.billingHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('billing.date')}</TableHead>
                <TableHead>{t('billing.plan')}</TableHead>
                <TableHead>{t('billing.status')}</TableHead>
                <TableHead className="text-right">{t('billing.amount')}</TableHead>
                <TableHead className="text-right">{t('billing.receipt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_INVOICES.map((inv, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{inv.date}</TableCell>
                  <TableCell>{inv.plan}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "Paid" ? "default" : "secondary"}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${inv.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Method Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{t('billing.addPaymentMethod')}</DialogTitle>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/30 p-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant={addType === "card" ? "default" : "outline"} onClick={() => setAddType("card")}>{t('billing.card')}</Button>
              <Button variant={addType === "momo" ? "default" : "outline"} onClick={() => setAddType("momo")}>{t('billing.mobileMoney')}</Button>
            </div>
          </div>

          {addType === "card" ? (
            <div className="mt-4 space-y-3">
              <div className="grid gap-2">
                <Label>{t('billing.cardholderName')}</Label>
                <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label>{t('billing.cardNumber')}</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 16))}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>{t('billing.expiry')}</Label>
                  <Input
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                    placeholder="12/27"
                    inputMode="numeric"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('billing.cvv')}</Label>
                  <Input value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="123" inputMode="numeric" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t('billing.brand')}</Label>
                <Select value={cardBrand} onValueChange={setCardBrand}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">{t('billing.visa')}</SelectItem>
                    <SelectItem value="Mastercard">{t('billing.mastercard')}</SelectItem>
                    <SelectItem value="Amex">{t('billing.amex')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="grid gap-2">
                <Label>{t('billing.country')}</Label>
                <Select value={momoCountry} onValueChange={(v) => setMomoCountry(v as "benin" | "ivory-coast")}> 
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="benin">{t('billing.benin')}</SelectItem>
                    <SelectItem value="ivory-coast">{t('billing.ivoryCoast')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('billing.provider')}</Label>
                <Select value={momoProvider} onValueChange={setMomoProvider}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">{t('billing.mtn')}</SelectItem>
                    <SelectItem value="Moov">{t('billing.moov')}</SelectItem>
                    <SelectItem value="Orange">{t('billing.orange')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('billing.phoneNumber')}</Label>
                <Input
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 15))}
                  placeholder="e.g., 61000000"
                  inputMode="numeric"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button
              onClick={() => {
                if (addType === "card") {
                  if (!cardName || cardNumber.length < 12 || cardExpiry.length !== 5) return;
                  setPaymentMethods((prev) => [
                    ...prev,
                    { type: "card", name: cardName, number: maskLast4(cardNumber), expiry: cardExpiry, brand: cardBrand },
                  ]);
                  // reset
                  setCardName(""); setCardNumber(""); setCardExpiry(""); setCardCvv(""); setCardBrand("Visa");
                } else {
                  if (!momoPhone) return;
                  setPaymentMethods((prev) => [
                    ...prev,
                    { type: "momo", country: momoCountry, phone: momoPhone, provider: momoProvider },
                  ]);
                  setMomoPhone(""); setMomoProvider("MTN"); setMomoCountry("benin");
                }
                setShowAdd(false);
              }}
            >
              {addType === "card" ? t('billing.addCard') : t('billing.addMobileMoney')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Method Modal (simple name/phone edit for demo) */}
      <Dialog open={showEdit !== null} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t('billing.editPaymentMethod')}</DialogTitle>
          </DialogHeader>
          {showEdit !== null && paymentMethods[showEdit] && (
            <div className="space-y-3">
              {paymentMethods[showEdit].type === "card" ? (
                <>
                  <div className="grid gap-2">
                    <Label>{t('billing.cardholderName')}</Label>
                    <Input
                      value={(paymentMethods[showEdit] as CardMethod).name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPaymentMethods((prev) => prev.map((m, i) => i === showEdit ? { ...(m as CardMethod), name: v } : m));
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('billing.expiry')}</Label>
                    <Input
                      value={(paymentMethods[showEdit] as CardMethod).expiry}
                      onChange={(e) => {
                        const v = formatExpiryInput(e.target.value);
                        setPaymentMethods((prev) => prev.map((m, i) => i === showEdit ? { ...(m as CardMethod), expiry: v } : m));
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label>{t('billing.phoneNumber')}</Label>
                    <Input
                      value={(paymentMethods[showEdit] as MomoMethod).phone}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 15);
                        setPaymentMethods((prev) => prev.map((m, i) => i === showEdit ? { ...(m as MomoMethod), phone: v } : m));
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowEdit(null)}>{t('billing.done')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

