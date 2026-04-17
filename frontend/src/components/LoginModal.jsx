import { useState } from "react";

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

export default function LoginModal({ isOpen, onClose }) {
  const [method, setMethod] = useState("email");
  const [value, setValue] = useState("");
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(31,41,51,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl page-enter"
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2" style={{ color: "var(--gold)" }}>
            <IconShield />
            <span className="font-bold tracking-tight text-[15px]" style={{ color: "var(--text-primary)" }}>GoldSense</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <IconX />
          </button>
        </div>

        {step === 1 ? (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome back</h2>
            <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>Sign in to your NBFC portal</p>

            <div className="flex gap-2 mb-4 p-1 rounded-lg" style={{ background: "var(--surface-0)" }}>
              <button
                type="button"
                className={`flex-1 text-xs py-1.5 font-medium rounded-md transition-all ${method === "email" ? "bg-white shadow-sm" : ""}`}
                style={method === "email" ? { color: "var(--text-primary)" } : { color: "var(--text-muted)" }}
                onClick={() => { setMethod("email"); setValue(""); }}
              >
                Email
              </button>
              <button
                type="button"
                className={`flex-1 text-xs py-1.5 font-medium rounded-md transition-all ${method === "phone" ? "bg-white shadow-sm" : ""}`}
                style={method === "phone" ? { color: "var(--text-primary)" } : { color: "var(--text-muted)" }}
                onClick={() => { setMethod("phone"); setValue(""); }}
              >
                Phone
              </button>
            </div>

            <label className="block mb-6">
              <span className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                {method === "email" ? "Email Address" : "Phone Number"}
              </span>
              <input
                type={method === "email" ? "email" : "tel"}
                placeholder={method === "email" ? "you@nbfc.com" : "+91 00000 00000"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="gs-input"
              />
            </label>

            <button
              className="btn-primary w-full"
              disabled={!value}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Enter OTP</h2>
            <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
              We sent a 6-digit code to <span className="font-semibold">{value}</span>
            </p>

            <div className="flex gap-2 mb-6 justify-between">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-10 h-10 text-center text-lg font-bold border rounded-md outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              ))}
            </div>

            <button
              className="btn-primary w-full"
              onClick={onClose}
            >
              Verify & Login
            </button>
            
            <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
              Didn't receive code? <button className="font-semibold hover:underline" style={{ color: "var(--gold)" }}>Resend</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
