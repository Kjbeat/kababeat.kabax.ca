/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Download,
  Calendar as CalendarIcon,
  Music,
  DollarSign,
  Play,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const streamData = [
  { name: "Jan", streams: 4000 },
  { name: "Feb", streams: 3000 },
  { name: "Mar", streams: 5000 },
  { name: "Apr", streams: 4500 },
  { name: "May", streams: 4000 },
  { name: "Jun", streams: 5500 },
  { name: "Jul", streams: 4200 },
  { name: "Aug", streams: 3900 },
  { name: "Sep", streams: 4700 },
  { name: "Oct", streams: 5100 },
  { name: "Nov", streams: 4800 },
  { name: "Dec", streams: 5300 },
];

const salesData = [
  { name: "Jan", sales: 240 },
  { name: "Feb", sales: 139 },
  { name: "Mar", sales: 980 },
  { name: "Apr", sales: 390 },
  { name: "May", sales: 480 },
  { name: "Jun", sales: 380 },
  { name: "Jul", sales: 320 },
  { name: "Aug", sales: 410 },
  { name: "Sep", sales: 200 },
  { name: "Oct", sales: 400 },
  { name: "Nov", sales: 700 },
  { name: "Dec", sales: 800 },
];

const topBeats = [
  { name: "Midnight Vibes", streams: 12847, revenue: 2340 },
  { name: "Summer Heat", streams: 9234, revenue: 1876 },
  { name: "City Lights", streams: 7865, revenue: 1654 },
  { name: "Ocean Breeze", streams: 6543, revenue: 1432 },
  { name: "Urban Flow", streams: 5432, revenue: 1298 },
]

const genreData = [
  { name: "Hip Hop", value: 35, color: "hsl(var(--primary))" },
  { name: "R&B", value: 25, color: "hsl(var(--secondary))" },
  { name: "Trap", value: 20, color: "hsl(var(--accent))" },
  { name: "Pop", value: 15, color: "hsl(var(--muted))" },
  { name: "Other", value: 5, color: "hsl(var(--muted-foreground))" },
]

