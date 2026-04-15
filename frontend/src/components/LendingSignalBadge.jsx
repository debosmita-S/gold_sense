const styles = {
  PRE_APPROVE: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/40",
  NEEDS_VERIFICATION: "bg-amber-500/20 text-amber-200 ring-amber-500/40",
  REJECT: "bg-red-500/20 text-red-200 ring-red-500/40",
};

const labels = {
  PRE_APPROVE: "PRE-APPROVE",
  NEEDS_VERIFICATION: "NEEDS VERIFICATION",
  REJECT: "REJECT",
};

export default function LendingSignalBadge({ signal }) {
  const cls = styles[signal] || styles.NEEDS_VERIFICATION;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${cls}`}
    >
      {labels[signal] || signal}
    </span>
  );
}
