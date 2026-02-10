import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://id-preview--05a28fb5-7915-45f9-9ad4-a0641e1c6278.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OMDB_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OMDB API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("s");
    const imdbId = url.searchParams.get("i");
    const season = url.searchParams.get("Season");

    if (!search && !imdbId) {
      return new Response(JSON.stringify({ error: "Missing search query or IMDB ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate inputs
    if (search && search.length > 100) {
      return new Response(JSON.stringify({ error: "Search query too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (imdbId && !/^tt\d{7,8}$/.test(imdbId)) {
      return new Response(JSON.stringify({ error: "Invalid IMDB ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (season && (!/^\d+$/.test(season) || parseInt(season) < 1 || parseInt(season) > 100)) {
      return new Response(JSON.stringify({ error: "Invalid season number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let omdbUrl = `https://www.omdbapi.com/?apikey=${apiKey}`;
    if (search) {
      omdbUrl += `&s=${encodeURIComponent(search.trim())}`;
      const page = url.searchParams.get("page");
      if (page && /^\d+$/.test(page)) omdbUrl += `&page=${encodeURIComponent(page)}`;
    } else if (imdbId) {
      omdbUrl += `&i=${encodeURIComponent(imdbId.trim())}`;
      if (season) {
        omdbUrl += `&Season=${encodeURIComponent(season)}`;
      } else {
        omdbUrl += `&plot=full`;
      }
    }

    const omdbRes = await fetch(omdbUrl);
    const data = await omdbRes.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
