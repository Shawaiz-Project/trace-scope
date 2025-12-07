import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB max

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read the entire body
    const body = await req.arrayBuffer();
    const totalBytes = body.byteLength;
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    
    if (totalBytes > MAX_UPLOAD_SIZE) {
      return new Response(JSON.stringify({ error: 'Upload too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bps = elapsed > 0 ? (totalBytes * 8) / elapsed : 0;
    
    console.log(`Upload received: ${totalBytes} bytes in ${elapsed.toFixed(3)}s = ${(bps / 1000000).toFixed(2)} Mbps`);

    return new Response(JSON.stringify({
      receivedBytes: totalBytes,
      elapsedSeconds: elapsed,
      uploadBps: Math.round(bps),
      serverTime: Date.now(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
