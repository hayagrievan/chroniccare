"use client";

import { useState } from "react";
import { Heart, Eye, EyeOff, Shield, Activity, Users, ArrowRight, CheckCircle } from "lucide-react";

interface LoginPageProps {
    onLogin: (role: "doctor" | "admin" | "patient") => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [patientPhrn, setPatientPhrn] = useState("");
    const [patientPin, setPatientPin] = useState("");
    const [activeRole, setActiveRole] = useState<"professional" | "patient">("professional");
    const [tab, setTab] = useState<"signin" | "signup">("signin");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Sign In state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    // Sign Up state
    const [name, setName] = useState("");
    const [role, setRole] = useState<"doctor" | "admin">("doctor");
    const [specialty, setSpecialty] = useState("Cardiology");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { setError("Please fill in all fields."); return; }
        setError("");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin(email.toLowerCase().includes("admin") ? "admin" : "doctor");
        }, 1200);
    };

    const handlePatientSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientPhrn || !patientPin) { setError("Please enter your PHRN and PIN."); return; }
        if (!patientPhrn.startsWith("PHRN-")) { setError("Invalid PHRN format. Must start with PHRN-"); return; }
        setError("");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin("patient");
        }, 1200);
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !regEmail || !regPassword || !confirmPassword) { setError("Please fill in all fields."); return; }
        if (regPassword !== confirmPassword) { setError("Passwords do not match."); return; }
        setError("");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin(role);
        }, 1400);
    };

    return (
        <div className="flex h-screen" style={{ background: "#f0f4ff" }}>
            {/* LEFT — Brand Panel */}
            <div
                className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
                style={{ background: "linear-gradient(155deg, #1e3a5f 0%, #2d4fa1 50%, #4c6ef5 100%)" }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "rgba(116,143,252,0.15)", transform: "translate(40%,-40%)" }} />
                <div className="absolute bottom-20 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(165,180,252,0.1)", transform: "translate(-40%,0)" }} />
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                        <Heart size={22} className="text-red-400" fill="currentColor" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-lg leading-tight">ChronicCare AI</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Healthcare Intelligence Platform</p>
                    </div>
                </div>

                {/* Hero Text */}
                <div>
                    <h1 className="text-4xl font-black text-white leading-tight mb-4">
                        AI-Powered<br />Chronic Care,<br />
                        <span style={{ color: "#bac8ff" }}>PHRN-First.</span>
                    </h1>
                    <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
                        ChronicCare AI uses explainable ML, PHRN identity, and consent-based access to unify chronic disease management.
                    </p>

                    {/* Feature pills */}
                    {[
                        { icon: <Activity size={14} />, text: "Real-time patient monitoring" },
                        { icon: <Shield size={14} />, text: "HIPAA & DISHA compliant" },
                        { icon: <Users size={14} />, text: "2,84,750+ patients tracked" },
                    ].map((f, i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
                                {f.icon}
                            </div>
                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{f.text}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom quote */}
                <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                    "Empowering every clinician with the information to act at the right moment."
                </p>
            </div>

            {/* RIGHT — Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Portal Switcher */}
                    <div className="flex rounded-2xl p-1 mb-6" style={{ background: "#e8ecf4" }}>
                        <button
                            onClick={() => { setActiveRole("professional"); setError(""); }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: activeRole === "professional" ? "#fff" : "transparent",
                                color: activeRole === "professional" ? "#4c6ef5" : "#8898aa",
                                boxShadow: activeRole === "professional" ? "0 2px 8px rgba(76,110,245,0.12)" : "none",
                            }}
                        >
                            🩺 Healthcare Professional
                        </button>
                        <button
                            onClick={() => { setActiveRole("patient"); setError(""); }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: activeRole === "patient" ? "#fff" : "transparent",
                                color: activeRole === "patient" ? "#7c3aed" : "#8898aa",
                                boxShadow: activeRole === "patient" ? "0 2px 8px rgba(124,58,237,0.12)" : "none",
                            }}
                        >
                            👤 Patient Portal
                        </button>
                    </div>

                    {/* Patient Login */}
                    {activeRole === "patient" && (
                        <form onSubmit={handlePatientSignIn} className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-black mb-1" style={{ color: "#1a1f36" }}>Patient Portal</h2>
                                <p className="text-sm" style={{ color: "#8898aa" }}>Sign in with your PHRN to access your health records</p>
                                <p className="text-xs mt-1 px-3 py-2 rounded-lg" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                                    <strong>Demo PHRN:</strong> PHRN-IND-2026-000001 · PIN: patient1234
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Patient Health Reference Number (PHRN)</label>
                                <input
                                    type="text"
                                    value={patientPhrn}
                                    onChange={(e) => setPatientPhrn(e.target.value.toUpperCase())}
                                    placeholder="PHRN-IND-2026-000001"
                                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-mono"
                                    style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540", letterSpacing: "0.04em" }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>PIN</label>
                                <input
                                    type="password"
                                    value={patientPin}
                                    onChange={(e) => setPatientPin(e.target.value)}
                                    placeholder="Enter your 8-digit PIN"
                                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                                    style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                />
                            </div>

                            {error && <ErrorMsg msg={error} />}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-70"
                                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                            >
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying PHRN...</>
                                ) : (
                                    <>🔒 Enter Patient Portal</>
                                )}
                            </button>

                            <button type="button"
                                onClick={() => { setPatientPhrn("PHRN-IND-2026-000001"); setPatientPin("patient1234"); }}
                                className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all"
                                style={{ borderColor: "#c4b5fd", background: "#f3e8ff", color: "#7c3aed" }}
                            >
                                Use Patient Demo
                            </button>
                        </form>
                    )}

                    {/* Professional Login Tabs */}
                    {activeRole === "professional" && (
                    <div className="flex rounded-2xl p-1 mb-6" style={{ background: "#e8ecf4" }}>
                        {(["signin", "signup"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError(""); }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: tab === t ? "#fff" : "transparent",
                                    color: tab === t ? "#4c6ef5" : "#8898aa",
                                    boxShadow: tab === t ? "0 2px 8px rgba(76,110,245,0.12)" : "none",
                                }}
                            >
                                {t === "signin" ? "Sign In" : "Create Account"}
                            </button>
                        ))}
                    </div>)}

                    {activeRole === "professional" && tab === "signin" ? (
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-black mb-1" style={{ color: "#1a1f36" }}>Welcome back</h2>
                                <p className="text-sm" style={{ color: "#8898aa" }}>Sign in to your ChronicCare Sync account</p>
                                <p className="text-xs mt-1 px-3 py-2 rounded-lg" style={{ background: "#eef2ff", color: "#4c6ef5" }}>
                                    <strong>Demo:</strong> Use any email (include "admin" for Admin portal) + any password
                                </p>
                            </div>

                            <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="doctor@hospital.com" />

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 pr-10 rounded-xl border text-sm outline-none transition-all"
                                        style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {showPassword ? <EyeOff size={15} style={{ color: "#94a3b8" }} /> : <Eye size={15} style={{ color: "#94a3b8" }} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded" />
                                    <span className="text-xs" style={{ color: "#64748b" }}>Remember me</span>
                                </label>
                                <button type="button" className="text-xs font-medium" style={{ color: "#4c6ef5" }}>Forgot password?</button>
                            </div>

                            {error && <ErrorMsg msg={error} />}

                            <SubmitBtn loading={loading} label="Sign In" />

                            <div className="flex gap-3 mt-4">
                                <QuickLoginBtn label="Doctor Demo" email="doctor@hospital.com" onSet={() => { setEmail("doctor@hospital.com"); setPassword("demo1234"); }} />
                                <QuickLoginBtn label="Admin Demo" email="admin@health.gov" onSet={() => { setEmail("admin@health.gov"); setPassword("demo1234"); }} />
                            </div>
                        </form>
                    ) : activeRole === "professional" ? (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-black mb-1" style={{ color: "#1a1f36" }}>Create account</h2>
                                <p className="text-sm" style={{ color: "#8898aa" }}>Join ChronicCare Sync as a healthcare professional</p>
                            </div>

                            <Field label="Full Name" type="text" value={name} onChange={setName} placeholder="Dr. Jane Smith" />

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(["doctor", "admin"] as const).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className="py-3 rounded-xl border text-sm font-semibold transition-all"
                                            style={{
                                                borderColor: role === r ? "#748ffc" : "#e8ecf4",
                                                background: role === r ? "#eef2ff" : "#f8fafc",
                                                color: role === r ? "#4c6ef5" : "#8898aa",
                                            }}
                                        >
                                            {r === "doctor" ? "🩺 Doctor" : "🏛️ Govt Admin"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {role === "doctor" && (
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Specialty</label>
                                    <select
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                                        style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                    >
                                        {["Cardiology", "Endocrinology", "Nephrology", "Neurology", "General Medicine", "Psychiatry"].map((s) => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <Field label="Email Address" type="email" value={regEmail} onChange={setRegEmail} placeholder="you@hospital.com" />

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        className="w-full px-4 py-3 pr-10 rounded-xl border text-sm outline-none"
                                        style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {showPassword ? <EyeOff size={15} style={{ color: "#94a3b8" }} /> : <Eye size={15} style={{ color: "#94a3b8" }} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        className="w-full px-4 py-3 pr-10 rounded-xl border text-sm outline-none"
                                        style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {showConfirm ? <EyeOff size={15} style={{ color: "#94a3b8" }} /> : <Eye size={15} style={{ color: "#94a3b8" }} />}
                                    </button>
                                </div>
                            </div>

                            {error && <ErrorMsg msg={error} />}
                            <SubmitBtn loading={loading} label="Create Account" />
                        </form>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function Field({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
            />
        </div>
    );
}

function ErrorMsg({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm" style={{ background: "#ffe3e3", color: "#c92a2a", border: "1px solid #ffa8a8" }}>
            <span>⚠️</span> {msg}
        </div>
    );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-70 btn-primary"
            style={{ background: "linear-gradient(135deg, #4c6ef5, #748ffc)" }}
        >
            {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
            ) : (
                <>{label} <ArrowRight size={15} /></>
            )}
        </button>
    );
}

function QuickLoginBtn({ label, email, onSet }: { label: string; email: string; onSet: () => void }) {
    return (
        <button
            type="button"
            onClick={onSet}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all"
            style={{ borderColor: "#c5d0fc", background: "#eef2ff", color: "#4c6ef5" }}
        >
            {label}
        </button>
    );
}
