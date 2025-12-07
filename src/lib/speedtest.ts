const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface SpeedTestResult {
  ping: {
    latency: number;
    jitter: number;
    samples: number[];
  };
  download: {
    speedBps: number;
    speedMbps: number;
    bytesTransferred: number;
    durationMs: number;
  };
  upload: {
    speedBps: number;
    speedMbps: number;
    bytesTransferred: number;
    durationMs: number;
  };
  timestamp: string;
}

export interface SpeedTestProgress {
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number; // 0-100
  currentSpeed?: number; // Mbps
  currentPing?: number; // ms
}

// Ping test using HTTP requests
export async function measurePing(
  iterations: number = 10,
  onProgress?: (latency: number, iteration: number) => void
): Promise<{ latency: number; jitter: number; samples: number[] }> {
  const samples: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/speedtest-ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientTime: Date.now(), seq: i }),
      });
      
      if (!response.ok) throw new Error('Ping failed');
      
      await response.json();
      const endTime = performance.now();
      const latency = endTime - startTime;
      samples.push(latency);
      
      onProgress?.(latency, i + 1);
    } catch (error) {
      console.error(`Ping iteration ${i} failed:`, error);
    }
    
    // Small delay between pings
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (samples.length === 0) {
    throw new Error('All ping attempts failed');
  }
  
  // Calculate average latency (excluding outliers)
  const sortedSamples = [...samples].sort((a, b) => a - b);
  const trimmedSamples = sortedSamples.slice(1, -1); // Remove highest and lowest
  const avgLatency = trimmedSamples.length > 0
    ? trimmedSamples.reduce((a, b) => a + b, 0) / trimmedSamples.length
    : sortedSamples.reduce((a, b) => a + b, 0) / sortedSamples.length;
  
  // Calculate jitter (standard deviation of latency differences)
  let jitter = 0;
  if (samples.length > 1) {
    const diffs: number[] = [];
    for (let i = 1; i < samples.length; i++) {
      diffs.push(Math.abs(samples[i] - samples[i - 1]));
    }
    jitter = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  }
  
  return {
    latency: avgLatency,
    jitter,
    samples,
  };
}

