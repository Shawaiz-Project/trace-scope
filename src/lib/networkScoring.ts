// Network quality scoring algorithm

export interface Recommendation {
  category: string;
  label: string;
  icon: string;
  suitable: boolean;
  description: string;
}

export interface NetworkQualityScore {
  overallScore: number;
  grade: string;
  gradeLabel: string;
  pingScore: number;
  jitterScore: number;
  downloadScore: number;
  uploadScore: number;
  recommendations: Recommendation[];
  summary: string;
}

export function calculateNetworkQuality(
  ping: number,
  jitter: number,
  downloadMbps: number,
  uploadMbps: number,
  packetLoss: number = 0
): NetworkQualityScore {
  // Calculate individual scores (0-100)
  const pingScore = Math.max(0, Math.min(100, 100 - (ping - 10) * 2));
  const jitterScore = Math.max(0, Math.min(100, 100 - jitter * 5));
  const downloadScore = Math.min(100, downloadMbps);
  const uploadScore = Math.min(100, uploadMbps * 2);

  // Penalty for packet loss
  const lossPenalty = packetLoss * 10;

  // Calculate overall score with weights
  let overall =
    pingScore * 0.3 +
    jitterScore * 0.2 +
    downloadScore * 0.3 +
    uploadScore * 0.2 -
    lossPenalty;

  overall = Math.max(0, Math.min(100, overall));

  // Determine grade
  const { grade, gradeLabel } = getGrade(overall);

  // Generate recommendations
  const recommendations = generateRecommendations(
    ping,
    jitter,
    downloadMbps,
    uploadMbps,
    packetLoss
  );

  // Generate summary
  const summary = generateSummary(overall, recommendations);

  return {
    overallScore: Math.round(overall),
    grade,
    gradeLabel,
    pingScore: Math.round(pingScore),
    jitterScore: Math.round(jitterScore),
    downloadScore: Math.round(downloadScore),
    uploadScore: Math.round(uploadScore),
    recommendations,
    summary,
  };
}

function getGrade(score: number): { grade: string; gradeLabel: string } {
  if (score >= 90) return { grade: "A+", gradeLabel: "Exceptional" };
  if (score >= 80) return { grade: "A", gradeLabel: "Excellent" };
  if (score >= 70) return { grade: "B", gradeLabel: "Good" };
  if (score >= 60) return { grade: "C", gradeLabel: "Fair" };
  if (score >= 50) return { grade: "D", gradeLabel: "Poor" };
  return { grade: "F", gradeLabel: "Very Poor" };
}

function generateRecommendations(
  ping: number,
  jitter: number,
  downloadMbps: number,
  uploadMbps: number,
  packetLoss: number
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Gaming
  const gamingSuitable = ping < 50 && jitter < 15 && packetLoss < 1;
  let gamingDesc: string;
  if (gamingSuitable) {
    gamingDesc =
      ping < 20 && jitter < 5
        ? "Ideal for competitive gaming with minimal latency"
        : "Good for online gaming with stable connection";
  } else {
    gamingDesc = "May experience lag in fast-paced online games";
  }
  recommendations.push({
    category: "gaming",
    label: "Gaming",
    icon: "🎮",
    suitable: gamingSuitable,
    description: gamingDesc,
  });

  // 4K Streaming
  const streaming4kSuitable = downloadMbps >= 25 && jitter < 30;
  let streamingDesc: string;
  if (streaming4kSuitable) {
    streamingDesc =
      downloadMbps >= 50
        ? "Perfect for 4K HDR streaming on multiple devices"
        : "Suitable for 4K streaming on one device";
  } else {
    streamingDesc = "May buffer during 4K playback, HD recommended";
  }
  recommendations.push({
    category: "streaming_4k",
    label: "4K Streaming",
    icon: "📺",
    suitable: streaming4kSuitable,
    description: streamingDesc,
  });

  // Video Calls
  const videoSuitable = uploadMbps >= 3 && ping < 150 && jitter < 50;
  let videoDesc: string;
  if (videoSuitable) {
    videoDesc =
      uploadMbps >= 10 && ping < 50
        ? "Excellent for HD group video conferencing"
        : "Good for standard video calls";
  } else {
    videoDesc = "May experience quality issues in video calls";
  }
  recommendations.push({
    category: "video_calls",
    label: "Video Calls",
    icon: "📹",
    suitable: videoSuitable,
    description: videoDesc,
  });

  // Work from Home
  const wfhSuitable = downloadMbps >= 10 && uploadMbps >= 5 && ping < 100;
  let wfhDesc: string;
  if (wfhSuitable) {
    wfhDesc =
      downloadMbps >= 50 && uploadMbps >= 20
        ? "Perfect for remote work with large file transfers"
        : "Suitable for standard remote work tasks";
  } else {
    wfhDesc = "Consider upgrading for better remote work experience";
  }
  recommendations.push({
    category: "work_from_home",
    label: "Remote Work",
    icon: "💼",
    suitable: wfhSuitable,
    description: wfhDesc,
  });

  // Live Streaming
  const liveSuitable = uploadMbps >= 10 && ping < 100 && jitter < 20;
  let liveDesc: string;
  if (liveSuitable) {
    liveDesc =
      uploadMbps >= 25
        ? "Great for 1080p live streaming to platforms"
        : "Suitable for 720p live streaming";
  } else {
    liveDesc = "Upload speed may limit streaming quality";
  }
  recommendations.push({
    category: "live_streaming",
    label: "Live Streaming",
    icon: "🎥",
    suitable: liveSuitable,
    description: liveDesc,
  });

  // Cloud Gaming
  const cloudGamingSuitable = ping < 40 && jitter < 10 && downloadMbps >= 35;
  const cloudDesc = cloudGamingSuitable
    ? "Ideal for cloud gaming services like GeForce NOW"
    : "May experience input lag in cloud gaming";
  recommendations.push({
    category: "cloud_gaming",
    label: "Cloud Gaming",
    icon: "☁️",
    suitable: cloudGamingSuitable,
    description: cloudDesc,
  });

  return recommendations;
}

function generateSummary(score: number, recommendations: Recommendation[]): string {
  const suitableCount = recommendations.filter((r) => r.suitable).length;
  const total = recommendations.length;

  if (score >= 90) {
    return `Exceptional connection! Your network excels at all ${suitableCount}/${total} tested activities.`;
  } else if (score >= 80) {
    return `Excellent connection suitable for ${suitableCount}/${total} activities with great performance.`;
  } else if (score >= 70) {
    return `Good connection handling ${suitableCount}/${total} activities well.`;
  } else if (score >= 60) {
    return `Fair connection. Works for ${suitableCount}/${total} activities but may have limitations.`;
  } else if (score >= 50) {
    return `Below average connection. Only ${suitableCount}/${total} activities may work smoothly.`;
  }
  return "Poor connection quality. Consider troubleshooting or upgrading your network.";
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "A+":
    case "A":
      return "text-green-500";
    case "B":
      return "text-yellow-500";
    case "C":
      return "text-orange-500";
    case "D":
    case "F":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

export function getGradeBgColor(grade: string): string {
  switch (grade) {
    case "A+":
    case "A":
      return "bg-green-500";
    case "B":
      return "bg-yellow-500";
    case "C":
      return "bg-orange-500";
    case "D":
    case "F":
      return "bg-red-500";
    default:
      return "bg-muted";
  }
}
