import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

async function getAccessToken(userEmail, clientId) {
  const { kv } = await import("@vercel/kv");
  const raw = await kv.get(`yt:${userEmail}:${clientId}`);
  if (!raw) return null;

  const ytData = typeof raw === "string" ? JSON.parse(raw) : raw;
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

  return accessToken;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { clientId, title, description, tags, privacyStatus, fileType } = req.body;

  if (!clientId || !title) {
    return res.status(400).json({ error: "Missing clientId or title" });
  }

  try {
    const accessToken = await getAccessToken(session.user.email, clientId);

    if (!accessToken) {
      return res.status(404).json({ error: "YouTube not connected for this client. Please connect your YouTube channel first." });
    }

    // Initiate resumable upload session
    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": fileType || "video/mp4",
        },
        body: JSON.stringify({
          snippet: {
            title: title.slice(0, 100),
            description: description || "",
            tags: (tags || []).map(t => t.replace(/^#/, "")).slice(0, 15),
            categoryId: "25",
            defaultLanguage: "en",
          },
          status: {
            privacyStatus: privacyStatus || "public",
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );

    if (!uploadRes.ok) {
      const errData = await uploadRes.json();
      const errMsg = errData?.error?.message || `YouTube API error ${uploadRes.status}`;

      // Check if it's a scope/permission error
      if (uploadRes.status === 401 || uploadRes.status === 403) {
        return res.status(403).json({
          error: "Missing upload permission. Please reconnect your YouTube channel to enable posting.",
          needsReconnect: true,
        });
      }

      return res.status(uploadRes.status).json({ error: errMsg });
    }

    const uploadUrl = uploadRes.headers.get("location");
    if (!uploadUrl) {
      return res.status(500).json({ error: "YouTube did not return an upload URL" });
    }

    return res.status(200).json({ uploadUrl });
  } catch (err) {
    console.error("Upload URL error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
