import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const QUESTIONS = {
  best_pattern: "What's my best performing pattern right now? Analyze the top performing Shorts and identify the specific pattern in hooks, titles, or topics that's driving views.",
  underperforming: "What's underperforming and why? Look at the lowest performing Shorts compared to the average and explain what likely went wrong.",
  best_time: "When should I be posting? Based on the publish dates and performance of these Shorts, suggest what timing patterns seem to correlate with better performance.",
  month_comparison: "How does this month compare to last month? Compare the performance of Shorts published in the last 30 days versus the 30 days before that.",
  next_topic: "What topic should I try next? Based on what's working, suggest a specific new angle or topic direction worth testing.",
  title_analysis: "Which titles or hooks are working best? Compare the wording, length, and style of the top performing titles versus the weaker ones and identify what makes the difference.",
  engagement: "How's my engagement compared to my views? Look at the ratio of likes and comments to views across these Shorts and flag anything unusual — either surprisingly high or low engagement relative to views.",
  summary: "Give me a quick overall summary of how this channel is doing right now. Cover the general trend, the standout video, and one clear takeaway.",
};

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

async function getFullChannelData(userEmail, clientId) {
  const { kv } = await import("@vercel/kv");
  const raw = await kv.get(`yt:${userEmail}:${clientId}`);
  if (!raw) return null;

  const ytData = typeof raw === "string" ? JSON.parse(raw) : raw;
  let accessToken = ytData.accessToken;

  if (ytData.refreshToken) {
    const refreshed = await refreshAccessToken(ytData.refreshToken);
    if (refreshed.access_token) {
      accessToken = refreshed.access_token;
      await kv.set(`yt:${userEmail}:${clientId}`, JSON.stringify({ ...ytData, accessToken }));
    }
  }

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytData.channelId}&type=video&videoDuration=short&order=date&maxResults=20`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();
  if (!searchData.items?.length) return { channelName: ytData.channelName, videos: [] };

  const videoIds = searchData.items.map(v => v.id.videoId).join(",");
  const statsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const statsData = await statsRes.json();

  const videos = (statsData.items || []).map(v => ({
    title: v.snippet.title,
    publishedAt: v.snippet.publishedAt,
    views: parseInt(v.statistics.viewCount || 0),
    likes: parseInt(v.statistics.likeCount || 0),
    comments: parseInt(v.statistics.commentCount || 0),
  })).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return { channelName: ytData.channelName, videos };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { clientId, questionKey } = req.body;
  if (!clientId || !questionKey || !QUESTIONS[questionKey]) {
    return res.status(400).json({ error: "Missing or invalid clientId/questionKey" });
  }

  try {
    const channelData = await getFullChannelData(session.user.email, clientId);

    if (!channelData) {
      return res.status(404).json({ error: "YouTube not connected for this client" });
    }

    if (channelData.videos.length === 0) {
      return res.status(200).json({ answer: "Not enough video data yet to answer this — post a few Shorts first, then check back." });
    }

    const videoList = channelData.videos.map((v, i) =>
      `${i + 1}. "${v.title}" — ${v.views} views, ${v.likes} likes, ${v.comments} comments, published ${v.publishedAt.slice(0, 10)}`
    ).join("\n");

    const prompt = `You are a YouTube Shorts performance analyst. Here is real data for the channel "${channelData.channelName}":

${videoList}

Question: ${QUESTIONS[questionKey]}

Give a direct, specific, actionable answer using the actual numbers and titles above. Reference specific videos by title where relevant. Keep it to 3-5 sentences. No generic advice — everything must be grounded in this specific data. If there isn't enough data to answer confidently, say so honestly.`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) {
      return res.status(aiRes.status).json({ error: aiData?.error?.message || "AI request failed" });
    }

    const answer = aiData.content?.find(b => b.type === "text")?.text || "Couldn't generate an answer.";
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Insights error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
