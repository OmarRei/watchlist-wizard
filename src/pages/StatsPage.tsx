import Header from "@/components/Header";
import { useWatchlist, WATCH_STATUSES } from "@/hooks/useWatchlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Film, Tv, Star, BarChart3, Loader2 } from "lucide-react";

const STATUS_COLORS = [
  "hsl(198, 93%, 59%)",
  "hsl(142, 70%, 45%)",
  "hsl(215, 20%, 65%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
];

const RATING_COLOR = "hsl(198, 93%, 59%)";

export default function StatsPage() {
  const { watchlist, isLoading } = useWatchlist();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const totalItems = watchlist.length;
  const movieCount = watchlist.filter((i) => i.media_type === "movie").length;
  const seriesCount = watchlist.filter((i) => i.media_type === "series").length;
  const ratedItems = watchlist.filter((i) => i.rating != null && i.rating > 0);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((sum, i) => sum + (i.rating ?? 0), 0) / ratedItems.length).toFixed(1)
    : "—";

  const statusData = WATCH_STATUSES.map((s) => ({
    name: s.label,
    value: watchlist.filter((i) => i.status === s.value).length,
  })).filter((d) => d.value > 0);

  const ratingData = [1, 2, 3, 4, 5].map((r) => ({
    rating: `${r} ★`,
    count: watchlist.filter((i) => i.rating === r).length,
  }));

  const typeData = [
    { name: "Movies", value: movieCount },
    { name: "Series", value: seriesCount },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-foreground mb-8">STATISTICS</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">{totalItems}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Film className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">{movieCount}</p>
              <p className="text-sm text-muted-foreground">Movies</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Tv className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">{seriesCount}</p>
              <p className="text-sm text-muted-foreground">Series</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-10">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Ratings Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ratings Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ratingData}>
                  <XAxis dataKey="rating" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill={RATING_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Movies vs Series */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Movies vs Series</CardTitle>
            </CardHeader>
            <CardContent>
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                      <Cell fill="hsl(198, 93%, 59%)" />
                      <Cell fill="hsl(142, 70%, 45%)" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-10">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
