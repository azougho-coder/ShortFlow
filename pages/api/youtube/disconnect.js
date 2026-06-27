import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { clientId } = req.body;
  if (!clientId) return res.status(400).json({ error: "Missing clientId" });

  try {
    const { kv } = await import("@vercel/kv");
    await kv.del(`yt:${session.user.email}:${clientId}`);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
