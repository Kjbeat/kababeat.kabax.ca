import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Share, Plus, List, Heart } from "lucide-react";
import { useState } from "react";
import { usePlaylists } from "@/contexts/PlaylistsContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useToast } from "@/hooks/use-toast";

interface BeatActionsMenuProps {
  id: string;
  title: string;
  producer: string;
  isLiked?: boolean;
}

export function BeatActionsMenu({ id, title, producer, isLiked }: BeatActionsMenuProps) {
  const { playlists, createPlaylist, addBeatToPlaylist } = usePlaylists();
  const { toggleLike, isLiked: isFavorited } = useFavorites();
  const { toast } = useToast();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [shareUrl] = useState(`${window.location.origin}/beat/${id}`);

  const liked = isLiked !== undefined ? isLiked : isFavorited(id);

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ 
      title: "Link copied!", 
      description: "Beat link has been copied to your clipboard." 
    });
  };

  // Removed explicit copy and open in new tab actions per request; share covers copying link

  const handleToggleLike = () => {
    toggleLike(id, title);
  };

  const handleAddToExistingPlaylist = (playlistId: string, playlistName: string) => {
    addBeatToPlaylist(playlistId, id, title);
  };

  const handleCreateNewPlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({ 
        title: "Invalid name", 
        description: "Please enter a playlist name." 
      });
      return;
    }
    createPlaylist(newPlaylistName, undefined, id);
    setNewPlaylistName("");
    setIsPlaylistDialogOpen(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="w-6 h-6 sm:w-8 sm:h-8 p-0 hover:bg-muted">
          <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleToggleLike}>
          <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          {liked ? 'Remove from Favorites' : 'Add to Favorites'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleShare}>
          <Share className="h-4 w-4 mr-2" />
          Share Beat
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {playlists.map((playlist) => (
          <DropdownMenuItem 
            key={playlist.id} 
            onClick={() => handleAddToExistingPlaylist(playlist.id, playlist.name)}
          >
            <List className="h-4 w-4 mr-2" />
            Add to "{playlist.name}"
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Playlist
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input 
                  id="playlist-name" 
                  value={newPlaylistName} 
                  onChange={(e) => setNewPlaylistName(e.target.value)} 
                  placeholder="Enter playlist name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewPlaylist();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPlaylistDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewPlaylist} disabled={!newPlaylistName.trim()}>
                  Create & Add Beat
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
