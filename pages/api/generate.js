const SYSTEM_PROMPT = `You are an expert YouTube Shorts metadata specialist for a Shorts management agency. Given a video transcript and client profile, generate a complete high-performing metadata package. Return ONLY valid JSON, no markdown, no backticks, no explanation. Use exactly this structure:
{"clipRating":"FIRE","clipAnalysis":"2 sentence analysis of why this clip will or won't perform","hook":"Perfect opening hook line for the first 3 seconds","titles":["Title 1","Title 2","Title 3","Title 4","Title 5"],"description":"Full 150-200 word YouTube description optimized for search with call to action","hashtags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"],"bestMoment":"The single most powerful 15-second moment to highlight in editing","postingTip":"One specific tactical tip for maximizing this clip's performance"}
clipRating must be exactly one of: FIRE, GOOD, or WEAK`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transcript, client } = req.body;

  if (!transcript || !client) {
    return res.status(400).json({ error: "Missing transcript or client" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in environment variables" });
  }

  const fullPrompt = `${SYSTEM_PROMPT}

CLIENT PROFILE:
Name: ${client.name}
Niche: ${client.niche}
Tone: ${client.tone}${client.notes ? `\nNotes: ${client.notes}` : ""}

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
        max_tokens: 1000,
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
