import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

async function refreshAccessToken(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  return res.json();
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: "Missing clientId" });

  try {
    const { kv } = await import("@vercel/kv");
    const raw = await kv.get(`yt:${session.user.email}:${clientId}`);

    if (!raw) {
      return res.status(404).json({ error: "YouTube not connected for this client" });
    }

    const ytData = typeof raw === "string" ? JSON.parse(raw) : raw;
    let accessToken = ytData.accessToken;

    // Try to refresh token if needed
    if (ytData.refreshToken) {
      const refreshed = await refreshAccessToken(ytData.refreshToken);
      if (refreshed.access_token) {
        accessToken = refreshed.access_token;
        // Update stored token
        await kv.set(`yt:${session.user.email}:${clientId}`, JSON.stringify({
          ...ytData,
          accessToken: refreshed.access_token,
        }));
      }
    }

    // Get recent Shorts (videos under 60 seconds)
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytData.channelId}&type=video&videoDuration=short&order=date&maxResults=20`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return res.status(200).json({
        channel: {
          name: ytData.channelName,
          thumb: ytData.channelThumb,
          subscribers: ytData.subscriberCount,
        },
        videos: [],
      });
    }

    // Get stats for each video
    const videoIds = searchData.items.map(v => v.id.videoId).join(",");
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const statsData = await statsRes.json();

    const videos = (statsData.items || []).map(video => ({
      id: video.id,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails?.medium?.url,
      publishedAt: video.snippet.publishedAt,
      views: parseInt(video.statistics.viewCount || 0),
      likes: parseInt(video.statistics.likeCount || 0),
      comments: parseInt(video.statistics.commentCount || 0),
      duration: video.contentDetails.duration,
      url: `https://youtube.com/shorts/${video.id}`,
    }));

    // Sort by views descending
    videos.sort((a, b) => b.views - a.views);

    return res.status(200).json({
      channel: {
        name: ytData.channelName,
        thumb: ytData.channelThumb,
        subscribers: ytData.subscriberCount,
        connectedAt: ytData.connectedAt,
      },
      videos,
    });
  } catch (err) {
    console.error("YouTube stats error:", err);
    return res.status(500).json({ error: err.message });
  }
}
