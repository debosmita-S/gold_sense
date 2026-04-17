const CONFIG = {
  PRE_APPROVE:        { bg: "rgba(52,211,153,0.1)",  color: "#6EE7B7", ring: "rgba(52,211,153,0.25)",  label: "Pre-Approve" },
  NEEDS_VERIFICATION: { bg: "rgba(212,168,67,0.1)",  color: "#FCD34D", ring: "rgba(212,168,67,0.25)", label: "Needs Verification" },
  REJECT:             { bg: "rgba(239,68,68,0.1)",   color: "#FCA5A5", ring: "rgba(239,68,68,0.25)",  label: "Reject" },
};

export default function LendingSignalBadge({ signal }) {
  const c = CONFIG[signal] || CONFIG.NEEDS_VERIFICATION;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.color, boxShadow: `0 0 0 1px ${c.ring}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}
