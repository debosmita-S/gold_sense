import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-16 pt-10 sm:max-w-3xl">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-xl">
            ✦
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-400/90">
              GoldSense AI
            </p>
            <p className="text-sm text-slate-400">Remote gold assessment</p>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="text-xs font-medium text-slate-400 hover:text-amber-300"
        >
          NBFC Dashboard →
        </Link>
      </header>

      <section className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
          Get your gold loan estimate in{" "}
          <span className="text-amber-400">60 seconds</span>
        </h1>
        <p className="mt-4 text-slate-400">
          Upload photos, optional tap audio, and receive a conservative
          pre-assessment with explainable confidence — built for NBFC gold
          lending workflows.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/assess"
            className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-6 py-3 text-center text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25"
          >
            Start Assessment
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-amber-500/50"
          >
            NBFC Dashboard →
          </Link>
        </div>
        <Link
          to="/demo"
          className="mt-4 inline-block text-sm text-sky-400 hover:underline"
        >
          Judge demo scenarios →
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: "⚡", title: "Fast", desc: "Mobile-first capture in under a minute." },
          { icon: "◎", title: "Transparent", desc: "Bands, not fake precision — with reasons." },
          { icon: "🏠", title: "No branch", desc: "Remote-first for scale and convenience." },
        ].map((x) => (
          <div
            key={x.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
          >
            <div className="text-2xl">{x.icon}</div>
            <p className="mt-2 font-semibold text-slate-100">{x.title}</p>
            <p className="mt-1 text-xs text-slate-400">{x.desc}</p>
          </div>
        ))}
      </section>

      <footer className="mt-auto pt-16 text-center text-[11px] text-slate-600">
        Hackathon prototype — not a substitute for on-premises assay.
      </footer>
    </div>
  );
}
