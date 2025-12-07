import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from various headers
    const xff = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    let clientIp = 'Unknown';
    if (xff) {
      clientIp = xff.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    } else if (cfConnectingIp) {
      clientIp = cfConnectingIp;
    }

    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const acceptLanguage = req.headers.get('accept-language') || 'Unknown';
    
    // Headers the server sees
    const headersInfo: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      // Filter out sensitive headers
      if (!key.toLowerCase().includes('authorization') && 
          !key.toLowerCase().includes('cookie') &&
          !key.toLowerCase().includes('apikey')) {
        headersInfo[key] = value;
      }
    });

    console.log(`IP info request from: ${clientIp}`);

    // Note: For production, you'd integrate with an IP geolocation service like:
    // - IPinfo.io
    // - MaxMind GeoIP
    // - AbstractAPI
    // For now, we return what we can determine server-side

    return new Response(JSON.stringify({
      ip: clientIp,
      userAgent,
      acceptLanguage,
      headers: headersInfo,
      serverTime: new Date().toISOString(),
      // Placeholder values - integrate with IP geolocation API for real data
      isp: 'Unknown ISP',
      asn: 'Unknown',
      city: 'Unknown',
      region: 'Unknown', 
      country: 'Unknown',
      countryCode: 'XX',
      timezone: 'Unknown',
      ipType: clientIp.includes(':') ? 'IPv6' : 'IPv4',
      vpnDetected: false,
      reverseDns: '',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('IP info error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
