export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/dashboard?youtube_error=${error}`);
  }

  if (!code || !state) {
    return res.redirect("/dashboard?youtube_error=missing_params");
  }

  let parsedState;
  try {
    parsedState = JSON.parse(state);
  } catch {
    return res.redirect("/dashboard?youtube_error=invalid_state");
  }

  const { clientId, userEmail } = parsedState;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/youtube/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return res.redirect("/dashboard?youtube_error=no_token");
    }

    // Get channel info
    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      return res.redirect("/dashboard?youtube_error=no_channel");
    }

    const ytData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      channelId: channel.id,
      channelName: channel.snippet.title,
      channelThumb: channel.snippet.thumbnails?.default?.url,
      subscriberCount: channel.statistics.subscriberCount,
      connectedAt: new Date().toISOString(),
    };

    // Store in KV
    const { kv } = await import("@vercel/kv");
    await kv.set(`yt:${userEmail}:${clientId}`, JSON.stringify(ytData));

    return res.redirect(`/dashboard?youtube_connected=${clientId}&channel=${encodeURIComponent(channel.snippet.title)}`);
  } catch (err) {
    console.error("YouTube callback error:", err);
    return res.redirect(`/dashboard?youtube_error=${encodeURIComponent(err.message)}`);
  }
}
