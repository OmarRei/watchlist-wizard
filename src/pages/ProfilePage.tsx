import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useWatchlist, WATCH_STATUSES } from "@/hooks/useWatchlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Film, Star, Calendar, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { watchlist, isLoading } = useWatchlist();

  const email = user?.email ?? "Unknown";
  const initials = email.slice(0, 2).toUpperCase();
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const ratedItems = watchlist.filter((i) => i.rating != null && i.rating > 0);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((sum, i) => sum + (i.rating ?? 0), 0) / ratedItems.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl text-foreground mb-8">PROFILE</h1>

        {/* User Info */}
        <Card className="mb-6">
          <CardContent className="pt-6 flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold text-foreground">{email}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" /> Member since {createdAt}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Watchlist Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Watchlist Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{watchlist.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{ratedItems.length}</p>
                    <p className="text-xs text-muted-foreground">Rated</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{avgRating}</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  {WATCH_STATUSES.map((s) => {
                    const count = watchlist.filter((i) => i.status === s.value).length;
                    return (
                      <div key={s.value} className="flex justify-between text-sm">
                        <span className="text-foreground">{s.label}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="flex gap-3">
          <Button asChild className="flex-1">
            <Link to="/"><Film className="h-4 w-4 mr-2" /> My Watchlist</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/search"><Search className="h-4 w-4 mr-2" /> Search</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
