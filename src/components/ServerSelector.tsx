import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, RefreshCw, Signal } from "lucide-react";
import {
  fetchServerRegions,
  pingServer,
  type ServerInfo,
  type ServerRegion,
} from "@/lib/serverRegions";

interface ServerSelectorProps {
  selectedServer: ServerInfo | null;
  onServerSelect: (server: ServerInfo) => void;
  disabled?: boolean;
}

export function ServerSelector({
  selectedServer,
  onServerSelect,
  disabled = false,
}: ServerSelectorProps) {
  const [regions, setRegions] = useState<ServerRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [serverPings, setServerPings] = useState<Record<string, number>>({});

  // Load server regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    setLoading(true);
    try {
      const data = await fetchServerRegions();
      setRegions(data);
      
      // Auto-select first non-auto server if none selected
      if (!selectedServer) {
        const firstServer = data
          .filter((r) => r.id !== "auto")
          .flatMap((r) => r.servers)[0];
        if (firstServer) {
          onServerSelect(firstServer);
        }
      }
    } catch (error) {
      console.error("Failed to load server regions:", error);
    } finally {
      setLoading(false);
    }
  };

  const pingAllServers = async () => {
    setPinging(true);
    const pings: Record<string, number> = {};
    
    const allServers = regions
      .filter((r) => r.id !== "auto")
      .flatMap((r) => r.servers);
    
    // Ping servers in parallel
    await Promise.all(
      allServers.map(async (server) => {
        const ping = await pingServer(server);
        pings[server.id] = ping;
      })
    );
    
    setServerPings(pings);
    
    // Auto-select best server
    const bestServerId = Object.entries(pings).sort(([, a], [, b]) => a - b)[0]?.[0];
    if (bestServerId) {
      const bestServer = allServers.find((s) => s.id === bestServerId);
      if (bestServer) {
        onServerSelect(bestServer);
      }
    }
    
    setPinging(false);
  };

  const handleServerChange = (serverId: string) => {
    if (serverId === "auto-best") {
      pingAllServers();
      return;
    }
    
    const server = regions
      .flatMap((r) => r.servers)
      .find((s) => s.id === serverId);
    
    if (server) {
      onServerSelect(server);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading servers...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>Server:</span>
      </div>
      
      <Select
        value={selectedServer?.id || ""}
        onValueChange={handleServerChange}
        disabled={disabled || pinging}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select a server">
            {selectedServer && (
              <span className="flex items-center gap-2">
                <span>{selectedServer.flag}</span>
                <span>{selectedServer.name}</span>
                {serverPings[selectedServer.id] && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {Math.round(serverPings[selectedServer.id])}ms
                  </span>
                )}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectGroup key={region.id}>
              <SelectLabel>{region.name}</SelectLabel>
              {region.servers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  <div className="flex items-center gap-2 w-full">
                    <span>{server.flag}</span>
                    <span>{server.name}</span>
                    {serverPings[server.id] && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {Math.round(serverPings[server.id])}ms
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="sm"
        onClick={pingAllServers}
        disabled={disabled || pinging}
        title="Find best server"
      >
        {pinging ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Signal className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
