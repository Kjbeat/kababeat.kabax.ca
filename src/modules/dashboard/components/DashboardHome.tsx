import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DollarSign,
  Play,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Music,
  Eye,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const stats = [
  {
    title: "dashboard.totalRevenue",
    value: "$12,847",
    change: "+12.3%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "dashboard.streams",
    value: "45,892",
    change: "+8.7%",
    trend: "up",
    icon: Play,
  },
  {
    title: "dashboard.sales",
    value: "234",
    change: "+15.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "dashboard.followers",
    value: "3,210",
    change: "+4.5%",
    trend: "up",
    icon: Eye,
  },
  //   title: "Conversion Rate",
  //   value: "3.8%",
  //   change: "-2.1%",
  //   trend: "down",
  //   icon: TrendingUp,
  // },
]

const topStreams = [
  {
    track: "Midnight Vibes",
    artist: "Producer X",
    plays: 1247,
    duration: "3:24",
    artwork: "/placeholder.svg",
  },
  {
    track: "Summer Heat",
    artist: "Beat Master",
    plays: 892,
    duration: "2:58",
    artwork: "/placeholder.svg",
  },
  {
    track: "City Lights",
    artist: "Sound Wave",
    plays: 756,
    duration: "3:12",
    artwork: "/placeholder.svg",
  },
  {
    track: "Ocean Breeze",
    artist: "Melody Maker",
    plays: 643,
    duration: "4:01",
    artwork: "/placeholder.svg",
  },
]

const recentSales = [
  {
    track: "Midnight Vibes",
    saleAmount: "$45.00",
    netEarnings: "$38.25",
    date: "2024-01-15",
    license: "MP3 License",
  },
  {
    track: "Summer Heat",
    saleAmount: "$89.00",
    netEarnings: "$75.65",
    date: "2024-01-14",
    license: "WAV License",
  },
  {
    track: "City Lights",
    saleAmount: "$199.00",
    netEarnings: "$169.15",
    date: "2024-01-13",
    license: "Trackout",
  },
  {
    track: "Ocean Breeze",
    saleAmount: "$25.00",
    netEarnings: "$21.25",
    date: "2024-01-12",
    license: "MP3 License",
  },
]
export default function DashboardHome() {

  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('dashboard.welcome')}</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => navigate("/upload") }>
          <Music className="h-4 w-4 mr-2" />
          {t('dashboard.uploadBeat')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-1 px-4 pt-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(stat.title)}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1">{t('dashboard.vsLast7Days')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Streams */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {t('dashboard.mostStreamed')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {topStreams.map((stream, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 sm:space-x-4 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-lg p-2 transition-colors"
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage src={stream.artwork} />
                    <AvatarFallback>
                      <Music className="h-3 w-3 sm:h-4 sm:w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-foreground truncate">{stream.track}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{stream.artist}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                      <Eye className="h-3 w-3 mr-1" />
                      {stream.plays.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">{stream.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              {t('dashboard.recentSales')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.track')}</TableHead>
                  <TableHead>{t('dashboard.sale')}</TableHead>
                  <TableHead>{t('dashboard.net')}</TableHead>
                  <TableHead>{t('dashboard.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale, index) => (
                  <TableRow key={index} className="hover:bg-muted/60 dark:hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{sale.track}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {sale.license}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {sale.saleAmount}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {sale.netEarnings}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(sale.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}