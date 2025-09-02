import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Monitor, Copy, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "custom-theme-vars-v1";

// ---------- Utilities ----------
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToHslVar(hex: string): string {
  // Accepts #rrggbb or #rgb
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  const H = Math.round(h * 360);
  const S = Math.round(s * 100);
  const L = Math.round(l * 100);
  return `${H} ${S}% ${L}%`;
}

function hslVarToHex(hslVar: string): string {
  // Expects "H S% L%" or with extra whitespace
  const [hRaw, sRaw, lRaw] = hslVar.trim().split(/\s+/);
  const h = parseFloat(hRaw);
  const s = parseFloat(sRaw.replace("%", "")) / 100;
  const l = parseFloat(lRaw.replace("%", "")) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`.toUpperCase();
}

function chooseForegroundByHsl(hslVar: string): string {
  // If L > 60 pick black else white
  const parts = hslVar.trim().split(/\s+/);
  const l = parseFloat(parts[2].replace("%", ""));
  return l > 60 ? "0 0% 0%" : "0 0% 100%";
}

function getVar(name: string): string | null {
  const cs = getComputedStyle(document.documentElement);
  const v = cs.getPropertyValue(name).trim();
  return v || null;
}

function setVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function persistVars(vars: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
}

function loadPersistedVars(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

// ---------- Component ----------
export function CustomThemeLayout() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const { updateThemePreferences, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [primaryHex, setPrimaryHex] = useState<string>("#000000");
  const [accentHex, setAccentHex] = useState<string>("#333333");
  const [radiusRem, setRadiusRem] = useState<number>(0.75);
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");

  // Curated African country color presets (primary + accent sampled from flag palettes)
  const countryPresets: { id: string; name: string; primary: string; accent: string; note?: string }[] = [
    { id: "ng", name: t('theme.nigeria'), primary: "#008751", accent: "#002E1C" },
    { id: "gh", name: t('theme.ghana'), primary: "#CE1126", accent: "#FCD116" },
    { id: "ke", name: t('theme.kenya'), primary: "#006600", accent: "#B50000" },
    { id: "za", name: t('theme.southAfrica'), primary: "#007A4D", accent: "#003399" },
    { id: "eg", name: t('theme.egypt'), primary: "#C8102E", accent: "#000000" },
    { id: "et", name: t('theme.ethiopia'), primary: "#078930", accent: "#FCDD09" },
    { id: "sn", name: t('theme.senegal'), primary: "#00853F", accent: "#FDEF42" },
    { id: "dz", name: t('theme.algeria'), primary: "#006233", accent: "#D21034" },
    { id: "ma", name: t('theme.morocco'), primary: "#C1272D", accent: "#006233" },
    { id: "ug", name: t('theme.uganda'), primary: "#FCDC04", accent: "#D90000" },
    { id: "tz", name: t('theme.tanzania'), primary: "#1EB53A", accent: "#00A3DD" },
    { id: "rw", name: t('theme.rwanda'), primary: "#00A1DE", accent: "#FAD201" },
  ];

  // Initialize from CSS variables + persisted overrides
  useEffect(() => {
    const persisted = loadPersistedVars();
    Object.entries(persisted).forEach(([k, v]) => setVar(k, v));

    const p = getVar("--primary");
    const a = getVar("--accent");
    const r = getVar("--radius");
    if (p) setPrimaryHex(hslVarToHex(p));
    if (a) setAccentHex(hslVarToHex(a));
    if (r) {
      const parsed = parseFloat(r);
      if (!Number.isNaN(parsed)) setRadiusRem(parsed);
    }
  }, []);

  const applyPrimary = (hex: string) => {
    const hsl = hexToHslVar(hex);
    setVar("--primary", hsl);
    setVar("--primary-foreground", chooseForegroundByHsl(hsl));
    setPrimaryHex(hex);
    persistVars({ ...(loadPersistedVars()), "--primary": hsl, "--primary-foreground": chooseForegroundByHsl(hsl) });
  setSelectedPreset("custom");
  };

  const applyAccent = (hex: string) => {
    const hsl = hexToHslVar(hex);
    setVar("--accent", hsl);
    setVar("--accent-foreground", chooseForegroundByHsl(hsl));
    setAccentHex(hex);
    persistVars({ ...(loadPersistedVars()), "--accent": hsl, "--accent-foreground": chooseForegroundByHsl(hsl) });
  setSelectedPreset("custom");
  };

  const applyRadius = (remValue: number[]) => {
    const v = clamp(remValue[0], 0.125, 2);
    setVar("--radius", `${v}rem`);
    setRadiusRem(v);
    persistVars({ ...(loadPersistedVars()), "--radius": `${v}rem` });
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    ["--primary","--primary-foreground","--accent","--accent-foreground","--radius"].forEach((k) => {
      document.documentElement.style.removeProperty(k);
    });
    // Re-read defaults from CSS
    const p = getVar("--primary");
    const a = getVar("--accent");
    const r = getVar("--radius");
    if (p) setPrimaryHex(hslVarToHex(p));
    if (a) setAccentHex(hslVarToHex(a));
    if (r) {
      const parsed = parseFloat(r);
      if (!Number.isNaN(parsed)) setRadiusRem(parsed);
    }
  setSelectedPreset("custom");
  };

  const copyCss = async () => {
    const currentVars = {
      "--primary": getVar("--primary") ?? "",
      "--primary-foreground": getVar("--primary-foreground") ?? "",
      "--accent": getVar("--accent") ?? "",
      "--accent-foreground": getVar("--accent-foreground") ?? "",
      "--radius": getVar("--radius") ?? "",
    } as Record<string, string>;
    const css = `:root {\n  --primary: ${currentVars["--primary"]};\n  --primary-foreground: ${currentVars["--primary-foreground"]};\n  --accent: ${currentVars["--accent"]};\n  --accent-foreground: ${currentVars["--accent-foreground"]};\n  --radius: ${currentVars["--radius"]};\n}`;
    try {
      await navigator.clipboard.writeText(css);
    } catch {
      // no-op
    }
  };

  // Save settings handler
  const [saveMsg, setSaveMsg] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const currentVars = {
        "--primary": getVar("--primary") ?? "",
        "--primary-foreground": getVar("--primary-foreground") ?? "",
        "--accent": getVar("--accent") ?? "",
        "--accent-foreground": getVar("--accent-foreground") ?? "",
        "--radius": getVar("--radius") ?? "",
      };
      
      // Save to localStorage
      persistVars(currentVars);
      
      // Save to backend if authenticated
      if (isAuthenticated) {
        const themePreferences = {
          mode: theme as 'light' | 'dark' | 'system',
          customTheme: {
            primary: hslVarToHex(currentVars["--primary"]),
            accent: hslVarToHex(currentVars["--accent"]),
            radius: parseFloat(currentVars["--radius"]?.replace('rem', '') || '0.75'),
          },
        };
        
        await updateThemePreferences(themePreferences);
      }
      
      setSaveMsg(t('theme.settingsSaved'));
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (error) {
      console.error('Failed to save theme preferences:', error);
      toast({
        title: t('theme.saveError'),
        description: t('theme.saveErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
  <div className="container mx-auto p-6 pb-24 mt-14 sm:mt-16 space-y-6">
      <PageHeader title={t('theme.title')} description={t('theme.description')} />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={resetAll}>
          <RefreshCcw className="h-4 w-4 mr-2" /> {t('theme.resetToDefaults')}
        </Button>
        <Button variant="default" size="sm" onClick={saveSettings} disabled={isSaving}>
          {isSaving ? t('theme.saving') : t('theme.saveSettings')}
        </Button>
        {saveMsg && <span className="ml-2 text-green-600 text-sm">{saveMsg}</span>}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">{t('theme.general')}</TabsTrigger>
          <TabsTrigger value="colors">{t('theme.colors')}</TabsTrigger>
          <TabsTrigger value="radius">{t('theme.radius')}</TabsTrigger>
          <TabsTrigger value="preview">{t('theme.preview')}</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4">
          <Card className="bg-card/95 border-border">
            <CardHeader>
              <CardTitle>{t('theme.themeMode')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={theme as ThemeMode}
                onValueChange={(v: ThemeMode) => setTheme(v)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                  <RadioGroupItem id="light" value="light" />
                  <Sun className="h-4 w-4" />
                  <span>{t('theme.light')}</span>
                </label>
                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                  <RadioGroupItem id="dark" value="dark" />
                  <Moon className="h-4 w-4" />
                  <span>{t('theme.dark')}</span>
                </label>
                <label className="flex items-center gap-3 border rounded-md p-3 cursor-pointer">
                  <RadioGroupItem id="system" value="system" />
                  <Monitor className="h-4 w-4" />
                  <span>{t('theme.system')}</span>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors */}
        <TabsContent value="colors" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/95 border-border">
              <CardHeader>
                <CardTitle>{t('theme.primary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label htmlFor="primaryHex" className="w-24">{t('theme.hex')}</Label>
                  <Input
                    id="primaryHex"
                    type="color"
                    value={primaryHex}
                    onChange={(e) => applyPrimary(e.target.value)}
                    className="h-10 w-16 p-1"
                  />
                  <Input
                    value={primaryHex}
                    onChange={(e) => applyPrimary(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: primaryHex }} />
                  <div className="text-sm text-muted-foreground">{t('theme.foregroundAutoContrast')}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/95 border-border">
              <CardHeader>
                <CardTitle>{t('theme.accent')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Label htmlFor="accentHex" className="w-24">{t('theme.hex')}</Label>
                  <Input
                    id="accentHex"
                    type="color"
                    value={accentHex}
                    onChange={(e) => applyAccent(e.target.value)}
                    className="h-10 w-16 p-1"
                  />
                  <Input
                    value={accentHex}
                    onChange={(e) => applyAccent(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: accentHex }} />
                  <div className="text-sm text-muted-foreground">{t('theme.foregroundAutoContrast')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Presets */}
          <div className="mt-8 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">{t('theme.africanCountryPresets')}</h3>
              <p className="text-xs text-muted-foreground">{t('theme.presetDescription')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {countryPresets.map(preset => {
                const active = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      applyPrimary(preset.primary);
                      applyAccent(preset.accent);
                      setSelectedPreset(preset.id);
                    }}
                    className={`group relative flex flex-col items-start rounded-md border p-3 text-left transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${active ? 'ring-2 ring-primary/70 border-primary' : 'border-border'}`}
                  >
                    <div className="flex w-full gap-1 mb-2">
                      <span className="flex-1 h-6 rounded-sm" style={{ backgroundColor: preset.primary }} />
                      <span className="flex-1 h-6 rounded-sm" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <span className="text-xs font-medium leading-tight">{preset.name}</span>
                    {active && <span className="absolute bottom-2 right-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">{t('theme.active')}</span>}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedPreset('custom')}
                className={`flex flex-col items-start rounded-md border p-3 text-left transition hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${selectedPreset === 'custom' ? 'ring-2 ring-primary/70 border-primary' : 'border-dashed border-border/70'}`}
              >
                <div className="flex w-full gap-1 mb-2">
                  <span className="flex-1 h-6 rounded-sm bg-gradient-to-r from-primary to-accent" />
                </div>
                <span className="text-xs font-medium leading-tight">{t('theme.custom')}</span>
                <span className="mt-1 text-[10px] text-muted-foreground">{t('theme.usePickersAbove')}</span>
                {selectedPreset === 'custom' && <span className="mt-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">{t('theme.editing')}</span>}
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Radius */}
        <TabsContent value="radius" className="mt-4">
          <Card className="bg-card/95 border-border">
            <CardHeader>
              <CardTitle>{t('theme.smoothness')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label className="whitespace-nowrap">{t('theme.smoothness')}</Label>
                <div className="flex-1 flex items-center gap-2">
                  <Slider
                    min={0.125}
                    max={2}
                    step={(2 - 0.125) / 100}
                    value={[radiusRem]}
                    onValueChange={applyRadius}
                  />
                  <span className="text-xs text-muted-foreground">{Math.round((radiusRem - 0.125) / (2 - 0.125) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card/95 border-border">
              <CardHeader>
                <CardTitle>{t('theme.components')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 flex-wrap">
                  <Button>{t('theme.primary')}</Button>
                  <Button variant="secondary">{t('theme.secondary')}</Button>
                  <Button variant="outline">{t('theme.outline')}</Button>
                </div>
                <div className="grid gap-2">
                  <Label>{t('theme.email')}</Label>
                  <Input placeholder={t('theme.emailPlaceholder')} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="demo-switch" />
                  <Label htmlFor="demo-switch">{t('theme.enableOption')}</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/95 border-border overflow-hidden">
              <CardHeader>
                <CardTitle>{t('theme.cardPreview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4">
                  <div className="font-medium mb-2">{t('theme.previewCardTitle')}</div>
                  <p className="text-sm text-muted-foreground mb-4">{t('theme.previewCardDescription')}</p>
                  <Button className="hover-scale">{t('theme.action')}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
