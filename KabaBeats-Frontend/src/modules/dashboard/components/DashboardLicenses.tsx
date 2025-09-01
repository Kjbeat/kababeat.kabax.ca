/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  DollarSign,
  Globe,
  Users,
  Radio,
  Video,
  Music,
  Save,
  Eye,
  Settings,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const licenseTypes = [
  {
    id: "mp3",
    name: "licenses.mp3License",
    description: "licenses.basicLicenseDescription",
    price: 25,
    enabled: true,
    icon: Music,
  },
  {
    id: "wav",
    name: "licenses.wavLicense",
    description: "licenses.highQualityDescription",
    price: 45,
    enabled: true,
    icon: Music,
  },
  {
    id: "trackout",
    name: "licenses.trackoutLicense",
    description: "licenses.individualStemsDescription",
    price: 149,
    enabled: true,
    icon: FileText,
  },
  {
    id: "unlimited",
    name: "licenses.unlimitedLicense",
    description: "licenses.noUsageRestrictionsDescription",
    price: 299,
    enabled: false,
    icon: Globe,
  },
  {
    id: "exclusive",
    name: "licenses.exclusiveLicense",
    description: "licenses.fullOwnershipRightsDescription",
    price: 2999,
    enabled: true,
    icon: Settings,
  },
]

