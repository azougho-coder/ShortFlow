import Head from "next/head";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — ShortFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#080B14;font-family:'Inter',system-ui,sans-serif;color:#F0F4FF}
        a{color:#4F6EF7;text-decoration:none}
        a:hover{text-decoration:underline}
      `}</style>

      <nav style={{ borderBottom: "1px solid #1A2340", padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.5px", color: "#F0F4FF" }}>
          Short<span style={{ color: "#4F6EF7" }}>Flow</span>
        </a>
        <a href="/" style={{ fontSize: 14, color: "#6B7FA3" }}>← Back to Home</a>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 40px 100px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: "#6B7FA3", marginBottom: 48 }}>Last updated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>

        {[
          {
            title: "1. Acceptance of Terms",
            content: `By accessing or using ShortFlow ("the Service"), operated by Endless Discoveries ("we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.`
          },
          {
            title: "2. Description of Service",
            content: `ShortFlow is a software-as-a-service platform that helps YouTube Shorts managers generate metadata packages (titles, descriptions, tags, hashtags), manage multiple client profiles, view YouTube channel performance data, and post videos to connected YouTube channels.`
          },
          {
            title: "3. Accounts and Eligibility",
            content: `You must sign in using a valid Google account to use ShortFlow. You are responsible for maintaining the security of your account and for all activity that occurs under it. You must be at least 18 years old, or the age of majority in your jurisdiction, to use this Service.`
          },
          {
            title: "4. Subscriptions and Payment",
            content: `ShortFlow is offered on a subscription basis with recurring monthly billing processed through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel. Prices are listed on our pricing page and may change with notice. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period. We do not offer refunds for partial billing periods except where required by law.`
          },
          {
            title: "5. Acceptable Use",
            content: `You agree not to:

• Use the Service for any unlawful purpose or in violation of any applicable laws.
• Use the Service to generate misleading, defamatory, or harmful content.
• Attempt to gain unauthorized access to other users' accounts or data.
• Use the Service to violate YouTube's Terms of Service or Community Guidelines.
• Reverse engineer, decompile, or attempt to extract the source code of the Service.
• Use automated means to access the Service beyond its intended functionality.

We reserve the right to suspend or terminate accounts that violate these terms.`
          },
          {
            title: "6. YouTube Integration",
            content: `ShortFlow integrates with YouTube via Google's OAuth system and the YouTube Data API. When you connect a YouTube channel, you authorize ShortFlow to access channel performance data and, if applicable, to upload videos on your behalf. You are responsible for ensuring you have the right to connect any YouTube channel you link to ShortFlow, and for the content of any videos uploaded through the Service. Use of YouTube data through ShortFlow is also subject to YouTube's Terms of Service.`
          },
          {
            title: "7. Content Ownership",
            content: `You retain ownership of any transcripts, content, or client information you input into ShortFlow. We do not claim ownership of any content you generate using the Service. AI-generated metadata (titles, descriptions, tags) produced through ShortFlow is yours to use as you see fit.`
          },
          {
            title: "8. Third-Party Services",
            content: `ShortFlow relies on third-party services including Google (authentication and YouTube API), Anthropic (AI content generation), Stripe (payments), and Vercel (hosting). Your use of ShortFlow is also subject to the terms and policies of these providers where applicable.`
          },
          {
            title: "9. Limitation of Liability",
            content: `ShortFlow is provided "as is" without warranties of any kind, express or implied. We do not guarantee that AI-generated content will result in any particular level of engagement, views, or performance on YouTube or any platform. To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to lost revenue, lost data, or issues arising from third-party platforms such as YouTube.`
          },
          {
            title: "10. Termination",
            content: `We reserve the right to suspend or terminate your access to the Service at our discretion, including for violation of these terms, without prior notice. You may terminate your account at any time by canceling your subscription and discontinuing use of the Service.`
          },
          {
            title: "11. Changes to These Terms",
            content: `We may update these Terms of Service from time to time. We will notify users of material changes by posting the updated terms on this page. Continued use of the Service after changes constitutes acceptance of the new terms.`
          },
          {
            title: "12. Governing Law",
            content: `These terms are governed by the laws of the Netherlands, without regard to conflict of law principles.`
          },
          {
            title: "13. Contact",
            content: `For questions about these Terms of Service, contact us at the email listed on our Privacy Policy page.`
          }
        ].map(({ title, content }) => (
          <div key={title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: "#F0F4FF" }}>{title}</h2>
            <p style={{ fontSize: 15, color: "#8B9DC0", lineHeight: 1.8, whiteSpace: "pre-line" }}>{content}</p>
          </div>
        ))}
      </div>

      <footer style={{ borderTop: "1px solid #1A2340", padding: "24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "#3A4F70" }}>
          Short<span style={{ color: "#4F6EF7" }}>Flow</span> — <a href="/">Home</a> · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a>
        </div>
      </footer>
    </>
  );
}
