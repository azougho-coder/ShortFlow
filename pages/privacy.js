import Head from "next/head";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — ShortFlow</title>
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
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: "#6B7FA3", marginBottom: 48 }}>Last updated: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>

        {[
          {
            title: "1. Introduction",
            content: `ShortFlow ("we", "us", or "our") operates the ShortFlow platform at short-flow.vercel.app. This Privacy Policy explains how we collect, use, and protect your information when you use our service. By using ShortFlow, you agree to the collection and use of information in accordance with this policy.`
          },
          {
            title: "2. Information We Collect",
            content: `We collect the following information:

• Account information: When you sign in with Google, we receive your name, email address, and profile picture from Google.

• Client data: Information you enter about your clients (names, niches, tone preferences, notes) is stored to provide the service.

• YouTube data: When you connect a YouTube channel, we access channel statistics, video performance data (views, likes, comments), and the ability to upload videos. We access only the data necessary to provide ShortFlow's features.

• Usage data: We may collect information on how you use the service to improve it.`
          },
          {
            title: "3. How We Use Google and YouTube Data",
            content: `ShortFlow's use of Google user data is limited to the following purposes:

• Authentication: We use your Google account to verify your identity and provide secure access to your account.

• YouTube channel analytics: We access your connected YouTube channel's video performance data (views, likes, comments) to display performance reports and help the AI generate better metadata packages.

• YouTube video uploads: When you use the auto-posting feature, we upload videos to your connected YouTube channel on your behalf.

We do not sell, share, or transfer your Google or YouTube data to third parties. We do not use your Google or YouTube data for advertising purposes. Data is used solely to provide and improve ShortFlow's features.`
          },
          {
            title: "4. Data Storage and Security",
            content: `Your data is stored securely using industry-standard practices:

• Authentication tokens (including YouTube access tokens) are stored encrypted in our database.

• We use Vercel's infrastructure, which provides enterprise-grade security.

• YouTube access tokens are used only when needed to perform actions you explicitly request (fetching stats or uploading videos) and are never shared with third parties.

• We retain your data for as long as your account is active. You can request deletion at any time by contacting us.`
          },
          {
            title: "5. Third-Party Services",
            content: `ShortFlow uses the following third-party services:

• Google OAuth and YouTube Data API v3: For authentication and YouTube channel access.
• Anthropic Claude API: To generate metadata packages from transcripts. Transcripts you paste are sent to Anthropic's API for processing.
• Stripe: For payment processing. We do not store your payment card details.
• Vercel: For hosting and infrastructure.
• Upstash (Redis): For secure token storage.`
          },
          {
            title: "6. Your Rights",
            content: `You have the right to:

• Access the personal data we hold about you.
• Request correction of inaccurate data.
• Request deletion of your data.
• Disconnect your YouTube channel at any time through the ShortFlow dashboard, which removes our access to your channel data.
• Revoke ShortFlow's access to your Google account at any time through your Google Account settings at myaccount.google.com/permissions.

To exercise any of these rights, contact us at the email below.`
          },
          {
            title: "7. Data Retention",
            content: `We retain your account data and client information for as long as your account is active. YouTube tokens are refreshed automatically and can be revoked at any time. If you delete your account or disconnect a YouTube channel, the associated tokens are permanently deleted from our systems.`
          },
          {
            title: "8. Children's Privacy",
            content: `ShortFlow is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.`
          },
          {
            title: "9. Changes to This Policy",
            content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Continued use of ShortFlow after changes constitutes acceptance of the updated policy.`
          },
          {
            title: "10. Contact Us",
            content: `If you have any questions about this Privacy Policy or our data practices, please contact us at:\n\nShortFlow\nEmail: azougho@gmail.com`
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
          Short<span style={{ color: "#4F6EF7" }}>Flow</span> — <a href="/">Home</a> · <a href="/privacy">Privacy Policy</a>
        </div>
      </footer>
    </>
  );
}
