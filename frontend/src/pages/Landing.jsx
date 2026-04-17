import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import LoginModal from "../components/LoginModal.jsx";
import PriceTrend from "../components/PriceTrend.jsx";

/* ─── SVG Icon Set ─────────────────────────────────────────────────────── */
function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#C4A85C" stroke="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function IconBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  );
}
function IconZap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

/* ─── Generate Mock Graph Data ─────────────────────────────────────────── */
const generateData = (basePrice = 14500) => {
  let base = basePrice * 0.99;  // Start 1% below current
  return Array.from({ length: 48 }, (_, i) => {
    base = base + (Math.random() - 0.45) * (basePrice * 0.002);  // Variance based on price
    return { time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`, price: Number(base.toFixed(2)) };
  });
};

/* ─── Hero Analytics widget ────────────────────────────────────────────── */
function HeroAnalyticsGraph({ price = 14500, change = 0, changePercent = 0 }) {
  const graphData = generateData(price);
  
  return (
    <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl shadow-gray-200/50" style={{ border: "1px solid var(--border)" }}>
      <div className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Live Global Rate</p>
          </div>
          <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>₹{Math.round(price).toLocaleString("en-IN")} <span className="text-sm font-medium text-gray-400">/ g</span></h3>
          <p className="text-xs font-semibold" style={{ color: change >= 0 ? "#6EE7B7" : "#FCA5A5" }}>
            {change >= 0 ? "+" : ""}{change.toFixed(2)} ({changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%) Today
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "var(--gold)" }}>AI Confidence</p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>98.4%</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full bg-white pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={graphData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px", color: "var(--text-primary)", fontWeight: "600", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
              itemStyle={{ color: "var(--success)" }}
            />
            <Area type="monotone" dataKey="price" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        <span>1D: 0.59%</span>
        <span>1W: 2.14%</span>
        <span>1M: 5.40%</span>
        <span>1Y: 18.2%</span>
      </div>
    </div>
  );
}

/* ─── Feature Card ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <IconZap />,
    title: "Instant Pre-Assessment",
    desc: "Upload photos from any device. Get a structured valuation band in under 60 seconds.",
  },
  {
    icon: <IconEye />,
    title: "Explainable Valuation",
    desc: "Every score comes with reasoning — purity band, weight estimate, and fraud flags shown clearly.",
  },
  {
    icon: <IconGlobe />,
    title: "Fully Remote Process",
    desc: "No branch visit needed for preliminary screening. Scales across your lending network.",
  },
];

/* ─── Landing Page ──────────────────────────────────────────────────────── */
export default function Landing() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [livePrice, setLivePrice] = useState(14500);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const prevPriceRef = useRef(14500);

  useEffect(() => {
    let mounted = true;
    
    async function fetchGoldPrice() {
      try {
        const res = await fetch("/api/gold-price");
        if (!res.ok) throw new Error("Failed to fetch price");
        const data = await res.json();
        const price = Number(data?.price_per_gram_inr || 7200);
        
        if (mounted) {
          // Calculate change from previous price
          const prevPrice = prevPriceRef.current;
          const change = price - prevPrice;
          const changePercent = prevPrice > 0 ? ((change / prevPrice) * 100) : 0;
          
          setLivePrice(price);
          setPriceChange(change);
          setPriceChangePercent(changePercent);
          
          // Update ref for next cycle
          prevPriceRef.current = price;
        }
      } catch (err) {
        console.error("Gold price fetch error:", err);
        // Keep existing price on error
      }
    }

    fetchGoldPrice();
    const interval = setInterval(fetchGoldPrice, 60000); // Update every minute
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative min-h-screen page-enter">
      {/* Ambient background */}
      <div className="bg-mesh" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 pb-20 pt-8 sm:px-8">
        {/* ── Nav ── */}
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100"
            >
              <IconShield style={{ color: "#C4A85C", strokeWidth: "2" }} />
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>GoldSense AI</p>
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>NBFC Analytical Portal</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/demo" className="text-xs font-semibold hover:text-gray-900 transition-colors" style={{ color: "var(--text-muted)" }}>
              Demo View
            </Link>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="btn-ghost text-xs px-5 py-2 hover:bg-white shadow-sm"
            >
              Log In
            </button>
            <Link to="/dashboard" className="btn-primary text-xs px-5 py-2 shadow-md">
              Dashboard
            </Link>
          </nav>
        </header>

        {/* ── Hero ── */}
        <section className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center mb-24">
          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8 text-[11px] font-bold uppercase tracking-widest bg-white shadow-sm border border-gray-100"
              style={{ color: "var(--gold)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Built for Financial Institutions
            </div>

            <h1
              className="text-5xl font-extrabold leading-[1.15] tracking-tight sm:text-6xl"
              style={{ color: "var(--text-primary)" }}
            >
              Gold loan estimates<br />
              with <span style={{ color: "var(--gold)" }}>AI Precision</span>
            </h1>

            <p className="mt-6 text-[17px] leading-relaxed max-w-lg" style={{ color: "var(--text-secondary)" }}>
              Enterprise-grade preliminary valuation platform. Analyze purity, estimate weight, and flag fraud risks in seconds using advanced computer vision.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/assess" className="btn-primary text-sm px-6 py-3.5 shadow-lg shadow-gray-200">
                Start Assessment <IconArrow />
              </Link>
              <button onClick={() => setIsLoginOpen(true)} className="btn-ghost text-sm px-6 py-3.5 bg-white">
                Partner Login
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-gray-200/60 max-w-lg">
              <span className="trust-badge"><IconLock /> Bank-grade Secure</span>
              <span className="trust-badge"><IconShield /> Data Encrypted</span>
              <span className="trust-badge"><IconBadge /> BIS-aligned Logic</span>
            </div>
          </div>

          {/* Right: Graph Widget */}
          <div className="hidden lg:block">
            <PriceTrend />
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Platform Capabilities</h2>
            <Link to="/assess" className="text-xs font-semibold hover:underline" style={{ color: "var(--gold)" }}>Explore technicals →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="gs-card p-6 bg-white hover:-translate-y-1 transition-all duration-300">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl mb-5 border border-amber-100/50"
                  style={{ background: "var(--surface-0)", color: "var(--gold)" }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="border-t pb-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <p>
            <span className="font-bold" style={{ color: "var(--text-secondary)" }}>GoldSense AI</span>
            {" · "}Aligned with BIS hallmark guidelines 
            {" · "}Not a substitute for on-premises assay.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Security</a>
          </div>
        </footer>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
