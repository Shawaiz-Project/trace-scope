import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Expose-Headers': 'Content-Length, X-Bytes-Total, X-Server-Time',
};

// Generate random bytes in chunks to avoid crypto.getRandomValues() 64KB limit
function generateRandomBytes(size: number): Uint8Array {
  const buffer = new Uint8Array(size);
  const chunkSize = 65536; // 64KB max for crypto.getRandomValues
  
  for (let offset = 0; offset < size; offset += chunkSize) {
    const remaining = size - offset;
    const currentChunkSize = Math.min(chunkSize, remaining);
    const chunk = new Uint8Array(currentChunkSize);
    crypto.getRandomValues(chunk);
    buffer.set(chunk, offset);
  }
  
  return buffer;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sizeParam = url.searchParams.get('size') || '1048576'; // Default 1MB
    const size = Math.min(Math.max(parseInt(sizeParam, 10), 1024), 10 * 1024 * 1024); // Min 1KB, Max 10MB
    
    console.log(`Download request: size=${size} bytes`);

    const data = generateRandomBytes(size);
    const serverTime = Date.now();

    return new Response(data.buffer as ArrayBuffer, {
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
