import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Music,
  Search,
  Plus,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Download,
  Play,
  Pause,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const tracks = [
  {
    id: 1,
    title: "Midnight Vibes",
    artwork: "/placeholder.svg",
    bpm: 120,
    key: "Cm",
    genre: "Hip Hop",
    date: "2024-01-15",
    status: "Published",
    streams: 12847,
    sales: 34,
  },
  {
    id: 2,
    title: "Summer Heat",
    artwork: "/placeholder.svg",
    bpm: 140,
    key: "Gm",
    genre: "Trap",
    date: "2024-01-12",
    status: "Published",
    streams: 9234,
    sales: 28,
  },
  {
    id: 3,
    title: "City Lights",
    artwork: "/placeholder.svg",
    bpm: 95,
    key: "Am",
    genre: "R&B",
    date: "2024-01-10",
    status: "Draft",
    streams: 0,
    sales: 0,
  },
  {
    id: 4,
    title: "Ocean Breeze",
    artwork: "/placeholder.svg",
    bpm: 110,
    key: "F",
    genre: "Pop",
    date: "2024-01-08",
    status: "Scheduled",
    streams: 0,
    sales: 0,
  },
]

export default function DashboardTracks() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [playingTrack, setPlayingTrack] = useState<number | null>(null)
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Published: "default",
      Draft: "secondary",
      Scheduled: "outline",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.genre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePlayToggle = (trackId: number) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId)
  }

  const EmptyState = () => (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      <Music className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{t('tracks.noTracksYet')}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {t('tracks.startBuildingCatalog')}
      </p>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        {t('tracks.uploadFirstBeat')}
      </Button>
    </Card>
  )

  if (filteredTracks.length === 0 && searchTerm === "") {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('tracks.title')}</h1>
            <p className="text-muted-foreground">{t('tracks.subtitle')}</p>
          </div>
        </div>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('tracks.title')}</h1>
          <p className="text-muted-foreground">{t('tracks.subtitle')}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('tracks.uploadNewBeat')}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('tracks.searchTracks')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select defaultValue="all-genres">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('tracks.genre')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-genres">{t('tracks.allGenres')}</SelectItem>
                  <SelectItem value="hip-hop">{t('tracks.hipHop')}</SelectItem>
                  <SelectItem value="trap">{t('tracks.trap')}</SelectItem>
                  <SelectItem value="rb">{t('tracks.rb')}</SelectItem>
                  <SelectItem value="pop">{t('tracks.pop')}</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all-status">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('tracks.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">{t('tracks.allStatus')}</SelectItem>
                  <SelectItem value="published">{t('tracks.published')}</SelectItem>
                  <SelectItem value="draft">{t('tracks.draft')}</SelectItem>
                  <SelectItem value="scheduled">{t('tracks.scheduled')}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracks Content */}
      {viewMode === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>{t('tracks.track')}</TableHead>
                <TableHead>{t('tracks.bpm')}</TableHead>
                <TableHead>{t('tracks.key')}</TableHead>
                <TableHead>{t('tracks.genre')}</TableHead>
                <TableHead>{t('tracks.date')}</TableHead>
                <TableHead>{t('tracks.status')}</TableHead>
                <TableHead>{t('tracks.streams')}</TableHead>
                <TableHead>{t('tracks.sales')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTracks.map((track) => (
                <TableRow key={track.id} className="hover:bg-accent/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePlayToggle(track.id)}
                      className="h-8 w-8"
                    >
                      {playingTrack === track.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={track.artwork} />
                        <AvatarFallback>
                          <Music className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{track.title}</p>
                        <p className="text-sm text-muted-foreground">{t('tracks.beatId')}: {track.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{track.bpm}</TableCell>
                  <TableCell className="text-foreground">{track.key}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{track.genre}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(track.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(track.status)}</TableCell>
                  <TableCell className="text-foreground">
                    {track.streams.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-foreground">{track.sales}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('tracks.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('tracks.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          {t('tracks.download')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('tracks.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => (
            <Card key={track.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-full rounded-lg">
                    <AvatarImage src={track.artwork} className="object-cover" />
                    <AvatarFallback className="rounded-lg h-full">
                      <Music className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handlePlayToggle(track.id)}
                  >
                    {playingTrack === track.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground truncate">{track.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{track.bpm} {t('tracks.bpm')}</span>
                    <span>•</span>
                    <span>{track.key}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">{track.genre}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(track.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('tracks.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('tracks.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          {t('tracks.download')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('tracks.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {track.streams.toLocaleString()} {t('tracks.streams')}
                    </span>
                    <span className="text-muted-foreground">{track.sales} {t('tracks.sales')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}