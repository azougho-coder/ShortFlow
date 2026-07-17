import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";

const PLANS = [
  {
    name: "Starter",
    price: "€14.99",
    per: "/month",
    description: "Perfect for getting your first clients",
    features: ["Up to 2 clients", "Unlimited metadata packages", "Client profiles & history", "Clip rating & performance tips", "Copy-ready output"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    highlight: false,
  },
  {
    name: "Pro",
    price: "€19.99",
    per: "/month",
    description: "For serious Shorts managers",
    features: ["Up to 10 clients", "Everything in Starter", "YouTube performance reports", "Auto-posting to YouTube", "Priority email support"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    highlight: true,
  },
];

const FEATURES = [
  { icon: "⚡", title: "Full Package in Seconds", desc: "Paste a transcript and get titles, hooks, descriptions, hashtags, and a clip rating instantly. No more manual work." },
  { icon: "👥", title: "Multi-Client Dashboard", desc: "Manage all your clients in one place. Each client has their own profile, niche, tone, and history saved permanently." },
  { icon: "📊", title: "Performance Tracking", desc: "The AI learns what works for each client over time. Better data means better packages, means better results." },
];

export default function Landing() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleCheckout = async (plan) => {
    if (!plan.priceId) {
      router.push("/dashboard");
      return;
    }

    // Not signed in yet — send them to Google login first, then bring them back to pricing
    if (!session) {
      signIn("google", { callbackUrl: "/#pricing" });
      return;
    }

    setLoadingPlan(plan.name);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Head>
        <title>ShortFlow — The Shorts Manager Dashboard</title>
        <meta name="description" content="Manage multiple YouTube Shorts clients from one dashboard. Generate full metadata packages instantly." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="oYgw8E0iULV2UuWMVlW7DF72Cg4PEea4Z0Dr6bM78aY" />
        <meta name="google-site-verification" content="Rq__ln7OuI7f8Ng7R_aQFvqHGYIHn1Exvl6ZcCGkVuo" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#080B14;font-family:'Inter',system-ui,sans-serif;color:#F0F4FF}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .float{animation:float 4s ease-in-out infinite}
        .plan-card{background:#0A0E1A;border:1px solid #1A2340;border-radius:16px;padding:28px;transition:border-color .2s,transform .2s}
        .plan-card:hover{border-color:#4F6EF7;transform:translateY(-2px)}
        .plan-card.hl{border-color:#4F6EF7;background:#0D1525}
        .feat-card{background:#0A0E1A;border:1px solid #1A2340;border-radius:14px;padding:24px;transition:border-color .2s}
        .feat-card:hover{border-color:#4F6EF7}
        .cta{padding:14px 32px;background:#4F6EF7;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
        .cta:hover:not(:disabled){background:#3D5CE5;transform:translateY(-1px)}
        .cta:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .cta.ol{background:none;border:1px solid #1E2A45;color:#6B7FA3}
        .cta.ol:hover{border-color:#4F6EF7;color:#F0F4FF;transform:none}
        .login-btn{padding:8px 18px;background:none;border:1px solid #1E2A45;color:#C8D4F0;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit}
        .login-btn:hover{border-color:#4F6EF7;color:#4F6EF7}
        @media(max-width:768px){
          .hero-h1{font-size:34px!important;letter-spacing:-.5px!important}
          .plans-g{grid-template-columns:1fr!important}
          .feats-g{grid-template-columns:1fr!important}
          .nl{display:none!important}
          .hp{padding:100px 20px 60px!important}
          .sp{padding:60px 20px!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(8,11,20,.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid #1A2340",padding:"0 40px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:18,fontWeight:700,letterSpacing:"-.5px"}}>Short<span style={{color:"#4F6EF7"}}>Flow</span></div>
        <div className="nl" style={{display:"flex",gap:16,alignItems:"center"}}>
          <a href="#features" style={{color:"#6B7FA3",fontSize:14,textDecoration:"none"}}>Features</a>
          <a href="#pricing" style={{color:"#6B7FA3",fontSize:14,textDecoration:"none"}}>Pricing</a>
          <button onClick={()=>router.push("/dashboard")} className="login-btn">Log In</button>
          <button onClick={()=>router.push("/dashboard")} className="cta" style={{padding:"8px 20px",fontSize:14}}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hp" style={{padding:"140px 40px 100px",maxWidth:900,margin:"0 auto",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#0D1525",border:"1px solid #1E2A5E",borderRadius:20,padding:"6px 16px",fontSize:12,color:"#4F6EF7",fontWeight:600,marginBottom:28,letterSpacing:".5px"}}>
          ⚡ BUILT BY A SHORTS MANAGER, FOR SHORTS MANAGERS
        </div>
        <h1 className="hero-h1" style={{fontSize:54,fontWeight:800,lineHeight:1.1,letterSpacing:"-1.5px",marginBottom:24}}>
          Manage every client.<br/>
          <span style={{color:"#4F6EF7"}}>Generate every package.</span><br/>
          In one place.
        </h1>
        <p style={{fontSize:18,color:"#6B7FA3",lineHeight:1.7,maxWidth:560,margin:"0 auto 40px"}}>
          Stop switching tabs and starting from scratch. ShortFlow turns any transcript into a complete metadata package in seconds — for every client you manage.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="#pricing"><button className="cta">Get Started →</button></a>
          <button className="cta ol" onClick={()=>router.push("/dashboard")}>Try the App Free</button>
        </div>

        <div className="float" style={{marginTop:64,background:"#0A0E1A",border:"1px solid #1E2A45",borderRadius:16,padding:24,textAlign:"left",maxWidth:560,margin:"64px auto 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#EF4444"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#F59E0B"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#10B981"}}/>
            <div style={{flex:1,background:"#111827",borderRadius:4,height:22,marginLeft:8,display:"flex",alignItems:"center",paddingLeft:10}}>
              <div style={{fontSize:11,color:"#3A4F70"}}>shortflow.net/dashboard</div>
            </div>
          </div>
          {[
            {label:"Clip Rating",content:<span style={{background:"#1C1200",color:"#F59E0B",fontWeight:700,padding:"2px 10px",borderRadius:4,fontSize:13}}>🔥 FIRE</span>},
            {label:"Opening Hook",content:<span style={{fontSize:13,color:"#C8D4F0",fontStyle:"italic"}}>"The Federal Reserve just made a decision that will affect every person on earth."</span>},
            {label:"Top Title",content:<span style={{fontSize:13,color:"#C8D4F0"}}>The Decision That Will Crash 90 Countries' Economies</span>},
          ].map((item,i)=>(
            <div key={i} style={{background:"#0D1525",border:"1px solid #1A2340",borderRadius:10,padding:"12px 14px",marginBottom:i<2?8:0}}>
              <div style={{fontSize:10,fontWeight:700,color:"#3A4F70",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>{item.label}</div>
              {item.content}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="sp" style={{padding:"80px 40px",maxWidth:1000,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:12,fontWeight:700,color:"#4F6EF7",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Features</div>
          <h2 style={{fontSize:34,fontWeight:700,letterSpacing:"-.8px"}}>Everything you need to scale</h2>
        </div>
        <div className="feats-g" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="feat-card">
              <div style={{fontSize:28,marginBottom:14}}>{f.icon}</div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:14,color:"#6B7FA3",lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{padding:"0 40px 80px",maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <div style={{background:"#0A0E1A",border:"1px solid #1E2A5E",borderRadius:16,padding:32}}>
          <div style={{fontSize:17,color:"#C8D4F0",lineHeight:1.7,fontStyle:"italic",marginBottom:20}}>
            "I used to spend 2 hours per client doing metadata manually. ShortFlow cut that down to minutes. I took on 3 more clients the same week."
          </div>
          <div style={{fontSize:13,color:"#6B7FA3"}}>— Shorts Manager, 6 clients</div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="sp" style={{padding:"80px 40px",maxWidth:1000,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:12,fontWeight:700,color:"#4F6EF7",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Pricing</div>
          <h2 style={{fontSize:34,fontWeight:700,letterSpacing:"-.8px",marginBottom:12}}>Simple, transparent pricing</h2>
          <p style={{fontSize:15,color:"#6B7FA3"}}>Cancel anytime. No hidden fees.</p>
        </div>
        {error&&<div style={{textAlign:"center",color:"#EF4444",marginBottom:24,fontSize:14}}>{error}</div>}
        <div className="plans-g" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,maxWidth:700,margin:"0 auto"}}>
          {PLANS.map((plan)=>(
            <div key={plan.name} className={`plan-card ${plan.highlight?"hl":""}`}>
              {plan.highlight&&<div style={{display:"inline-block",background:"#4F6EF7",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,marginBottom:16}}>MOST POPULAR</div>}
              <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{plan.name}</div>
              <div style={{fontSize:13,color:"#6B7FA3",marginBottom:20}}>{plan.description}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:24}}>
                <div style={{fontSize:40,fontWeight:800,letterSpacing:"-1px"}}>{plan.price}</div>
                <div style={{fontSize:14,color:"#6B7FA3"}}>{plan.per}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
                {plan.features.map((f,i)=>(
                  <div key={i} style={{fontSize:14,color:"#8B9DC0"}}><span style={{color:"#4F6EF7",marginRight:10,fontWeight:700}}>✓</span>{f}</div>
                ))}
              </div>
              <button
                className="cta"
                style={{width:"100%",padding:"12px",fontSize:15,background:plan.highlight?"#4F6EF7":"none",border:plan.highlight?"none":"1px solid #1E2A45",color:plan.highlight?"#fff":"#6B7FA3"}}
                onClick={()=>handleCheckout(plan)}
                disabled={loadingPlan===plan.name}
              >
                {loadingPlan===plan.name?"Loading...":`Get ${plan.name} →`}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{padding:"0 40px 100px",maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <h2 style={{fontSize:34,fontWeight:700,letterSpacing:"-.8px",marginBottom:16}}>Ready to manage Shorts like a pro?</h2>
        <p style={{fontSize:16,color:"#6B7FA3",marginBottom:32}}>Join Shorts managers already using ShortFlow to save hours every week.</p>
        <a href="#pricing"><button className="cta">Get Started Today →</button></a>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid #1A2340",padding:"24px 40px",textAlign:"center"}}>
        <div style={{fontSize:14,color:"#3A4F70"}}>Short<span style={{color:"#4F6EF7"}}>Flow</span> — Built for Shorts managers &nbsp;·&nbsp; <a href="/privacy" style={{color:"#3A4F70",textDecoration:"none"}}>Privacy Policy</a> &nbsp;·&nbsp; <a href="/terms" style={{color:"#3A4F70",textDecoration:"none"}}>Terms of Service</a></div>
      </footer>
    </>
  );
}