// Download speed test
export async function measureDownload(
  durationMs: number = 10000,
  onProgress?: (speedMbps: number, bytesReceived: number) => void
): Promise<{ speedBps: number; speedMbps: number; bytesTransferred: number; durationMs: number }> {
  const startTime = performance.now();
  let totalBytes = 0;
  const chunkSize = 2 * 1024 * 1024; // 2MB chunks
  const activeRequests: Promise<void>[] = [];
  const maxConcurrent = 4;
  let shouldStop = false;
  
  const downloadChunk = async () => {
    while (!shouldStop) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/speedtest-download?size=${chunkSize}&_=${Date.now()}`,
          { cache: 'no-store' }
        );
        
        if (!response.ok) throw new Error('Download failed');
        
        const data = await response.arrayBuffer();
        totalBytes += data.byteLength;
        
        const elapsed = performance.now() - startTime;
        const speedBps = (totalBytes * 8) / (elapsed / 1000);
        const speedMbps = speedBps / 1000000;
        
        onProgress?.(speedMbps, totalBytes);
        
        if (elapsed >= durationMs) {
          shouldStop = true;
        }
      } catch (error) {
        console.error('Download chunk error:', error);
        break;
      }
    }
  };
  
  // Start concurrent downloads
  for (let i = 0; i < maxConcurrent; i++) {
    activeRequests.push(downloadChunk());
  }
  
  // Also set a timeout to stop
  setTimeout(() => { shouldStop = true; }, durationMs + 1000);
  
  await Promise.all(activeRequests);
  
  const actualDuration = performance.now() - startTime;
  const speedBps = (totalBytes * 8) / (actualDuration / 1000);
  const speedMbps = speedBps / 1000000;
  
  return {
    speedBps,
    speedMbps,
    bytesTransferred: totalBytes,
    durationMs: actualDuration,
  };
}

// Upload speed test
export async function measureUpload(
  durationMs: number = 10000,
  onProgress?: (speedMbps: number, bytesSent: number) => void
): Promise<{ speedBps: number; speedMbps: number; bytesTransferred: number; durationMs: number }> {
  const startTime = performance.now();
  let totalBytes = 0;
  const chunkSize = 1 * 1024 * 1024; // 1MB chunks
  const activeRequests: Promise<void>[] = [];
  const maxConcurrent = 3;
  let shouldStop = false;
  
  // Pre-generate random data
  const randomData = new Uint8Array(chunkSize);
  crypto.getRandomValues(randomData);
  
  const uploadChunk = async () => {
    while (!shouldStop) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/speedtest-upload`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: randomData,
          }
        );
        
        if (!response.ok) throw new Error('Upload failed');
        
        await response.json();
        totalBytes += chunkSize;
        
        const elapsed = performance.now() - startTime;
        const speedBps = (totalBytes * 8) / (elapsed / 1000);
        const speedMbps = speedBps / 1000000;
        
        onProgress?.(speedMbps, totalBytes);
        
        if (elapsed >= durationMs) {
          shouldStop = true;
        }
      } catch (error) {
        console.error('Upload chunk error:', error);
        break;
      }
    }
  };
  
  // Start concurrent uploads
  for (let i = 0; i < maxConcurrent; i++) {
    activeRequests.push(uploadChunk());
  }
  
  // Also set a timeout to stop
  setTimeout(() => { shouldStop = true; }, durationMs + 1000);
  
  await Promise.all(activeRequests);
  
  const actualDuration = performance.now() - startTime;
  const speedBps = (totalBytes * 8) / (actualDuration / 1000);
  const speedMbps = speedBps / 1000000;
  
  return {
    speedBps,
    speedMbps,
    bytesTransferred: totalBytes,
    durationMs: actualDuration,
  };
}

// Full speed test
export async function runSpeedTest(
  onProgress?: (progress: SpeedTestProgress) => void
): Promise<SpeedTestResult> {
  onProgress?.({ phase: 'ping', progress: 0 });
  
  // Ping test
  const pingResult = await measurePing(10, (latency, iteration) => {
    onProgress?.({
      phase: 'ping',
      progress: (iteration / 10) * 100,
      currentPing: latency,
    });
  });
  
  onProgress?.({ phase: 'download', progress: 0 });
  
  // Download test
  const downloadResult = await measureDownload(10000, (speedMbps, bytesReceived) => {
    onProgress?.({
      phase: 'download',
      progress: Math.min(100, (bytesReceived / (10 * 1024 * 1024)) * 10),
      currentSpeed: speedMbps,
    });
  });
  
  onProgress?.({ phase: 'upload', progress: 0 });
  
  // Upload test
  const uploadResult = await measureUpload(10000, (speedMbps, bytesSent) => {
    onProgress?.({
      phase: 'upload',
      progress: Math.min(100, (bytesSent / (5 * 1024 * 1024)) * 10),
      currentSpeed: speedMbps,
    });
  });
  
  onProgress?.({ phase: 'complete', progress: 100 });
  
  return {
    ping: pingResult,
    download: downloadResult,
    upload: uploadResult,
    timestamp: new Date().toISOString(),
  };
}

// Fetch IP info from backend
export async function fetchIPInfo(): Promise<{
  ip: string;
  isp: string;
  asn: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  timezone: string;
  ipType: string;
  vpnDetected: boolean;
  reverseDns: string;
  userAgent: string;
}> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ip-info`);
  if (!response.ok) throw new Error('Failed to fetch IP info');
  return response.json();
}

// Format speed for display
export function formatSpeed(mbps: number): string {
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(2)} Gbps`;
  } else if (mbps >= 1) {
    return `${mbps.toFixed(2)} Mbps`;
  } else {
    return `${(mbps * 1000).toFixed(0)} Kbps`;
  }
}

// Format bytes for display
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  } else if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}
