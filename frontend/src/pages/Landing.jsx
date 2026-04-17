import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* ─── SVG Icon Set ─────────────────────────────────────────────────────── */
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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

/* ─── Animated Counter ──────────────────────────────────────────────────── */
function AnimCounter({ to, prefix = "", suffix = "", duration = 1600 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
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

/* ─── Stat Card (Dashboard preview) ────────────────────────────────────── */
function StatCard({ label, value, accent, delay = 0 }) {
  return (
    <div
      className="gs-card p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-1.5 text-xl font-bold" style={{ color: accent || "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

/* ─── Dashboard Preview Widget ──────────────────────────────────────────── */
function DashboardPreview() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border"
      style={{
        background: "linear-gradient(145deg, #0D1526, #111D35)",
        borderColor: "rgba(212,168,67,0.15)",
        boxShadow: "0 0 60px rgba(212,168,67,0.06), 0 24px 48px rgba(0,0,0,0.5)",
      }}
    >
      {/* Glow top-right */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "rgba(212,168,67,0.06)", filter: "blur(48px)" }}
      />
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--gold)" }}>NBFC Dashboard</p>
            <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>Assessment overview</p>
          </div>
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(52,211,153,0.12)", color: "#6EE7B7" }}
          >
            Live
          </span>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <StatCard label="Today" value={<AnimCounter to={24} />} delay={0} />
          <StatCard label="Pre-approved" value={<AnimCounter to={79} suffix="%" />} accent="#6EE7B7" delay={120} />
          <StatCard label="Flagged" value={<AnimCounter to={21} suffix="%" />} accent="#FCD34D" delay={240} />
        </div>

        {/* Skeleton rows */}
        <div className="space-y-2">
          {[80, 60, 70].map((w, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="skeleton h-7 rounded-lg" style={{ width: `${w}%` }} />
              <div className="skeleton h-7 rounded-lg flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Landing Page ──────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="relative min-h-screen page-enter">
      {/* Ambient background */}
      <div className="bg-mesh" />
      <div className="orb orb-gold" style={{ width: 500, height: 500, top: -100, left: -80 }} />
      <div className="orb orb-blue" style={{ width: 400, height: 400, bottom: -60, right: -80 }} />

      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-8">

        {/* ── Nav ── */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.06))", border: "1px solid rgba(212,168,67,0.2)" }}
            >
              <IconShield style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>GoldSense AI</p>
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Remote Gold Assessment</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/demo" className="text-xs font-medium transition-colors" style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => e.target.style.color = "var(--gold-light)"}
              onMouseLeave={e => e.target.style.color = "var(--text-muted)"}
            >
              Demo
            </Link>
            <Link to="/dashboard" className="btn-ghost text-xs px-4 py-2">
              Dashboard
            </Link>
          </nav>
        </header>

        {/* ── Hero ── */}
        <section className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center mb-20">
          {/* Left: copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-[11px] font-semibold uppercase tracking-widest"
              style={{ background: "rgba(212,168,67,0.1)", color: "var(--gold)", border: "1px solid rgba(212,168,67,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Built for NBFC Workflows
            </div>

            <h1
              className="text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              Gold loan estimate<br />
              in <span style={{ color: "var(--gold)" }}>60 seconds</span>
            </h1>

            <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              AI-assisted preliminary valuation — purity band, weight estimate, and fraud risk score.{" "}
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                Final value verified at branch.
              </span>
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/assess" className="btn-primary">
                Start Assessment <IconArrow />
              </Link>
              <Link to="/dashboard" className="btn-ghost">
                View NBFC Dashboard
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              <span className="trust-badge"><IconLock /> Secure upload</span>
              <span className="trust-badge"><IconShield /> Data encrypted</span>
              <span className="trust-badge"><IconBadge /> BIS-compliant evaluation</span>
            </div>
          </div>

          {/* Right: dashboard preview */}
          <div className="hidden lg:block">
            <DashboardPreview />
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section className="mb-20">
          <p className="text-xs uppercase tracking-widest font-semibold mb-6 text-center" style={{ color: "var(--text-muted)" }}>
            How it works
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="gs-card p-5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                  style={{ background: "rgba(212,168,67,0.1)", color: "var(--gold)" }}
                >
                  {f.icon}
                </div>
                <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <p>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>GoldSense AI</span>
            {" · "}Aligned with BIS hallmark guidelines.
            {" · "}Not a substitute for on-premises assay.
          </p>
          <div className="flex gap-5">
            <a href="#" className="hover:underline transition-opacity hover:opacity-80">Privacy policy</a>
            <a href="#" className="hover:underline transition-opacity hover:opacity-80">Terms of use</a>
            <a href="#" className="hover:underline transition-opacity hover:opacity-80">Disclaimer</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
