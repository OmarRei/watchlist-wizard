import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Clapperboard, Search, LogOut, Film } from "lucide-react";

export default function Header() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Clapperboard className="h-6 w-6 text-primary" />
          <span className="text-2xl text-foreground tracking-wider">WATCHLOG</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button
            variant={location.pathname === "/" ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/"><Film className="h-4 w-4 mr-1" /> Watchlist</Link>
          </Button>
          <Button
            variant={location.pathname === "/search" ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/search"><Search className="h-4 w-4 mr-1" /> Search</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