export default function DashboardLicenses() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const { t } = useLanguage()
  
  // Contract HTML preview component
  const LicenseContractPreview = ({ license, config }) => {
    // Example placeholders, replace with real data as needed
    const buyerName = "[Customer Name]"
    const buyerEmail = "[Customer Email]"
    const location = "[City], [State], [Country]"
    const sellerName = "[Producer Name]"
    const trackTitle = "[Track Title]"
    const licenseId = `LIC-${Date.now()}`
    const effectiveDate = new Date().toLocaleDateString()
    // Use actual config values, fallback to placeholders if not set
    const price = config.price ?? license.price
    const territory = config.territory ?? "N/A"
    const streamLimit = config.streamLimit === -1 ? t('licenses.unlimited') : config.streamLimit?.toLocaleString()
    const saleLimit = config.saleLimit === -1 ? t('licenses.unlimited') : config.saleLimit?.toLocaleString()
    const distribution = config.distribution ? t('licenses.included') : t('licenses.notIncluded')
    const videos = config.videos ? t('licenses.included') : t('licenses.notIncluded')
    const radio = config.radio ? t('licenses.included') : t('licenses.notIncluded')
    const live = config.live ? t('licenses.included') : t('licenses.notIncluded')
    return (
      <div className="max-h-[600px] overflow-y-auto px-6 py-4 text-sm text-foreground">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-bold text-xl">{t('licenses.nonExclusiveMusicLicenceAgreement')}</div>
          <div className="text-xs text-muted-foreground">{t('licenses.licenseId')}: {licenseId}</div>
        </div>
        <div className="mb-2">{t('licenses.effectiveDate')}: {effectiveDate}</div>
        <div className="mb-2">{t('licenses.buyer')}: {buyerName} ({buyerEmail})</div>
        <div className="mb-2">{t('licenses.location')}: {location}</div>
        <div className="mb-2">{t('licenses.seller')}: {sellerName}</div>
        <div className="mb-2">{t('licenses.trackTitle')}: {trackTitle}</div>
        <div className="mb-2">{t('licenses.licenseType')}: {t(license.name)}</div>
        <div className="mb-2">{t('licenses.pricePaid')}: ${price}.00</div>
        <div className="mb-2">{t('licenses.territory')}: {territory}</div>
        <hr className="my-4" />
        <div className="mb-2 font-bold">1. {t('licenses.grantOfRights')}</div>
        <div className="mb-4">{t('licenses.grantOfRightsText').replace('{trackTitle}', trackTitle).replace('{sellerName}', sellerName)}</div>
        <div className="mb-2 font-bold">2. {t('licenses.permittedUsage')}</div>
        <div className="mb-4">
          <div>{t('licenses.distributableCopies')}: {saleLimit}</div>
          <div>{t('licenses.audioStreams')}: {streamLimit}</div>
          <div>{t('licenses.freeDownloads')}: {saleLimit}</div>
          <div>{t('licenses.musicVideos')}: {videos}</div>
          <div>{t('licenses.digitalDistribution')}: {distribution}</div>
          <div>{t('licenses.radioBroadcastingRights')}: {radio}</div>
          <div>{t('licenses.livePerformanceRights')}: {live}</div>
        </div>
        <div className="mb-2 font-bold">3. {t('licenses.restrictions')}</div>
        <div className="mb-4">{t('licenses.restrictionsText')}</div>
        <div className="mb-2 font-bold">4. {t('licenses.creditsAttribution')}</div>
        <div className="mb-4">{t('licenses.creditsAttributionText').replace('{sellerName}', sellerName)}</div>
        <div className="mb-2 font-bold">5. {t('licenses.sampleClearances')}</div>
        <div className="mb-4">{t('licenses.sampleClearancesText')}</div>
        <div className="mb-2 font-bold">6. {t('licenses.modifications')}</div>
        <div className="mb-4">{t('licenses.modificationsText')}</div>
        <div className="mb-2 font-bold">7. {t('licenses.ownershipCopyright')}</div>
        <div className="mb-4">{t('licenses.ownershipCopyrightText')}</div>
        <div className="mb-2 font-bold">8. {t('licenses.indemnification')}</div>
        <div className="mb-4">{t('licenses.indemnificationText')}</div>
        <div className="mb-2 font-bold">9. {t('licenses.governingLaw')}</div>
        <div className="mb-4">{t('licenses.governingLawText')}</div>
        <div className="mb-2 font-bold">10. {t('licenses.entireAgreement')}</div>
        <div className="mb-4">{t('licenses.entireAgreementText')}</div>
        <div className="mb-2 font-bold">11. {t('licenses.acknowledgement')}</div>
        <div className="mb-4">{t('licenses.acknowledgementText')}</div>
      </div>
    )
  }
  const [selectedLicense, setSelectedLicense] = useState("mp3")
  const { toast } = useToast()
  const [licenseSettings, setLicenseSettings] = useState({
    mp3: {
      price: 25,
      territory: "worldwide",
      streamLimit: 50000,
      saleLimit: 5000,
      distribution: true,
      videos: true,
      radio: false,
      live: true,
    },
    wav: {
      price: 45,
      territory: "worldwide",
      streamLimit: 100000,
      saleLimit: 10000,
      distribution: true,
      videos: true,
      radio: true,
      live: true,
    },
    trackout: {
      price: 149,
      territory: "worldwide",
      streamLimit: 500000,
      saleLimit: 50000,
      distribution: true,
      videos: true,
      radio: true,
      live: true,
    },
    unlimited: {
      price: 299,
      territory: "worldwide",
      streamLimit: -1,
      saleLimit: -1,
      distribution: true,
      videos: true,
      radio: true,
      live: true,
    },
    exclusive: {
      price: 2999,
      territory: "worldwide",
      streamLimit: -1,
      saleLimit: -1,
      distribution: true,
      videos: true,
      radio: true,
      live: true,
    },
  })
  // Store enabled state for each license type
  const [licenseEnabled, setLicenseEnabled] = useState({
    mp3: true,
    wav: true,
    trackout: true,
    unlimited: false,
    exclusive: true,
  })

  const currentSettings = licenseSettings[selectedLicense as keyof typeof licenseSettings]

  const updateLicenseSetting = (key: string, value: any) => {
    setLicenseSettings(prev => ({
      ...prev,
      [selectedLicense]: {
        ...prev[selectedLicense as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('licenses.title')}</h1>
          <p className="text-muted-foreground">{t('licenses.subtitle')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            {t('licenses.preview')}
          </Button>
      {/* HTML Contract Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('licenses.preview')} - {t(licenseTypes.find(l => l.id === selectedLicense)?.name || '')}</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <LicenseContractPreview
            license={licenseTypes.find(l => l.id === selectedLicense)}
            config={licenseSettings[selectedLicense]}
          />
        </DialogContent>
      </Dialog>
          <Button onClick={() => toast({
            title: t('licenses.settingsSaved'),
            description: t('licenses.settingsSavedDescription'),
            variant: "default"
          })}>
            <Save className="h-4 w-4 mr-2" />
            {t('licenses.saveChanges')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* License Types */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('licenses.licenseTypes')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {licenseTypes.map((license) => (
              <div
                key={license.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedLicense === license.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedLicense(license.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <license.icon className="h-4 w-4" />
                    <span className="font-medium text-foreground">{t(license.name)}</span>
                  </div>
                  <Switch
                    checked={licenseEnabled[license.id]}
                    onCheckedChange={(checked) => {
                      setLicenseEnabled(prev => ({
                        ...prev,
                        [license.id]: checked,
                      }))
                      toast({
                        title: checked ? t('licenses.enabled') : t('licenses.disabled'),
                        description: checked
                          ? t('licenses.availableForPurchase')
                          : t('licenses.unavailableForPurchase'),
                        variant: checked ? "default" : "destructive",
                      })
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{t(license.description)}</p>
                <div className="flex items-center text-lg font-bold text-primary">
                  <DollarSign className="h-4 w-4" />
                  {license.price}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* License Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {t('licenses.configure')} - {t(licenseTypes.find(l => l.id === selectedLicense)?.name || '')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pricing" className="w-full">
              <TabsList>
                <TabsTrigger value="pricing">{t('licenses.pricing')}</TabsTrigger>
                <TabsTrigger value="territory">{t('licenses.territory')}</TabsTrigger>
                <TabsTrigger value="limits">{t('licenses.usageLimits')}</TabsTrigger>
                <TabsTrigger value="rights">{t('licenses.rights')}</TabsTrigger>
              </TabsList>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t('licenses.licensePrice')}</Label>
                    <Input
                      id="price"
                      type="number"
                      value={currentSettings.price}
                      onChange={(e) => updateLicenseSetting("price", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t('licenses.currency')}</Label>
                    <Select defaultValue="naira">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">{t('licenses.usd')}</SelectItem>
                        <SelectItem value="eur">{t('licenses.eur')}</SelectItem>
                        <SelectItem value="gbp">{t('licenses.gbp')}</SelectItem>
                        <SelectItem value="cfa">{t('licenses.cfa')}</SelectItem>
                        <SelectItem value="naira">{t('licenses.naira')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t('licenses.licenseDescription')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('licenses.describeLicense')}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="territory" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="territory">{t('licenses.distributionTerritory')}</Label>
                  <Select
                    value={currentSettings.territory}
                    onValueChange={(value) => updateLicenseSetting("territory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worldwide">{t('licenses.worldwide')}</SelectItem>
                      <SelectItem value="us-only">{t('licenses.usOnly')}</SelectItem>
                      <SelectItem value="north-america">{t('licenses.northAmerica')}</SelectItem>
                      <SelectItem value="europe">{t('licenses.europe')}</SelectItem>
                      <SelectItem value="custom">{t('licenses.customTerritory')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentSettings.territory === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-territory">{t('licenses.specifyCountries')}</Label>
                    <Textarea
                      id="custom-territory"
                      placeholder={t('licenses.listCountries')}
                      rows={3}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="limits" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stream-limit">{t('licenses.streamLimit')}</Label>
                    <Input
                      id="stream-limit"
                      type="number"
                      value={currentSettings.streamLimit === -1 ? "" : currentSettings.streamLimit}
                      placeholder={t('licenses.unlimited')}
                      onChange={(e) => updateLicenseSetting("streamLimit", e.target.value ? parseInt(e.target.value) : -1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('licenses.leaveEmptyUnlimited')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale-limit">{t('licenses.saleLimit')}</Label>
                    <Input
                      id="sale-limit"
                      type="number"
                      value={currentSettings.saleLimit === -1 ? "" : currentSettings.saleLimit}
                      placeholder={t('licenses.unlimited')}
                      onChange={(e) => updateLicenseSetting("saleLimit", e.target.value ? parseInt(e.target.value) : -1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('licenses.leaveEmptyUnlimitedSales')}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rights" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="distribution">{t('licenses.digitalDistribution')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('licenses.allowDistribution')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="distribution"
                      checked={currentSettings.distribution}
                      onCheckedChange={(checked) => updateLicenseSetting("distribution", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="videos">{t('licenses.musicVideos')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('licenses.useInVideos')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="videos"
                      checked={currentSettings.videos}
                      onCheckedChange={(checked) => updateLicenseSetting("videos", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Radio className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="radio">{t('licenses.radioBroadcasting')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('licenses.broadcastOnRadio')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="radio"
                      checked={currentSettings.radio}
                      onCheckedChange={(checked) => updateLicenseSetting("radio", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="live">{t('licenses.livePerformances')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('licenses.performLive')}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="live"
                      checked={currentSettings.live}
                      onCheckedChange={(checked) => updateLicenseSetting("live", checked)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}