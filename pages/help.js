import Head from "next/head";
import { useRouter } from "next/router";

const SECTIONS = [
  {
    heading: "Generate",
    items: [
      {
        img: "/screenshots/generate.png",
        caption: "Describe what your video is about, or paste a transcript — pick a channel, hit Generate. You'll get a full package: titles, hooks, description, tags, in seconds.",
      },
    ],
  },
  {
    heading: "Performance",
    items: [
      {
        img: "/screenshots/performance-1.png",
        caption: "Click \"Connect YouTube Channel\" to link your own channel or a client's. This way, the AI constantly learns from your real performance data — views, likes, comments — and uses it to generate smarter packages over time.",
      },
      {
        img: "/screenshots/performance-2.png",
        caption: "You'll see this warning from Google — that's normal. ShortFlow is still going through official verification, which takes a few weeks for new apps. Click Advanced, then \"Go to ShortFlow\" to continue.",
      },
      {
        img: "/screenshots/performance-3.png",
        caption: "Once connected, you'll see the channel's stats and recent Shorts right here — your own or a client's. This isn't just another analytics dashboard — the AI is actively learning from this data to improve every package it generates for you.",
      },
    ],
  },
  {
    heading: "Post",
    items: [
      {
        img: "/screenshots/post.png",
        caption: "Pick your favorite title, review the description and tags, upload your video file, and post directly to your channel — no need to leave the dashboard.",
      },
    ],
  },
  {
    heading: "Clients",
    items: [
      {
        img: "/screenshots/clients.png",
        caption: "Add your own channel or any client's once, with their niche and tone. ShortFlow remembers it every time you generate a package.",
      },
    ],
  },
  {
    heading: "Insights",
    items: [
      {
        img: "/screenshots/insights.png",
        caption: "Click a question and get a real answer based on that channel's actual YouTube data — yours or a client's — what's working, what's not, and what to try next.",
      },
    ],
  },
];

export default function Help() {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>How It Works — ShortFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#000;font-family:'Inter',system-ui,sans-serif;color:#fff}
        .disp{font-family:'Space Grotesk',sans-serif}
        a{color:#3EFFA0;text-decoration:none}
        img{max-width:100%;display:block;border-radius:8px;border:1px solid #1A1A1A}
        @media(max-width:768px){
          .hp{padding:60px 20px 60px!important}
        }
      `}</style>

      <nav style={{ borderBottom: "1px solid #161616", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" className="disp" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", color: "#fff" }}>
          Short<span style={{ color: "#3EFFA0" }}>Flow</span>
        </a>
        <button onClick={() => router.push("/dashboard")} style={{ background: "#3EFFA0", color: "#000", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Go to Dashboard
        </button>
      </nav>

      <div className="hp" style={{ maxWidth: 680, margin: "0 auto", padding: "80px 40px 100px" }}>
        <h1 className="disp" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 12 }}>How ShortFlow Works</h1>
        <p style={{ fontSize: 15, color: "#999", marginBottom: 48, lineHeight: 1.6 }}>
          A quick walkthrough of every part of the dashboard — your own channel or a client's.
        </p>

        {SECTIONS.map((section) => (
          <div key={section.heading} style={{ marginBottom: 56 }}>
            <h2 className="disp" style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#3EFFA0" }}>{section.heading}</h2>
            {section.items.map((item, i) => (
              <div key={i} style={{ marginBottom: i < section.items.length - 1 ? 32 : 0 }}>
                <img src={item.img} alt={`${section.heading} screenshot ${i + 1}`} style={{ marginBottom: 14 }} />
                <div style={{ fontSize: 14, color: "#bbb", lineHeight: 1.7 }}>{item.caption}</div>
              </div>
            ))}
          </div>
        ))}

        <div style={{ background: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: 8, padding: 24, marginTop: 40, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#999", marginBottom: 14 }}>Still stuck or have a question?</div>
          <a href="mailto:support@shortflow.net" style={{ fontSize: 14, fontWeight: 600 }}>Contact support →</a>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #161616", padding: "24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#555" }}>
          Short<span style={{ color: "#3EFFA0" }}>Flow</span> — <a href="/" style={{ color: "#555" }}>Home</a> · <a href="/privacy" style={{ color: "#555" }}>Privacy</a> · <a href="/terms" style={{ color: "#555" }}>Terms</a>
        </div>
      </footer>
    </>
  );
}
