import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: "Missing clientId" });

  // Request both read and upload scopes
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/youtube/callback`,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent",
    state: JSON.stringify({ clientId, userEmail: session.user.email }),
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.redirect(authUrl);
}
