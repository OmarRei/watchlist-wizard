

# Fix: Search Page and Trending Content Not Working

## Problem

All requests to the OMDB proxy edge function are failing with "Failed to fetch" errors. There are two bugs in the edge function code:

### Bug 1: Wrong CORS Origins

The edge function only allows requests from `https://id-preview--05a28fb5-...lovable.app`, but the app is actually served from `https://05a28fb5-...lovableproject.com`. Since the origin does not match, the browser blocks every request due to CORS policy.

**Fix:** Change the CORS configuration to use `'Access-Control-Allow-Origin': '*'` (wildcard) so it works from any origin -- the preview, the published site, and localhost. This follows the recommended pattern for edge functions.

### Bug 2: Wrong Environment Variable Name for the OMDB API Key

The code currently reads the API key with:
```
Deno.env.get("12cc919a")
```
This is using the actual API key value as the variable name, which will always return `undefined`. The secret is stored as `OMDB_API_KEY`, so it should be:
```
Deno.env.get("OMDB_API_KEY")
```

## Changes

Only one file needs to be updated:

**`supabase/functions/omdb-proxy/index.ts`**

1. Replace the restrictive `ALLOWED_ORIGINS` array and `getCorsHeaders` function with a simple wildcard CORS headers object (matching the recommended pattern)
2. Change `Deno.env.get("12cc919a")` to `Deno.env.get("OMDB_API_KEY")`

No other files need to change. Once deployed, both trending content and search will start working immediately.

