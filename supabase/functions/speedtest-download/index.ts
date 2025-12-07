import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'Content-Length, X-Bytes-Total, X-Server-Time',
};

// Generate random bytes for download testing
function generateRandomBytes(size: number): Uint8Array {
  const buffer = new Uint8Array(size);
  crypto.getRandomValues(buffer);
  return buffer;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sizeParam = url.searchParams.get('size') || '1048576'; // Default 1MB
    const size = Math.min(Math.max(parseInt(sizeParam, 10), 1024), 50 * 1024 * 1024); // Min 1KB, Max 50MB
    
    console.log(`Download request: size=${size} bytes`);

    const data = generateRandomBytes(size);
    const serverTime = Date.now();

    return new Response(new Uint8Array(data).buffer as ArrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Length': size.toString(),
        'X-Bytes-Total': size.toString(),
        'X-Server-Time': serverTime.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
