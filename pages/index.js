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
  { num: "01", title: "Full Package in Seconds", desc: "Paste a transcript and get titles, hooks, descriptions, hashtags, and a clip rating instantly. No more manual work." },
  { num: "02", title: "Multi-Client Dashboard", desc: "Manage all your clients in one place. Each client has their own profile, niche, tone, and history saved permanently." },
  { num: "03", title: "Performance Tracking", desc: "The AI learns what works for each client over time. Better data means better packages, means better results." },
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
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#000;font-family:'Inter',system-ui,sans-serif;color:#fff}
        h1,h2,.disp{font-family:'Space Grotesk',sans-serif}
        .mono{font-family:'JetBrains Mono',monospace}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        .cursor{animation:blink 1s step-start infinite}
        .plan-card{background:#0A0A0A;border:1px solid #1A1A1A;border-radius:4px;padding:32px;transition:border-color .2s}
        .plan-card:hover{border-color:#333}
        .plan-card.hl{border-color:#3EFFA0}
        .feat-row{border-top:1px solid #161616;padding:32px 0;display:flex;gap:32px;align-items:flex-start}
        .feat-row:last-child{border-bottom:1px solid #161616}
        .cta{padding:14px 30px;background:#3EFFA0;color:#000;border:none;border-radius:3px;font-size:15px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif}
        .cta:hover:not(:disabled){background:#5CFFB3;transform:translateY(-1px)}
        .cta:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .cta.ol{background:none;border:1px solid #333;color:#fff}
        .cta.ol:hover{border-color:#fff;background:none;transform:none}
        .login-btn{padding:8px 16px;background:none;border:none;color:#999;font-size:14px;font-weight:500;cursor:pointer;transition:color .15s;font-family:inherit}
        .login-btn:hover{color:#fff}
        @media(max-width:768px){
          .hero-h1{font-size:36px!important;letter-spacing:-.5px!important}
          .plans-g{grid-template-columns:1fr!important}
          .nl{display:none!important}
          .hp{padding:110px 20px 60px!important}
          .sp{padding:60px 20px!important}
          .feat-row{flex-direction:column;gap:8px}
        }
      `}</style>

      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(0,0,0,.85)",backdropFilter:"blur(12px)",borderBottom:"1px solid #161616",padding:"0 20px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="disp" style={{fontSize:18,fontWeight:700,letterSpacing:"-.5px"}}>Short<span style={{color:"#3EFFA0"}}>Flow</span></div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <a href="#features" className="nl" style={{color:"#999",fontSize:14,textDecoration:"none",marginRight:8}}>Features</a>
          <a href="#pricing" className="nl" style={{color:"#999",fontSize:14,textDecoration:"none",marginRight:8}}>Pricing</a>
          <button onClick={()=>router.push("/dashboard")} className="login-btn">Log In</button>
          <button onClick={()=>router.push("/dashboard")} className="cta" style={{padding:"8px 16px",fontSize:13}}>Get Started</button>
        </div>
      </nav>

      <section className="hp" style={{padding:"150px 40px 100px",maxWidth:900,margin:"0 auto",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,border:"1px solid #2A2A2A",borderRadius:20,padding:"6px 16px",fontSize:13,color:"#3EFFA0",marginBottom:32,letterSpacing:".2px",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>
          <span className="cursor">●</span> BUILT BY A SHORTS MANAGER, FOR SHORTS MANAGERS
        </div>
        <h1 className="hero-h1" style={{fontSize:58,fontWeight:700,lineHeight:1.08,letterSpacing:"-2px",marginBottom:24}}>
          Manage every client.<br/>
          <span style={{color:"#3EFFA0"}}>Generate every package.</span><br/>
          In one place.
        </h1>
        <p style={{fontSize:18,color:"#999",lineHeight:1.7,maxWidth:540,margin:"0 auto 40px"}}>
          Stop switching tabs and starting from scratch. ShortFlow turns any transcript into a complete metadata package in seconds — for every client you manage.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="#pricing"><button className="cta">Get Started →</button></a>
          <button className="cta ol" onClick={()=>router.push("/dashboard")}>Try the App Free</button>
        </div>

        <div style={{marginTop:64,background:"#0A0A0A",border:"1px solid #2A2A2A",borderRadius:6,padding:0,textAlign:"left",maxWidth:560,margin:"64px auto 0",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",borderBottom:"1px solid #222"}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:"#333"}}/><div style={{width:9,height:9,borderRadius:"50%",background:"#333"}}/><div style={{width:9,height:9,borderRadius:"50%",background:"#333"}}/>
            <div className="mono" style={{marginLeft:8,fontSize:11,color:"#555"}}>shortflow.net/dashboard</div>
          </div>
          <div style={{padding:20}}>
            {[
              {label:"CLIP_RATING",content:<span className="mono" style={{color:"#3EFFA0",fontWeight:700,fontSize:15,letterSpacing:".5px"}}>FIRE ●●●</span>},
              {label:"OPENING_HOOK",content:<span style={{fontSize:13,color:"#ccc",fontStyle:"italic"}}>"The Federal Reserve just made a decision that will affect every person on earth."</span>},
              {label:"TOP_TITLE",content:<span style={{fontSize:13,color:"#ccc"}}>The Decision That Will Crash 90 Countries' Economies</span>},
            ].map((item,i)=>(
              <div key={i} style={{marginBottom:i<2?16:0}}>
                <div style={{fontSize:11,color:"#3EFFA0",letterSpacing:".5px",marginBottom:6,fontWeight:600,fontFamily:"'Inter',sans-serif"}}>{item.label}</div>
                {item.content}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="sp" style={{padding:"80px 40px",maxWidth:760,margin:"0 auto"}}>
        <div style={{marginBottom:8}}>
          <div style={{fontSize:13,color:"#3EFFA0",letterSpacing:"1px",marginBottom:12,fontWeight:700,fontFamily:"'Inter',sans-serif"}}>FEATURES</div>
          <h2 style={{fontSize:32,fontWeight:700,letterSpacing:"-.8px"}}>Everything you need to scale</h2>
        </div>
        {FEATURES.map((f)=>(
          <div key={f.num} className="feat-row">
            <div className="mono" style={{fontSize:16,color:"#3EFFA0",fontWeight:700,flexShrink:0,paddingTop:2,letterSpacing:"1px"}}>{f.num}</div>
            <div>
              <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:15,color:"#999",lineHeight:1.6}}>{f.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <section style={{padding:"0 40px 80px",maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <div style={{background:"#0A0A0A",border:"1px solid #1A1A1A",borderRadius:6,padding:32}}>
          <div style={{fontSize:17,color:"#ddd",lineHeight:1.7,fontStyle:"italic",marginBottom:20}}>
            "I used to spend 2 hours per client doing metadata manually. ShortFlow cut that down to minutes. I took on 3 more clients the same week."
          </div>
          <div className="mono" style={{fontSize:12,color:"#888",letterSpacing:".5px",fontWeight:500}}>— SHORTS MANAGER, 6 CLIENTS</div>
        </div>
      </section>

      <section id="pricing" className="sp" style={{padding:"80px 40px",maxWidth:1000,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:13,color:"#3EFFA0",letterSpacing:"1px",marginBottom:12,fontWeight:700,fontFamily:"'Inter',sans-serif"}}>PRICING</div>
          <h2 style={{fontSize:32,fontWeight:700,letterSpacing:"-.8px",marginBottom:12}}>Simple, transparent pricing</h2>
          <p style={{fontSize:15,color:"#999"}}>Cancel anytime. No hidden fees.</p>
        </div>
        {error&&<div style={{textAlign:"center",color:"#FF5C5C",marginBottom:24,fontSize:14}}>{error}</div>}
        <div className="plans-g" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16,maxWidth:700,margin:"0 auto"}}>
          {PLANS.map((plan)=>(
            <div key={plan.name} className={`plan-card ${plan.highlight?"hl":""}`}>
              {plan.highlight&&<div className="mono" style={{display:"inline-block",background:"#3EFFA0",color:"#000",fontSize:12,fontWeight:700,padding:"5px 12px",borderRadius:3,marginBottom:16,letterSpacing:"1px"}}>MOST POPULAR</div>}
              <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{plan.name}</div>
              <div style={{fontSize:13,color:"#999",marginBottom:20}}>{plan.description}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:24}}>
                <div className="mono" style={{fontSize:36,fontWeight:600,letterSpacing:"-1px"}}>{plan.price}</div>
                <div style={{fontSize:14,color:"#999"}}>{plan.per}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
                {plan.features.map((f,i)=>(
                  <div key={i} style={{fontSize:14,color:"#bbb"}}><span style={{color:"#3EFFA0",marginRight:10,fontWeight:700}}>+</span>{f}</div>
                ))}
              </div>
              <button
                className="cta"
                style={{width:"100%",padding:"12px",fontSize:15,background:plan.highlight?"#3EFFA0":"none",border:plan.highlight?"none":"1px solid #333",color:plan.highlight?"#000":"#fff"}}
                onClick={()=>handleCheckout(plan)}
                disabled={loadingPlan===plan.name}
              >
                {loadingPlan===plan.name?"Loading...":`Get ${plan.name} →`}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:"0 40px 100px",maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <h2 style={{fontSize:32,fontWeight:700,letterSpacing:"-.8px",marginBottom:16}}>Ready to manage Shorts like a pro?</h2>
        <p style={{fontSize:16,color:"#999",marginBottom:32}}>Join Shorts managers already using ShortFlow to save hours every week.</p>
        <a href="#pricing"><button className="cta">Get Started Today →</button></a>
      </section>

      <footer style={{borderTop:"1px solid #161616",padding:"24px 40px",textAlign:"center"}}>
        <div className="mono" style={{fontSize:13,color:"#777"}}>Short<span style={{color:"#3EFFA0"}}>Flow</span> — Built for Shorts managers &nbsp;·&nbsp; <a href="/help" style={{color:"#555",textDecoration:"none"}}>Help</a> &nbsp;·&nbsp; <a href="/privacy" style={{color:"#555",textDecoration:"none"}}>Privacy</a> &nbsp;·&nbsp; <a href="/terms" style={{color:"#555",textDecoration:"none"}}>Terms</a></div>
      </footer>
    </>
  );
}