export default function DashboardAnalytics() {
  const { t } = useLanguage();
  
  // Get current month and year
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear().toString();

  // Default: last 4 months + current month
  const defaultMonths = allMonths.slice(Math.max(0, currentMonthIndex - 4), currentMonthIndex + 1);

  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [visibleMonths, setVisibleMonths] = useState<string[]>(defaultMonths);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("all-genres");
  const [selectedLicense, setSelectedLicense] = useState<string>("all-licenses");

  // Always keep exactly 5 months in the chart
  const getFiveMonths = (month: string | null, year: string) => {
    if (month) {
      const idx = allMonths.indexOf(month);
      return allMonths.slice(Math.max(0, idx - 4), idx + 1);
    }
    if (year === currentYear) {
      return defaultMonths;
    }
    return allMonths.slice(0, 5);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth(null);
  };

  const chartMonths = getFiveMonths(selectedMonth, selectedYear);

  // Helper to get chart data with zero-filled months
  const getChartData = (months: string[], data: any[], key: string) => {
    return months.map(month => {
      const found = data.find(d => d.name === month);
      if (found) return found;
      const obj: any = { name: month };
      obj[key] = 0;
      return obj;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('analytics.title')}</h1>
          <p className="text-muted-foreground">{t('analytics.subtitle')}</p>
        </div>
        <div
          className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full md:w-auto"
        >
          {/* Month/Year Filters */}
          <Select value={selectedMonth ?? "none"} onValueChange={val => val === "none" ? setSelectedMonth(null) : handleMonthChange(val)}>
            <SelectTrigger className="w-[110px] sm:w-[120px]">
              <SelectValue placeholder={t('analytics.month')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t('analytics.month')}</SelectItem>
              {allMonths.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[90px] sm:w-[100px]">
              <SelectValue placeholder={t('analytics.year')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={currentYear}>{currentYear}</SelectItem>
              <SelectItem value={(parseInt(currentYear) - 1).toString()}>{(parseInt(currentYear) - 1).toString()}</SelectItem>
              <SelectItem value={(parseInt(currentYear) - 2).toString()}>{(parseInt(currentYear) - 2).toString()}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-[120px] sm:w-[140px]">
              <SelectValue placeholder={t('analytics.genre')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-genres">{t('analytics.allGenres')}</SelectItem>
              <SelectItem value="hip-hop">{t('analytics.hipHop')}</SelectItem>
              <SelectItem value="rb">{t('analytics.rb')}</SelectItem>
              <SelectItem value="trap">{t('analytics.trap')}</SelectItem>
              <SelectItem value="pop">{t('analytics.pop')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLicense} onValueChange={setSelectedLicense}>
            <SelectTrigger className="w-[120px] sm:w-[140px]">
              <SelectValue placeholder={t('analytics.license')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-licenses">{t('analytics.allLicenses')}</SelectItem>
              <SelectItem value="mp3">{t('analytics.mp3')}</SelectItem>
              <SelectItem value="wav">{t('analytics.wav')}</SelectItem>
              <SelectItem value="trackout">{t('analytics.trackout')}</SelectItem>
              <SelectItem value="exclusive">{t('analytics.exclusive')}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            {t('analytics.exportCsv')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            {t('analytics.exportPdf')}
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streams Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              {t('analytics.streamsFor')} {selectedMonth} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData(chartMonths, streamData.map(d => {
                let streams = d.streams;
                if (selectedGenre !== "all-genres") streams = Math.round(streams * 0.7);
                if (selectedLicense !== "all-licenses") streams = Math.round(streams * 0.8);
                return { name: d.name, streams };
              }), "streams")}> 
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="streams"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={({ cx, cy, payload }) => (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={selectedMonth && payload.name === selectedMonth ? 10 : 4}
                      fill={selectedMonth && payload.name === selectedMonth ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
                      stroke={selectedMonth && payload.name === selectedMonth ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                      strokeWidth={selectedMonth && payload.name === selectedMonth ? 3 : 1}
                      style={{ filter: selectedMonth && payload.name === selectedMonth ? "drop-shadow(0 0 6px hsl(var(--accent)))" : "none" }}
                    />
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              {t('analytics.salesFor')} {selectedMonth} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData(chartMonths, salesData.map(d => {
                let sales = d.sales;
                if (selectedGenre !== "all-genres") sales = Math.round(sales * 0.7);
                if (selectedLicense !== "all-licenses") sales = Math.round(sales * 0.8);
                return { name: d.name, sales };
              }), "sales")}> 
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
               <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Bar dataKey="sales">
                  {salesData.filter(d => chartMonths.includes(d.name)).map((entry, index) => {
                    let sales = entry.sales;
                    if (selectedGenre !== "all-genres") sales = Math.round(sales * 0.7);
                    if (selectedLicense !== "all-licenses") sales = Math.round(sales * 0.8);
                    return (
                      <Cell
                        key={`bar-${index}`}
                        fill={selectedMonth && entry.name === selectedMonth ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                        radius={selectedMonth && entry.name === selectedMonth ? 10 : 4}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Beats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              {t('analytics.topPerformingBeats')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBeats.map((beat, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{beat.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Play className="h-3 w-3 mr-1" />
                          {beat.streams.toLocaleString()} {t('analytics.streams')}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${beat.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                    {/* Trend Arrow: Up if streams increased, Down if decreased, None if same */}
                    {index === 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" aria-label={t('analytics.trendingUp')} />
                    ) : (
                    topBeats[index].streams > topBeats[index - 1].streams ? (
                      <TrendingUp className="h-5 w-5 text-green-500" aria-label={t('analytics.trendingUp')} />
                    ) : topBeats[index].streams < topBeats[index - 1].streams ? (
                      <TrendingUp style={{ transform: "rotate(180deg)" }} className="h-5 w-5 text-red-500" aria-label={t('analytics.trendingDown')} />
                    ) : null
                    )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="h-5 w-5 mr-2" />
              {t('analytics.genreDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <defs>
                  <linearGradient id="genre-hiphop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="genre-rnb" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="genre-trap" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="genre-pop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="genre-other" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => {
                    let fill;
                    if (entry.name === "Hip Hop") fill = "url(#genre-hiphop)";
                    else if (entry.name === "R&B") fill = "url(#genre-rnb)";
                    else if (entry.name === "Trap") fill = "url(#genre-trap)";
                    else if (entry.name === "Pop") fill = "url(#genre-pop)";
                    else fill = "url(#genre-other)";
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {genreData.map((genre, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <svg width="16" height="16" style={{ display: "block" }}>
                      <defs>
                        <linearGradient id={`legend-gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                          {genre.name === "Hip Hop" && <>
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                          </>}
                          {genre.name === "R&B" && <>
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                          </>}
                          {genre.name === "Trap" && <>
                            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="1" />
                          </>}
                          {genre.name === "Pop" && <>
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                          </>}
                          {genre.name === "Other" && <>
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                          </>}
                        </linearGradient>
                      </defs>
                      <circle cx="8" cy="8" r="6" fill={`url(#legend-gradient-${index})`} />
                    </svg>
                    <span className="text-muted-foreground">{genre.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{genre.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}