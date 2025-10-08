export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  
  // Browser detection
  let browserName = "Unknown";
  let browserVersion = "Unknown";
  
  if (ua.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || "Unknown";
  } else if (ua.indexOf("SamsungBrowser") > -1) {
    browserName = "Samsung Internet";
    browserVersion = ua.match(/SamsungBrowser\/(\d+\.\d+)/)?.[1] || "Unknown";
  } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
    browserName = "Opera";
    browserVersion = ua.match(/(?:Opera|OPR)\/(\d+\.\d+)/)?.[1] || "Unknown";
  } else if (ua.indexOf("Trident") > -1) {
    browserName = "Internet Explorer";
    browserVersion = ua.match(/rv:(\d+\.\d+)/)?.[1] || "Unknown";
  } else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) {
    browserName = "Edge";
    browserVersion = ua.match(/(?:Edge|Edg)\/(\d+\.\d+)/)?.[1] || "Unknown";
  } else if (ua.indexOf("Chrome") > -1) {
    browserName = "Chrome";
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || "Unknown";
  } else if (ua.indexOf("Safari") > -1) {
    browserName = "Safari";
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || "Unknown";
  }

  // OS detection
  let os = "Unknown";
  if (ua.indexOf("Win") > -1) os = "Windows";
  else if (ua.indexOf("Mac") > -1) os = "macOS";
  else if (ua.indexOf("Linux") > -1) os = "Linux";
  else if (ua.indexOf("Android") > -1) os = "Android";
  else if (ua.indexOf("iOS") > -1 || ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) os = "iOS";

  // Device type
  let deviceType = "Desktop";
  if (/Mobi|Android/i.test(ua)) deviceType = "Mobile";
  else if (/Tablet|iPad/i.test(ua)) deviceType = "Tablet";

  // Screen info
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const colorDepth = `${window.screen.colorDepth} bit`;

  // CPU cores
  const cpuCores = navigator.hardwareConcurrency || "Unknown";

  // Memory (if available)
  const memory = (navigator as any).deviceMemory 
    ? `${(navigator as any).deviceMemory} GB` 
    : "Unknown";

  // WebGL GPU
  let gpuRenderer = "Unknown";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = (gl as any).getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        gpuRenderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    // GPU detection failed
  }

  // Cookies enabled
  const cookiesEnabled = navigator.cookieEnabled ? "Enabled" : "Disabled";

  // Do Not Track
  const dnt = (navigator as any).doNotTrack === "1" ? "Enabled" : "Disabled";

  // Language
  const language = navigator.language;

  // Timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Connection info
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const connectionType = connection?.effectiveType || "Unknown";
  const estimatedSpeed = connection?.downlink ? `${connection.downlink} Mbps` : "Unknown";

  // Battery (if available)
  let batteryLevel = "Unknown";
  let batteryCharging = "Unknown";

  return {
    browser: {
      name: browserName,
      version: browserVersion,
      cookiesEnabled,
      dnt,
      language,
    },
    device: {
      type: deviceType,
      os,
      screenResolution,
      colorDepth,
      cpuCores,
      memory,
      gpuRenderer,
      timezone,
    },
    network: {
      connectionType,
      estimatedSpeed,
    },
  };
};
