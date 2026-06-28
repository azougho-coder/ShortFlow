const SYSTEM_PROMPT = `You are an expert YouTube Shorts metadata specialist for a Shorts management agency. Given a video transcript, client profile, and optionally their YouTube performance data, generate a complete high-performing metadata package.

When performance data is provided, use it to identify patterns — what hook styles, title formats, and topics perform best for this specific channel — and apply those patterns to the new package.

Return ONLY valid JSON, no markdown, no backticks, no explanation. Use exactly this structure:
{"clipRating":"FIRE","clipAnalysis":"2 sentence analysis of why this clip will or won't perform","hook":"Perfect opening hook line for the first 3 seconds","titles":["Title 1","Title 2","Title 3","Title 4","Title 5"],"description":"Full 150-200 word YouTube description optimized for search with call to action. Do NOT include hashtags in the description — they will be added automatically.","hashtags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"] (single words or short phrases, no # symbol, these become YouTube tags AND hashtags in the description),"bestMoment":"The single most powerful 15-second moment to highlight in editing","postingTip":"One specific tactical tip for maximizing this clip's performance","performanceInsight":"If performance data was provided: one sentence about what pattern from top performers was applied. If no data: empty string."}
clipRating must be exactly one of: FIRE, GOOD, or WEAK`;

async function getYouTubeStats(userEmail, clientId) {
  try {
    const { kv } = await import("@vercel/kv");
    const raw = await kv.get(`yt:${userEmail}:${clientId}`);
    if (!raw) return null;

    const ytData = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Refresh token if needed
    let accessToken = ytData.accessToken;
    if (ytData.refreshToken) {
      const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: ytData.refreshToken,
          grant_type: "refresh_token",
        }),
      });
      const refreshed = await refreshRes.json();
      if (refreshed.access_token) {
        accessToken = refreshed.access_token;
        await kv.set(`yt:${userEmail}:${clientId}`, JSON.stringify({ ...ytData, accessToken }));
      }
    }

    // Get recent Shorts
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ytData.channelId}&type=video&videoDuration=short&order=date&maxResults=20`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    if (!searchData.items?.length) return null;

    const videoIds = searchData.items.map(v => v.id.videoId).join(",");
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const statsData = await statsRes.json();

    const videos = (statsData.items || [])
      .map(v => ({
        title: v.snippet.title,
        views: parseInt(v.statistics.viewCount || 0),
        likes: parseInt(v.statistics.likeCount || 0),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return { channelName: ytData.channelName, topVideos: videos };
  } catch (err) {
    console.error("Error fetching YouTube stats for generate:", err);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transcript, client, userEmail } = req.body;

  if (!transcript || !client) {
    return res.status(400).json({ error: "Missing transcript or client" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  }

  // Try to get YouTube performance data if available
  let performanceContext = "";
  if (userEmail && client.id) {
    const ytStats = await getYouTubeStats(userEmail, client.id);
    if (ytStats && ytStats.topVideos.length > 0) {
      performanceContext = `\n\nYOUTUBE PERFORMANCE DATA (use this to inform your package):
Channel: ${ytStats.channelName}
Top performing Shorts by views:
${ytStats.topVideos.map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views, ${v.likes.toLocaleString()} likes`).join("\n")}

Analyze these top performers. What hook styles, title formats, and topics are working? Apply those patterns to the new package.`;
    }
  }

  const fullPrompt = `${SYSTEM_PROMPT}

CLIENT PROFILE:
Name: ${client.name}
Niche: ${client.niche}
Tone: ${client.tone}${client.notes ? `\nNotes: ${client.notes}` : ""}${performanceContext}

TRANSCRIPT:
${transcript}

Return ONLY the JSON object. Nothing else.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: fullPrompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || `API error ${response.status}`,
      });
    }

    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({ error: "No JSON in AI response: " + raw.slice(0, 100) });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
