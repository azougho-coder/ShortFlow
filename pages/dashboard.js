import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";

const RATING = {
  FIRE: { color: "#F59E0B", bg: "#1C1200", label: "🔥 FIRE" },
  GOOD: { color: "#10B981", bg: "#021A0D", label: "✅ GOOD" },
  WEAK: { color: "#EF4444", bg: "#1A0505", label: "⚠️ WEAK" },
};

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function CopyBtn({ text, id, copied, onCopy }) {
  const done = copied === id;
  return (
    <button onClick={() => onCopy(text, id)} style={{ background: done ? "#071A12" : "#111827", border: `1px solid ${done ? "#10B981" : "#1A2340"}`, borderRadius: 6, padding: "4px 10px", color: done ? "#10B981" : "#6B7FA3", fontSize: 11, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
      {done ? "Copied!" : "Copy"}
    </button>
  );
}

function Card({ title, action, children }) {
  return (
    <div style={{ background: "#0A0E1A", border: "1px solid #1A2340", borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#3A4F70", textTransform: "uppercase", letterSpacing: "1px" }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function OutputCards({ output, copied, onCopy }) {
  const rating = RATING[output.clipRating] || RATING.GOOD;
  return (
    <div>
      {output.performanceInsight && (
        <div style={{ background: "#071A0D", border: "1px solid #1C3A1C", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>📈 AI Learned From Your Channel</div>
          <div style={{ fontSize: 13, color: "#8B9DC0", lineHeight: 1.5 }}>{output.performanceInsight}</div>
        </div>
      )}
      <Card title="Clip Rating" action={<div style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: rating.color, background: rating.bg }}>{rating.label}</div>}>
        <div style={{ fontSize: 13, color: "#C8D4F0", lineHeight: 1.6 }}>{output.clipAnalysis}</div>
      </Card>
      <Card title="Opening Hook — First 3 Seconds" action={<CopyBtn text={output.hook} id="hook" copied={copied} onCopy={onCopy} />}>
        <div style={{ fontSize: 14, color: "#C8D4F0", lineHeight: 1.5, fontStyle: "italic" }}>"{output.hook}"</div>
      </Card>
      <Card title="Title Options" action={<CopyBtn text={(output.titles || []).join("\n")} id="titles" copied={copied} onCopy={onCopy} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {(output.titles || []).map((t, i) => (
            <div key={i} onClick={() => onCopy(t, `t${i}`)} style={{ display: "flex", gap: 10, padding: "9px 12px", background: "#0D1525", borderRadius: 8, border: `1px solid ${copied === `t${i}` ? "#4F6EF7" : "#1A2340"}`, cursor: "pointer", transition: "border-color 0.15s", alignItems: "flex-start" }}>
              <div style={{ fontSize: 10, color: "#3A4F70", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>0{i + 1}</div>
              <div style={{ fontSize: 13, color: "#C8D4F0", lineHeight: 1.4 }}>{t}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Description" action={<CopyBtn text={output.description} id="desc" copied={copied} onCopy={onCopy} />}>
        <div style={{ fontSize: 13, color: "#8B9DC0", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 130, overflowY: "auto" }}>{output.description}</div>
      </Card>
      <Card title="Hashtags" action={<CopyBtn text={(output.hashtags || []).map(h => `#${h.replace(/^#/, "")}`).join(" ")} id="tags" copied={copied} onCopy={onCopy} />}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(output.hashtags || []).map((tag, i) => (
            <div key={i} style={{ background: "#0D1525", border: "1px solid #1E2A45", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "#4F6EF7" }}>#{tag.replace(/^#/, "")}</div>
          ))}
        </div>
      </Card>
      {output.bestMoment && (
        <Card title="Best Moment to Highlight">
          <div style={{ fontSize: 13, color: "#8B9DC0", lineHeight: 1.5 }}>{output.bestMoment}</div>
        </Card>
      )}
      {output.postingTip && (
        <div style={{ background: "#0A0E1A", border: "1px solid #1E2A5E", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#4F6EF7", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>💡 Posting Tip</div>
          <div style={{ fontSize: 13, color: "#8B9DC0", lineHeight: 1.5 }}>{output.postingTip}</div>
        </div>
      )}

    </div>
  );
}

const DEFAULT_CLIENTS = [
  { id: 1, name: "Demo Client", niche: "Finance & Entrepreneurship", tone: "Motivational, punchy, direct", notes: "Replace with your real client" },
];

function AuthGate({ children, subscription }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#080B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", color: "#3A4F70" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", background: "#080B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif", color: "#F0F4FF" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 400 }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8 }}>
            Short<span style={{ color: "#4F6EF7" }}>Flow</span>
          </div>
          <div style={{ fontSize: 14, color: "#6B7FA3", marginBottom: 32, lineHeight: 1.6 }}>
            Sign in with Google to access your Shorts Manager dashboard.
          </div>
          <button
            onClick={() => signIn("google")}
            style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", color: "#1a1a1a", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", margin: "0 auto" }}
          >
            <img src="https://www.google.com/favicon.ico" width={18} height={18} alt="Google" />
            Sign in with Google
          </button>
          <div style={{ marginTop: 24, fontSize: 13, color: "#3A4F70" }}>
            Don't have an account? <a href="/#pricing" style={{ color: "#4F6EF7", textDecoration: "none" }}>Get started →</a>
          </div>
        </div>
      </div>
    );
  }

  if (subscription === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#080B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif", color: "#F0F4FF" }}>
        <div style={{ textAlign: "center", padding: 40, maxWidth: 400 }}>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8 }}>
            Short<span style={{ color: "#4F6EF7" }}>Flow</span>
          </div>
          <div style={{ fontSize: 14, color: "#6B7FA3", marginBottom: 8, lineHeight: 1.6 }}>
            Signed in as <strong style={{ color: "#F0F4FF" }}>{session.user.email}</strong>
          </div>
          <div style={{ fontSize: 14, color: "#6B7FA3", marginBottom: 32, lineHeight: 1.6 }}>
            No active subscription found. Choose a plan to get access.
          </div>
          <a href="/#pricing">
            <button style={{ background: "#4F6EF7", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 16 }}>
              View Plans →
            </button>
          </a>
          <div>
            <button onClick={() => signOut()} style={{ background: "none", border: "none", color: "#3A4F70", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState(undefined);
  const [clients, setClients] = useState(DEFAULT_CLIENTS);
  const [selectedId, setSelectedId] = useState(1);
  const [transcript, setTranscript] = useState("");
  const [output, setOutput] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("generate");
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", niche: "", tone: "", notes: "" });
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(null);
  const [historyDetail, setHistoryDetail] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [ytStats, setYtStats] = useState(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [privacyStatus, setPrivacyStatus] = useState("public");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [postError, setPostError] = useState(null);
  const [needsReconnect, setNeedsReconnect] = useState(false);

  // Check for YouTube connection callback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("youtube_connected");
    const ytErr = params.get("youtube_error");
    if (connected) {
      window.history.replaceState({}, "", "/dashboard");
      setView("performance");
    }
    if (ytErr) {
      window.history.replaceState({}, "", "/dashboard");
      setYtError(decodeURIComponent(ytErr));
      setView("performance");
    }
  }, []);

  // Auto-load YouTube stats when performance tab is opened
  useEffect(() => {
    if (view === "performance" && !ytStats && !ytLoading && selectedId) {
      loadYtStats(selectedId);
    }
  }, [view, selectedId]);

  // Check subscription when session is available
  useEffect(() => {
    if (session) {
      fetch("/api/check-subscription")
        .then(r => r.json())
        .then(data => {
          if (data.hasAccess) {
            setSubscription(data);
          } else {
            setSubscription(null);
          }
        })
        .catch(() => setSubscription(null));
    }
  }, [session]);

  // localStorage persistence
  useEffect(() => {
    setMounted(true);
    try {
      const savedClients = localStorage.getItem("shortflow-clients");
      if (savedClients) setClients(JSON.parse(savedClients));
      const savedHistory = localStorage.getItem("shortflow-history");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("shortflow-clients", JSON.stringify(clients)); } catch (e) {}
  }, [clients, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem("shortflow-history", JSON.stringify(history)); } catch (e) {}
  }, [history, mounted]);

  const maxClients = subscription?.maxClients || 2;
  const planName = subscription?.plan || "starter";
  const client = clients.find((c) => c.id === selectedId);

  const loadYtStats = async (cId) => {
    setYtLoading(true);
    setYtError(null);
    try {
      const res = await fetch(`/api/youtube/stats?clientId=${cId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setYtStats(data);
    } catch (err) {
      setYtError(err.message);
      setYtStats(null);
    } finally {
      setYtLoading(false);
    }
  };

  const handleConnectYoutube = (clientId) => {
    window.location.href = `/api/youtube/connect?clientId=${clientId}`;
  };

  const uploadToYoutube = async () => {
    if (!videoFile || !output) return;
    setUploading(true);
    setUploadProgress(0);
    setPostError(null);
    setUploadedUrl(null);
    setNeedsReconnect(false);

    try {
      const titleToUse = output.titles?.[selectedTitleIndex] || output.titles?.[0] || "New Short";
      const tags = (output.hashtags || []).map(h => h.replace(/^#/, ""));

      // Step 1: Get resumable upload URL from our backend
      const urlRes = await fetch("/api/youtube/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedId,
          title: titleToUse,
          description: output.description || "",
          tags,
          privacyStatus,
          fileType: videoFile.type,
        }),
      });

      const urlData = await urlRes.json();

      if (!urlRes.ok) {
        if (urlData.needsReconnect) setNeedsReconnect(true);
        throw new Error(urlData.error);
      }

      // Step 2: Upload video directly to YouTube
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", urlData.uploadUrl);
        xhr.setRequestHeader("Content-Type", videoFile.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              setUploadedUrl(`https://youtube.com/shorts/${response.id}`);
              resolve();
            } catch {
              resolve();
            }
          } else {
            reject(new Error("Upload failed with status " + xhr.status));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(videoFile);
      });

    } catch (err) {
      setPostError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDisconnectYoutube = async (clientId) => {
    await fetch("/api/youtube/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
    setYtStats(null);
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) { setError("Paste a transcript first."); return; }
    if (!client) { setError("Select a client."); return; }
    setGenerating(true); setError(null); setOutput(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, client, userEmail: session?.user?.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setOutput(data);
      setVideoFile(null);
      setUploadedUrl(null);
      setPostError(null);
      setSelectedTitleIndex(0);
      setHistory((prev) => [{
        id: Date.now(),
        clientId: selectedId,
        clientName: client.name,
        preview: transcript.slice(0, 110) + (transcript.length > 110 ? "..." : ""),
        output: data,
        time: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      }, ...prev]);
    } catch (err) {
      setError("Error: " + (err.message || "Unknown error"));
    } finally {
      setGenerating(false);
    }
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text || "").catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const addClient = () => {
    if (!newClient.name.trim() || !newClient.niche.trim()) return;
    if (clients.length >= maxClients) return;
    const c = { ...newClient, id: Date.now() };
    setClients((p) => [...p, c]);
    setSelectedId(c.id);
    setNewClient({ name: "", niche: "", tone: "", notes: "" });
    setShowModal(false);
    setView("generate");
  };

  const deleteClient = (id) => {
    if (clients.length === 1) return;
    setClients((p) => p.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(clients.find(c => c.id !== id)?.id);
  };

  const shown = historyDetail ? historyDetail.output : output;
  const atLimit = clients.length >= maxClients;

  const avatar = (name) => (
    <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1E2A5E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#4F6EF7", flexShrink: 0 }}>
      {initials(name)}
    </div>
  );

  const planBadgeColor = { starter: "#6B7FA3", pro: "#4F6EF7", agency: "#F59E0B" };

  return (
    <>
      <Head>
        <title>ShortFlow — Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <AuthGate subscription={subscription}>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          html,body{height:100%;background:#080B14}
          ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1E2A45;border-radius:2px}
          @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
          .gp{animation:pulse 1.4s ease-in-out infinite}
          .nb{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;color:#6B7FA3;font-size:14px;font-weight:500;border:none;background:none;width:100%;text-align:left;font-family:inherit;transition:all .15s}
          .nb:hover{background:#111827;color:#F0F4FF}.nb.a{background:#1a2540;color:#F0F4FF}
          .ci{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;color:#6B7FA3;font-size:13px;transition:all .15s;white-space:nowrap;overflow:hidden}
          .ci:hover{background:#111827;color:#F0F4FF}.ci.s{background:#1a2540;color:#F0F4FF}
          .fi{width:100%;background:#080B14;border:1px solid #1A2340;border-radius:8px;padding:10px 14px;color:#F0F4FF;font-size:14px;outline:none;font-family:inherit;transition:border-color .15s}
          .fi:focus{border-color:#4F6EF7}.fi::placeholder{color:#3A4F70}
          .gb{width:100%;padding:13px;border-radius:10px;border:none;background:#4F6EF7;color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
          .gb:hover:not(:disabled){background:#3D5CE5;transform:translateY(-1px)}.gb:disabled{opacity:.5;cursor:not-allowed;transform:none}
          .hi{background:#0A0E1A;border:1px solid #1A2340;border-radius:12px;padding:16px;cursor:pointer;transition:border-color .15s;margin-bottom:12px}
          .hi:hover{border-color:#4F6EF7}
          .cc{background:#0A0E1A;border:1px solid #1A2340;border-radius:12px;padding:20px;cursor:pointer;transition:border-color .15s}
          .cc:hover{border-color:#4F6EF7}
          .ab{margin:12px;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:8px;border:1px dashed #1E2A45;background:none;color:#6B7FA3;font-size:13px;cursor:pointer;width:calc(100% - 24px);font-family:inherit;transition:all .15s}
          .ab:hover:not(:disabled){border-color:#4F6EF7;color:#4F6EF7;background:#0D1428}
          .ab:disabled{opacity:.4;cursor:not-allowed}
          @media(max-width:768px){
            .sidebar-hide{display:none!important}
            .content-col{flex-direction:column!important;padding:16px!important}
            .output-col{width:100%!important;min-width:0!important}
            .bottom-nav{display:flex!important}
            .header-pad{padding:0 16px!important}
          }
          .bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:#0A0E1A;border-top:1px solid #1A2340;z-index:50}
          .bnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 0;border:none;background:none;color:#6B7FA3;font-size:10px;gap:4px;cursor:pointer;font-family:inherit}
          .bnav-btn.a{color:#4F6EF7}
          .bnav-icon{font-size:18px}
        `}</style>

        <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#080B14", color: "#F0F4FF", overflow: "hidden" }}>

          {/* SIDEBAR */}
          <div className="sidebar-hide" style={{ width: 230, minWidth: 230, background: "#0A0E1A", borderRight: "1px solid #1A2340", display: "flex", flexDirection: "column", padding: "20px 0" }}>
            <div style={{ padding: "0 20px 24px" }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px" }}>Short<span style={{ color: "#4F6EF7" }}>Flow</span></div>
              <div style={{ fontSize: 11, color: "#3A4F70", marginTop: 3 }}>Shorts Manager</div>
            </div>

            <div style={{ padding: "0 12px", marginBottom: 24 }}>
              {[["generate", "⚡", "Generate"], ["clients", "👥", "Clients"], ["history", "📋", "History"], ["performance", "📈", "Performance"]].map(([id, icon, label]) => (
                <button key={id} className={`nb ${view === id ? "a" : ""}`} onClick={() => { setView(id); setHistoryDetail(null); }}>
                  <span style={{ width: 18, textAlign: "center" }}>{icon}</span>{label}
                </button>
              ))}
            </div>

            <div style={{ padding: "0 20px", fontSize: 10, fontWeight: 700, color: "#3A4F70", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 8 }}>
              Clients ({clients.length}/{maxClients === 999 ? "∞" : maxClients})
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
              {clients.map((c) => (
                <div key={c.id} className={`ci ${selectedId === c.id ? "s" : ""}`} onClick={() => { setSelectedId(c.id); setView("generate"); setHistoryDetail(null); setOutput(null); }}>
                  {avatar(c.name)}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{c.name}</span>
                </div>
              ))}
            </div>

            {atLimit && maxClients < 999 && (
              <div style={{ margin: "8px 12px 0", padding: "8px 12px", background: "#0D1525", border: "1px solid #1E2A5E", borderRadius: 8, fontSize: 11, color: "#4F6EF7", textAlign: "center" }}>
                <a href="/#pricing" style={{ color: "#4F6EF7", textDecoration: "none" }}>Upgrade to add more clients →</a>
              </div>
            )}

            <button className="ab" onClick={() => setShowModal(true)} disabled={atLimit}>
              <span>＋</span> Add Client
            </button>

            {/* User info */}
            {session && (
              <div style={{ margin: "8px 12px 0", padding: "10px 12px", borderTop: "1px solid #1A2340", display: "flex", alignItems: "center", gap: 8 }}>
                {session.user.image && <img src={session.user.image} width={24} height={24} style={{ borderRadius: "50%" }} alt="" />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#F0F4FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.user.name}</div>
                  <div style={{ fontSize: 10, color: planBadgeColor[planName], textTransform: "uppercase", fontWeight: 700 }}>{planName}</div>
                </div>
                <button onClick={() => signOut()} style={{ background: "none", border: "none", color: "#3A4F70", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Out</button>
              </div>
            )}
          </div>

          {/* MAIN */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className="header-pad" style={{ padding: "0 28px", borderBottom: "1px solid #1A2340", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, flexShrink: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {view === "generate" && "Generate Package"}
                {view === "clients" && "All Clients"}
                {view === "history" && (historyDetail ? "Past Result" : "History")}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {view === "generate" && client && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0F1629", border: "1px solid #1E2A45", padding: "6px 14px", borderRadius: 20, fontSize: 13, color: "#6B7FA3" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />{client.name}
                  </div>
                )}
                {historyDetail && (
                  <button onClick={() => setHistoryDetail(null)} style={{ background: "#111827", border: "1px solid #1A2340", borderRadius: 6, padding: "5px 12px", color: "#6B7FA3", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                )}
              </div>
            </div>

            <div className="content-col" style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", gap: 24, paddingBottom: 80 }}>

              {/* GENERATE */}
              {view === "generate" && (
                <>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#3A4F70", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Client</div>
                      <select className="fi" value={selectedId} onChange={(e) => setSelectedId(Number(e.target.value))} style={{ cursor: "pointer" }}>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#3A4F70", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Transcript</div>
                      <textarea className="fi" style={{ width: "100%", minHeight: 220, resize: "vertical", lineHeight: 1.65 }} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste the clip transcript here..." />
                    </div>
                    {error && <div style={{ background: "#1F0A0A", border: "1px solid #4A1515", borderRadius: 8, padding: "11px 16px", color: "#EF4444", fontSize: 13 }}>{error}</div>}
                    <button className="gb" onClick={handleGenerate} disabled={generating}>
                      {generating ? <span className="gp">Generating package...</span> : "⚡  Generate Full Package"}
                    </button>
                    {client && (
                      <div style={{ background: "#0A0E1A", border: "1px solid #1A2340", borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#3A4F70", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Client Profile</div>
                        {[["Niche", client.niche], ["Tone", client.tone], client.notes ? ["Notes", client.notes] : null].filter(Boolean).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", gap: 12, marginBottom: 6, fontSize: 13 }}>
                            <span style={{ color: "#3A4F70", minWidth: 44, flexShrink: 0 }}>{k}</span>
                            <span style={{ color: "#8B9DC0" }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="output-col" style={{ width: 370, minWidth: 370, overflowY: "auto" }}>
                    {!shown && !generating && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#3A4F70", textAlign: "center", gap: 12 }}>
                        <div style={{ fontSize: 38, opacity: 0.35 }}>📦</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>No package yet</div>
                        <div style={{ fontSize: 13, maxWidth: 210, lineHeight: 1.5, opacity: 0.7 }}>Paste a transcript and hit generate</div>
                      </div>
                    )}
                    {generating && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#3A4F70", textAlign: "center", gap: 12 }}>
                        <div className="gp" style={{ fontSize: 38 }}>⚡</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#4F6EF7" }}>Generating...</div>
                      </div>
                    )}
                    {shown && !generating && <OutputCards output={shown} copied={copied} onCopy={copy} />}
                  </div>
                </>
              )}

              {/* CLIENTS */}
              {view === "clients" && (
                <div style={{ flex: 1 }}>
                  {atLimit && maxClients < 999 && (
                    <div style={{ background: "#0D1525", border: "1px solid #1E2A5E", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#4F6EF7" }}>
                      You've reached your {maxClients}-client limit. <a href="/#pricing" style={{ color: "#F59E0B", textDecoration: "none" }}>Upgrade your plan →</a>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
                    {clients.map((c) => (
                      <div key={c.id} className="cc" onClick={() => { setSelectedId(c.id); setView("generate"); }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: "#1E2A5E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#4F6EF7", flexShrink: 0 }}>{initials(c.name)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "#6B7FA3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.niche}</div>
                          </div>
                          {clients.length > 1 && (
                            <button onClick={(e) => { e.stopPropagation(); if(window.confirm("Remove " + c.name + "?")) deleteClient(c.id); }} style={{ background: "#1F0A0A", border: "1px solid #4A1515", borderRadius: 6, color: "#EF4444", cursor: "pointer", fontSize: 12, padding: "3px 8px", fontFamily: "inherit" }}>Remove</button>
                          )}
                        </div>
                        <div style={{ background: "#0D1525", border: "1px solid #1E2A45", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#4F6EF7", display: "inline-block" }}>{c.tone.split(",")[0].trim()}</div>
                      </div>
                    ))}
                    {!atLimit && (
                      <div style={{ background: "#0A0E1A", border: "1px dashed #1E2A45", borderRadius: 12, padding: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#3A4F70", gap: 8, flexDirection: "column", minHeight: 110 }} onClick={() => setShowModal(true)}>
                        <div style={{ fontSize: 22 }}>＋</div>
                        <div style={{ fontSize: 13 }}>Add New Client</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* HISTORY */}
              {view === "history" && !historyDetail && (
                <div style={{ flex: 1, maxWidth: 680 }}>
                  {history.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 240, color: "#3A4F70", textAlign: "center", gap: 12 }}>
                      <div style={{ fontSize: 36, opacity: 0.35 }}>📋</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>No history yet</div>
                      <div style={{ fontSize: 13, opacity: 0.7 }}>Generated packages will appear here</div>
                    </div>
                  ) : history.map((h) => (
                    <div key={h.id} className="hi" onClick={() => setHistoryDetail(h)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        {avatar(h.clientName)}
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{h.clientName}</span>
                        <span style={{ fontSize: 12, color: "#3A4F70" }}>· {h.time}</span>
                        {h.output.clipRating && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: RATING[h.output.clipRating]?.color }}>{RATING[h.output.clipRating]?.label}</span>}
                      </div>
                      <div style={{ fontSize: 13, color: "#6B7FA3", lineHeight: 1.4, marginBottom: h.output.titles?.[0] ? 8 : 0 }}>{h.preview}</div>
                      {h.output.titles?.[0] && <div style={{ fontSize: 14, color: "#C8D4F0", fontWeight: 500 }}>{h.output.titles[0]}</div>}
                    </div>
                  ))}
                </div>
              )}

              {view === "history" && historyDetail && (
                <div style={{ width: "100%", maxWidth: 480 }}>
                  <OutputCards output={historyDetail.output} copied={copied} onCopy={copy} />
                </div>
              )}

              {/* PERFORMANCE VIEW */}
              {view === "performance" && planName === "starter" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#3A4F70", textAlign: "center", gap: 12 }}>
                  <div style={{ fontSize: 38, opacity: 0.35 }}>🔒</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#F0F4FF" }}>Pro Feature</div>
                  <div style={{ fontSize: 13, maxWidth: 260, lineHeight: 1.5 }}>YouTube performance reports are available on the Pro plan. Upgrade to connect channels and track what's working.</div>
                  <a href="/#pricing" style={{ marginTop: 8 }}>
                    <button style={{ padding: "10px 24px", background: "#4F6EF7", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Upgrade to Pro →
                    </button>
                  </a>
                </div>
              )}
              {view === "performance" && planName !== "starter" && (
                <div style={{ flex: 1, maxWidth: 800 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <select className="fi" style={{ maxWidth: 240, cursor: "pointer" }} value={selectedId} onChange={(e) => { setSelectedId(Number(e.target.value)); setYtStats(null); }}>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {!ytStats && (
                      <button
                        onClick={() => handleConnectYoutube(selectedId)}
                        style={{ padding: "10px 20px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}
                      >
                        🎬 Connect YouTube Channel
                      </button>
                    )}
                    {ytStats && (
                      <button onClick={() => loadYtStats(selectedId)} style={{ padding: "8px 16px", background: "#111827", border: "1px solid #1A2340", color: "#6B7FA3", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                        ↻ Refresh
                      </button>
                    )}
                    {ytStats && (
                      <button onClick={() => handleDisconnectYoutube(selectedId)} style={{ padding: "8px 16px", background: "none", border: "1px solid #4A1515", color: "#EF4444", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                        Disconnect
                      </button>
                    )}
                  </div>

                  {!ytStats && !ytLoading && !ytError && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#3A4F70", textAlign: "center", gap: 12 }}>
                      <div style={{ fontSize: 38, opacity: 0.35 }}>📈</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>No data loaded yet</div>
                      <div style={{ fontSize: 13, maxWidth: 260, lineHeight: 1.5, opacity: 0.7 }}>If you already connected a channel, click Load Stats. Otherwise connect your client's YouTube channel first.</div>
                      <button onClick={() => loadYtStats(selectedId)} style={{ marginTop: 8, padding: "10px 24px", background: "#4F6EF7", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        ↻ Load Stats
                      </button>
                      <button onClick={() => handleConnectYoutube(selectedId)} style={{ padding: "10px 24px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        🎬 Connect YouTube Channel
                      </button>
                    </div>
                  )}

                  {ytLoading && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, color: "#3A4F70", gap: 12 }}>
                      <div className="gp" style={{ fontSize: 32 }}>📈</div>
                      <div style={{ fontSize: 14 }}>Loading performance data...</div>
                    </div>
                  )}

                  {ytError && (
                    <div style={{ background: "#1F0A0A", border: "1px solid #4A1515", borderRadius: 10, padding: 16, color: "#EF4444", fontSize: 13, marginBottom: 16 }}>
                      {ytError === "YouTube not connected for this client" ? (
                        <span>This client's YouTube channel isn't connected yet. Click the button above to connect it.</span>
                      ) : (
                        <span>Error: {ytError}</span>
                      )}
                    </div>
                  )}

                  {ytStats && (
                    <>
                      {/* Channel header */}
                      <div style={{ background: "#0A0E1A", border: "1px solid #1A2340", borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
                        {ytStats.channel.thumb && <img src={ytStats.channel.thumb} width={48} height={48} style={{ borderRadius: "50%" }} alt="" />}
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>{ytStats.channel.name}</div>
                          <div style={{ fontSize: 13, color: "#6B7FA3", marginTop: 2 }}>{Number(ytStats.channel.subscribers).toLocaleString()} subscribers</div>
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: 11, color: "#3A4F70" }}>
                          {ytStats.videos.length} recent Shorts
                        </div>
                      </div>

                      {/* Top performer highlight */}
                      {ytStats.videos.length > 0 && (
                        <div style={{ background: "#0D1525", border: "1px solid #1E2A5E", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#4F6EF7", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>🏆 Top Performer</div>
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            {ytStats.videos[0].thumbnail && <img src={ytStats.videos[0].thumbnail} width={80} style={{ borderRadius: 6, flexShrink: 0 }} alt="" />}
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#C8D4F0", marginBottom: 6, lineHeight: 1.3 }}>{ytStats.videos[0].title}</div>
                              <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                                <span style={{ color: "#F59E0B" }}>👁 {Number(ytStats.videos[0].views).toLocaleString()} views</span>
                                <span style={{ color: "#10B981" }}>👍 {Number(ytStats.videos[0].likes).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Video list */}
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#3A4F70", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>All Recent Shorts</div>
                      {ytStats.videos.map((v, i) => (
                        <div key={v.id} style={{ background: "#0A0E1A", border: "1px solid #1A2340", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ fontSize: 12, color: "#3A4F70", fontWeight: 700, width: 20, flexShrink: 0 }}>#{i+1}</div>
                          {v.thumbnail && <img src={v.thumbnail} width={50} style={{ borderRadius: 5, flexShrink: 0 }} alt="" />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: "#C8D4F0", lineHeight: 1.3, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</div>
                            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6B7FA3" }}>
                              <span>👁 {Number(v.views).toLocaleString()}</span>
                              <span>👍 {Number(v.likes).toLocaleString()}</span>
                              <span>💬 {Number(v.comments).toLocaleString()}</span>
                            </div>
                          </div>
                          <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ color: "#4F6EF7", fontSize: 11, textDecoration: "none", flexShrink: 0 }}>View →</a>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM NAV mobile */}
          <div className="bottom-nav">
            {[["generate", "⚡", "Generate"], ["clients", "👥", "Clients"], ["history", "📋", "History"]].map(([id, icon, label]) => (
              <button key={id} className={`bnav-btn ${view === id ? "a" : ""}`} onClick={() => { setView(id); setHistoryDetail(null); }}>
                <span className="bnav-icon">{icon}</span>{label}
              </button>
            ))}
          </div>

          {/* ADD CLIENT MODAL */}
          {showModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
              <div style={{ background: "#0F1629", border: "1px solid #1E2A45", borderRadius: 16, padding: 28, width: 440, maxWidth: "90vw" }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add New Client</div>
                {[
                  { k: "name", l: "Client Name *", p: "e.g. The Diary of a CEO" },
                  { k: "niche", l: "Niche *", p: "e.g. Business & Self-improvement" },
                  { k: "tone", l: "Tone & Style", p: "e.g. Storytelling, emotional, thought-provoking" },
                  { k: "notes", l: "Notes", p: "e.g. Audience 25-40, responds well to vulnerability" },
                ].map(({ k, l, p }) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7FA3", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div>
                    <input className="fi" placeholder={p} value={newClient[k]} onChange={(e) => setNewClient((prev) => ({ ...prev, [k]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #1E2A45", background: "none", color: "#6B7FA3", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  <button onClick={addClient} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "#4F6EF7", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Add Client</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AuthGate>
    </>
  );
}
