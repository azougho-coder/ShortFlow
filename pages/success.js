import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const [counting, setCounting] = useState(5);

  useEffect(() => {
    if (counting === 0) {
      router.push("/dashboard");
      return;
    }
    const timer = setTimeout(() => setCounting((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [counting, router]);

  return (
    <>
      <Head>
        <title>Welcome to ShortFlow</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "#080B14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", color: "#F0F4FF" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>You're in.</div>
          <div style={{ fontSize: 16, color: "#6B7FA3", marginBottom: 32, lineHeight: 1.6 }}>
            Payment confirmed. Welcome to ShortFlow.<br />
            Redirecting to your dashboard in {counting} seconds.
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ padding: "12px 28px", background: "#4F6EF7", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    </>
  );
}
