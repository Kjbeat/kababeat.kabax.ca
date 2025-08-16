import { useState, useRef, useEffect } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  TrendingUp,
  Search,
  Calendar as CalendarIcon,
  Download,
  Music,
  Award,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

function generateTransaction(id) {
  const tracks = ["Midnight Vibes", "Summer Heat", "City Lights", "Ocean Breeze", "Urban Flow", "Night Drive", "Golden Hour", "Sunset Dreams"]
  const buyers = ["Artist123", "ProducerX", "MusicLabel", "BigArtist", "NewRapper", "DJFlow", "BeatKing", "SoundWave"]
  const licenses = ["MP3 License", "WAV License", "Trackout", "Unlimited", "Exclusive"]
  const track = tracks[Math.floor(Math.random() * tracks.length)]
  const buyer = buyers[Math.floor(Math.random() * buyers.length)]
  const license = licenses[Math.floor(Math.random() * licenses.length)]
  const saleAmount = Math.floor(Math.random() * 300) + 20
  const platformFee = +(saleAmount * 0.15).toFixed(2)
  const netEarnings = +(saleAmount - platformFee).toFixed(2)
  const date = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().slice(0, 10)
  const status = ["Completed", "Processing"][Math.floor(Math.random() * 2)]
  return {
    id,
    track,
    artwork: "/placeholder.svg",
    license,
    saleAmount,
    platformFee,
    netEarnings,
    buyer,
    date,
    status,
  }
}

const initialSalesData = [
  {
    id: 1,
    track: "Midnight Vibes",
    artwork: "/placeholder.svg",
    license: "MP3 License",
    saleAmount: 45.00,
    platformFee: 6.75,
    netEarnings: 38.25,
    buyer: "Artist123",
    date: "2024-01-15",
    status: "Completed",
  },
  {
    id: 2,
    track: "Summer Heat",
    artwork: "/placeholder.svg",
    license: "WAV License",
    saleAmount: 89.00,
    platformFee: 13.35,
    netEarnings: 75.65,
    buyer: "ProducerX",
    date: "2024-01-14",
    status: "Completed",
  },
  {
    id: 3,
    track: "City Lights",
    artwork: "/placeholder.svg",
    license: "Trackout",
    saleAmount: 199.00,
    platformFee: 29.85,
    netEarnings: 169.15,
    buyer: "MusicLabel",
    date: "2024-01-13",
    status: "Completed",
  },
  {
    id: 4,
    track: "Ocean Breeze",
    artwork: "/placeholder.svg",
    license: "Unlimited",
    saleAmount: 299.00,
    platformFee: 44.85,
    netEarnings: 254.15,
    buyer: "BigArtist",
    date: "2024-01-12",
    status: "Processing",
  },
  {
    id: 5,
    track: "Urban Flow",
    artwork: "/placeholder.svg",
    license: "MP3 License",
    saleAmount: 25.00,
    platformFee: 3.75,
    netEarnings: 21.25,
    buyer: "NewRapper",
    date: "2024-01-11",
    status: "Completed",
  },
]

const topTrack = {
  title: "Midnight Vibes",
  totalSales: 12,
  totalRevenue: 540.00,
  artwork: "/placeholder.svg",
}

export default function DashboardSales() {
  const tableRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<Date>()
  const [dateOpen, setDateOpen] = useState(false)
  const [salesData, setSalesData] = useState(initialSalesData)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const { t } = useLanguage()

  const totalSales = salesData.length
  const totalEarnings = salesData.reduce((sum, sale) => sum + sale.netEarnings, 0)
  const platformFees = salesData.reduce((sum, sale) => sum + sale.platformFee, 0)

  const filteredSales = salesData.filter(sale =>
    sale.track.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.license.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalFiltered = filteredSales.length
  const totalPages = Math.ceil(totalFiltered / perPage)
  const paginatedSales = filteredSales.slice((page - 1) * perPage, page * perPage)

  // Auto-generate more transactions when reaching last page or bottom of table
  const handlePageChange = (newPage) => {
    if (newPage > totalPages) return
    setPage(newPage)
    if (newPage === totalPages && totalFiltered >= salesData.length) {
      addMoreTransactions()
    }
  }

  const addMoreTransactions = () => {
    setSalesData(prev => [
      ...prev,
      ...Array.from({ length: 5 }, (_, i) => generateTransaction(prev.length + i + 1)),
    ])
  }

  useEffect(() => {
    const handleScroll = () => {
      const el = tableRef.current
      if (!el) return
      if (el.scrollHeight - el.scrollTop <= el.clientHeight + 10) {
        // Near bottom
        addMoreTransactions()
      }
    }
    const el = tableRef.current
    if (el) {
      el.addEventListener("scroll", handleScroll)
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll)
      }
    }
  }, [salesData])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Completed: "default",
      Processing: "secondary",
      Failed: "destructive",
      Refunded: "outline",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const getLicenseBadge = (license: string) => {
    const colors: Record<string, string> = {
      "MP3 License": "bg-blue-100 text-blue-800",
      "WAV License": "bg-green-100 text-green-800",
      "Trackout": "bg-purple-100 text-purple-800",
      "Unlimited": "bg-yellow-100 text-yellow-800",
      "Exclusive": "bg-red-100 text-red-800",
    }
    return (
      <Badge variant="secondary" className={colors[license] || ""}>
        {license}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('sales.title')}</h1>
          <p className="text-muted-foreground">{t('sales.subtitle')}</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t('sales.exportReport')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('sales.totalSales')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalSales}</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-600">+12.3%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('sales.vsLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('sales.totalEarnings')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalEarnings.toFixed(2)}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-600">+8.7%</span>
              <span className="text-xs text-muted-foreground ml-1">{t('sales.vsLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('sales.platformFees')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${platformFees.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.commissionRate')}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('sales.topTrack')}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate max-w-[150px]">{topTrack.title}</div>
            <div className="text-sm text-muted-foreground">
              {topTrack.totalSales} {t('sales.sales')} • ${topTrack.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Pagination Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('sales.searchSales')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            {/* <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange ? format(dateRange, "PPP") : <span>Filter by date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange}
                  onSelect={(date) => {
                    setDateRange(date)
                    setDateOpen(false)
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover> */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">{t('sales.rowsPerPage')}:</span>
              <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                {t('sales.prev')}
              </Button>
              <span className="text-sm">{t('sales.page')} {page} {t('sales.of')} {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
                {t('sales.next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sales.recentSales')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={tableRef} className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sales.track')}</TableHead>
                  <TableHead>{t('sales.license')}</TableHead>
                  <TableHead>{t('sales.buyer')}</TableHead>
                  <TableHead>{t('sales.saleAmount')}</TableHead>
                  <TableHead>{t('sales.platformFee')}</TableHead>
                  <TableHead>{t('sales.netEarnings')}</TableHead>
                  <TableHead>{t('sales.date')}</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={sale.artwork} />
                          <AvatarFallback>
                            <Music className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground truncate max-w-[120px]">{sale.track}</p>
                          {/* <p className="text-sm text-muted-foreground">ID: {sale.id}</p> */}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getLicenseBadge(sale.license)}</TableCell>
                    <TableCell className="text-foreground truncate max-w-[100px]">{sale.buyer}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      ${sale.saleAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      -${sale.platformFee.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${sale.netEarnings.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(sale.date).toLocaleDateString()}
                    </TableCell>
                    {/* <TableCell>{getStatusBadge(sale.status)}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}