// Server region definitions for multi-region speed testing

export interface ServerInfo {
  id: string;
  name: string;
  region: string;
  flag: string;
  endpoint: string;
  ping?: number;
}

export interface ServerRegion {
  id: string;
  name: string;
  servers: ServerInfo[];
}

// Get the API base URL from environment or default
export function getApiBaseUrl(): string {
  // Check for external FastAPI backend URL
  const externalApi = import.meta.env.VITE_API_URL;
  if (externalApi) {
    return externalApi;
  }
  
  // Fallback to Supabase Edge Functions
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/functions/v1`;
  }
  
  // Local development fallback
  return "http://localhost:8000/api/v1";
}

// Default server regions (used when API is not available)
export const DEFAULT_SERVER_REGIONS: ServerRegion[] = [
  {
    id: "auto",
    name: "Auto (Best)",
    servers: [
      {
        id: "auto-best",
        name: "Automatic Selection",
        region: "auto",
        flag: "🌐",
        endpoint: "",
      },
    ],
  },
  {
    id: "asia",
    name: "Asia Pacific",
    servers: [
      { id: "asia-singapore", name: "Singapore", region: "asia", flag: "🇸🇬", endpoint: "" },
      { id: "asia-tokyo", name: "Tokyo, Japan", region: "asia", flag: "🇯🇵", endpoint: "" },
      { id: "asia-mumbai", name: "Mumbai, India", region: "asia", flag: "🇮🇳", endpoint: "" },
      { id: "asia-sydney", name: "Sydney, Australia", region: "asia", flag: "🇦🇺", endpoint: "" },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    servers: [
      { id: "eu-london", name: "London, UK", region: "europe", flag: "🇬🇧", endpoint: "" },
      { id: "eu-frankfurt", name: "Frankfurt, Germany", region: "europe", flag: "🇩🇪", endpoint: "" },
      { id: "eu-amsterdam", name: "Amsterdam, Netherlands", region: "europe", flag: "🇳🇱", endpoint: "" },
      { id: "eu-paris", name: "Paris, France", region: "europe", flag: "🇫🇷", endpoint: "" },
    ],
  },
  {
    id: "north-america",
    name: "North America",
    servers: [
      { id: "us-east", name: "New York, USA", region: "north-america", flag: "🇺🇸", endpoint: "" },
      { id: "us-west", name: "Los Angeles, USA", region: "north-america", flag: "🇺🇸", endpoint: "" },
      { id: "us-central", name: "Dallas, USA", region: "north-america", flag: "🇺🇸", endpoint: "" },
      { id: "ca-toronto", name: "Toronto, Canada", region: "north-america", flag: "🇨🇦", endpoint: "" },
    ],
  },
  {
    id: "south-america",
    name: "South America",
    servers: [
      { id: "br-saopaulo", name: "São Paulo, Brazil", region: "south-america", flag: "🇧🇷", endpoint: "" },
    ],
  },
  {
    id: "middle-east",
    name: "Middle East",
    servers: [
      { id: "me-dubai", name: "Dubai, UAE", region: "middle-east", flag: "🇦🇪", endpoint: "" },
    ],
  },
];

// Get server regions from API or use defaults
export async function fetchServerRegions(): Promise<ServerRegion[]> {
  const externalApi = import.meta.env.VITE_API_URL;
  
  // Only fetch from API if an external backend URL is configured
  if (externalApi) {
    try {
      const response = await fetch(`${externalApi}/server-regions`);
      if (response.ok) {
        const data = await response.json();
        return data.regions || DEFAULT_SERVER_REGIONS;
      }
    } catch (error) {
      console.warn("Failed to fetch server regions, using defaults:", error);
    }
  }
  
  return DEFAULT_SERVER_REGIONS;
}

// Ping a server to measure latency
export async function pingServer(server: ServerInfo): Promise<number> {
  const baseUrl = getApiBaseUrl();
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${baseUrl}/speedtest/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_time: Date.now(), seq: 0 }),
    });
    
    if (response.ok) {
      await response.json();
      return performance.now() - startTime;
    }
  } catch {
    // Return high latency for failed pings
    return 9999;
  }
  
  return 9999;
}

// Ping all servers and return with latency
export async function pingAllServers(servers: ServerInfo[]): Promise<ServerInfo[]> {
  const results = await Promise.all(
    servers.map(async (server) => {
      const ping = await pingServer(server);
      return { ...server, ping };
    })
  );
  
  // Sort by ping
  return results.sort((a, b) => (a.ping || 9999) - (b.ping || 9999));
}

// Get the best server based on ping
export async function getBestServer(regions: ServerRegion[]): Promise<ServerInfo | null> {
  const allServers = regions
    .filter((r) => r.id !== "auto")
    .flatMap((r) => r.servers);
  
  if (allServers.length === 0) return null;
  
  const pingedServers = await pingAllServers(allServers);
  return pingedServers[0] || null;
}
