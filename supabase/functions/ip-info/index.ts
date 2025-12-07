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
    if (cfConnectingIp) {
      clientIp = cfConnectingIp;
    } else if (xff) {
      clientIp = xff.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    }

    // Get user agent
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const acceptLanguage = req.headers.get('accept-language') || 'Unknown';

    console.log(`IP info request from: ${clientIp}`);

    // Use ip-api.com for geolocation (free, no API key needed, 45 req/min)
    let geoData = {
      isp: 'Unknown ISP',
      org: '',
      as: 'Unknown',
      city: 'Unknown',
      regionName: 'Unknown',
      country: 'Unknown',
      countryCode: 'XX',
      timezone: 'Unknown',
      proxy: false,
      hosting: false,
      query: clientIp,
    };

    try {
      // ip-api.com free tier - returns JSON with geo data
      const geoResponse = await fetch(
        `http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (geoResponse.ok) {
        const data = await geoResponse.json();
        if (data.status === 'success') {
          geoData = data;
          console.log(`Geo lookup success for ${clientIp}:`, data.city, data.country);
        } else {
          console.log(`Geo lookup failed for ${clientIp}:`, data.message);
        }
      }
    } catch (geoError) {
      console.error('Geo lookup error:', geoError);
    }

    // Extract ASN number from the "as" field (format: "AS12345 Company Name")
    const asnMatch = geoData.as?.match(/^(AS\d+)/);
    const asn = asnMatch ? asnMatch[1] : geoData.as || 'Unknown';

    return new Response(JSON.stringify({
      ip: clientIp,
      userAgent,
      acceptLanguage,
      serverTime: new Date().toISOString(),
      // Geolocation data
      isp: geoData.isp || 'Unknown ISP',
      org: geoData.org || '',
      asn: asn,
      city: geoData.city || 'Unknown',
      region: geoData.regionName || 'Unknown',
      country: geoData.country || 'Unknown',
      countryCode: geoData.countryCode || 'XX',
      timezone: geoData.timezone || 'Unknown',
      ipType: clientIp.includes(':') ? 'IPv6' : 'IPv4',
      vpnDetected: geoData.proxy || geoData.hosting || false,
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
