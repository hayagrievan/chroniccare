"use client";

import { useState } from "react";
import {
    User, Bell, Shield, Palette, AlertOctagon, Camera,
    ChevronRight, Check, Eye, EyeOff,
} from "lucide-react";

type SettingSection = "profile" | "notifications" | "security" | "appearance" | "danger";

const SECTIONS: { key: SettingSection; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User size={16} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { key: "security", label: "Security", icon: <Shield size={16} /> },
    { key: "appearance", label: "Appearance", icon: <Palette size={16} /> },
    { key: "danger", label: "Danger Zone", icon: <AlertOctagon size={16} /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ background: checked ? "#0052cc" : "#e2e8f0" }}
        >
            <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow"
                style={{ left: checked ? "calc(100% - 20px)" : "4px" }}
            />
        </button>
    );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid #e2e8f0" }}>
                <h3 className="font-bold text-sm" style={{ color: "#0a2540" }}>{title}</h3>
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}

function Field({ label, type = "text", value, onChange, placeholder = "", hint = "" }: {
    label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
            />
            {hint && <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{hint}</p>}
        </div>
    );
}

export default function SettingsPage() {
    const [section, setSection] = useState<SettingSection>("profile");
    const [saved, setSaved] = useState(false);

    // Profile
    const [name, setName] = useState("Dr. Priya Nair");
    const [email, setEmail] = useState("priya.nair@apollo.com");
    const [phone, setPhone] = useState("+91 98765 43210");
    const [specialty, setSpecialty] = useState("Cardiology");
    const [hospital, setHospital] = useState("Apollo Hospitals, Chennai");
    const [license, setLicense] = useState("MCI-45621");
    const [bio, setBio] = useState("Senior Cardiologist with 14 years of experience. Specializing in interventional cardiology and heart failure management.");

    // Notifications
    const [notifs, setNotifs] = useState({
        criticalAlerts: true,
        smsReminders: true,
        emailDigest: true,
        pushNotifications: false,
        appointmentReminders: true,
        labResults: true,
        weeklyReport: false,
    });

    // Security
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [twoFactor, setTwoFactor] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState("30");

    // Appearance
    const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
    const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
    const [fontSize, setFontSize] = useState("14");
    const [accentColor, setAccentColor] = useState("#0052cc");

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between" style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#0a2540" }}>Settings</h1>
                    <p className="text-sm" style={{ color: "#64748b" }}>Manage your account, preferences, and security</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold fade-in" style={{ background: "#f6ffed", color: "#52c41a", border: "1px solid #b7eb8f" }}>
                        <Check size={14} /> Changes saved!
                    </div>
                )}
            </div>

            <div className="flex h-[calc(100%-73px)]">
                {/* Left nav */}
                <div className="w-56 shrink-0 p-4 space-y-1" style={{ borderRight: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    {SECTIONS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSection(s.key)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                            style={{
                                background: section === s.key ? "#e6f0ff" : "transparent",
                                color: section === s.key ? "#0052cc" : "#64748b",
                            }}
                        >
                            {s.icon}
                            {s.label}
                            {section === s.key && <ChevronRight size={14} className="ml-auto" />}
                        </button>
                    ))}
                </div>

                {/* Right content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* ── Profile ── */}
                    {section === "profile" && (
                        <>
                            <SectionCard title="Profile Photo">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white" style={{ background: "linear-gradient(135deg, #ff6b6b, #ee5a24)" }}>
                                            PN
                                        </div>
                                        <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white" style={{ background: "#0052cc" }}>
                                            <Camera size={12} className="text-white" />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold" style={{ color: "#0a2540" }}>Dr. Priya Nair</p>
                                        <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>JPG, PNG up to 5MB · Recommended 200×200px</p>
                                        <button className="px-4 py-2 rounded-xl border text-xs font-semibold" style={{ borderColor: "#e2e8f0", color: "#64748b" }}>Upload Photo</button>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Personal Information">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Full Name" value={name} onChange={setName} />
                                    <Field label="Email Address" type="email" value={email} onChange={setEmail} />
                                    <Field label="Phone" type="tel" value={phone} onChange={setPhone} />
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Specialty</label>
                                        <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}>
                                            {["Cardiology", "Endocrinology", "Nephrology", "Neurology", "General Medicine", "Psychiatry"].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <Field label="Hospital / Institution" value={hospital} onChange={setHospital} />
                                    <Field label="Medical License No." value={license} onChange={setLicense} hint="MCI or State Medical Council registration" />
                                </div>
                                <div className="mt-4">
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Professional Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                                        style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                    />
                                </div>
                                <button onClick={handleSave} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #0052cc, #1a73e8)" }}>
                                    Save Profile
                                </button>
                            </SectionCard>
                        </>
                    )}

                    {/* ── Notifications ── */}
                    {section === "notifications" && (
                        <SectionCard title="Notification Preferences">
                            <div className="space-y-4">
                                {(Object.keys(notifs) as (keyof typeof notifs)[]).map(key => {
                                    const labels: Record<keyof typeof notifs, { label: string; desc: string }> = {
                                        criticalAlerts: { label: "Critical Patient Alerts", desc: "Instant alerts for life-threatening vital signs" },
                                        smsReminders: { label: "SMS Reminders", desc: "Text reminders for appointments and medications" },
                                        emailDigest: { label: "Daily Email Digest", desc: "Summary of patient updates sent each morning" },
                                        pushNotifications: { label: "Push Notifications", desc: "Browser and mobile push alerts" },
                                        appointmentReminders: { label: "Appointment Reminders", desc: "24-hour and 1-hour reminders for upcoming appointments" },
                                        labResults: { label: "Lab & Report Alerts", desc: "Notify when new lab results are available" },
                                        weeklyReport: { label: "Weekly Analytics Report", desc: "Automated weekly patient health summary" },
                                    };
                                    const { label, desc } = labels[key];
                                    return (
                                        <div key={key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: "#0a2540" }}>{label}</p>
                                                <p className="text-xs" style={{ color: "#94a3b8" }}>{desc}</p>
                                            </div>
                                            <Toggle checked={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={handleSave} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #0052cc, #1a73e8)" }}>
                                Save Preferences
                            </button>
                        </SectionCard>
                    )}

                    {/* ── Security ── */}
                    {section === "security" && (
                        <>
                            <SectionCard title="Change Password">
                                <div className="space-y-4 max-w-md">
                                    {[
                                        { label: "Current Password", value: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                                        { label: "New Password", value: newPwd, set: setNewPwd, show: showNew, toggle: () => setShowNew(v => !v) },
                                        { label: "Confirm Password", value: confirmPwd, set: setConfirmPwd, show: showNew, toggle: () => setShowNew(v => !v) },
                                    ].map(f => (
                                        <div key={f.label}>
                                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>{f.label}</label>
                                            <div className="relative">
                                                <input
                                                    type={f.show ? "text" : "password"}
                                                    value={f.value}
                                                    onChange={e => f.set(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2.5 pr-10 rounded-xl border text-sm outline-none"
                                                    style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                                />
                                                <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {f.show ? <EyeOff size={14} style={{ color: "#94a3b8" }} /> : <Eye size={14} style={{ color: "#94a3b8" }} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #0052cc, #1a73e8)" }}>
                                        Update Password
                                    </button>
                                </div>
                            </SectionCard>

                            <SectionCard title="Security Settings">
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: "#0a2540" }}>Two-Factor Authentication</p>
                                            <p className="text-xs" style={{ color: "#94a3b8" }}>Require OTP on each login — highly recommended for clinical accounts</p>
                                        </div>
                                        <Toggle checked={twoFactor} onChange={setTwoFactor} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Session Timeout (minutes)</label>
                                        <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="px-4 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}>
                                            {["15", "30", "60", "120"].map(v => <option key={v} value={v}>{v} min</option>)}
                                        </select>
                                    </div>
                                    <div className="pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                                        <p className="text-xs font-semibold mb-2" style={{ color: "#64748b" }}>Active Sessions</p>
                                        {[
                                            { device: "Chrome · Windows 11", location: "Chennai, IN", current: true },
                                            { device: "Safari · iPhone 15", location: "Chennai, IN", current: false },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i === 0 ? "1px solid #f1f5f9" : "none" }}>
                                                <div>
                                                    <p className="text-sm" style={{ color: "#0a2540" }}>{s.device} {s.current && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#e6f0ff", color: "#0052cc" }}>Current</span>}</p>
                                                    <p className="text-xs" style={{ color: "#94a3b8" }}>{s.location}</p>
                                                </div>
                                                {!s.current && <button className="text-xs font-semibold" style={{ color: "#ff4d4f" }}>Revoke</button>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SectionCard>
                        </>
                    )}

                    {/* ── Appearance ── */}
                    {section === "appearance" && (
                        <SectionCard title="Appearance & Accessibility">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold mb-3" style={{ color: "#374151" }}>Theme</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(["light", "dark", "system"] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTheme(t)}
                                                className="py-3 rounded-xl border text-sm font-semibold capitalize transition-all"
                                                style={{
                                                    borderColor: theme === t ? "#0052cc" : "#e2e8f0",
                                                    background: theme === t ? "#e6f0ff" : "#f8fafc",
                                                    color: theme === t ? "#0052cc" : "#64748b",
                                                }}
                                            >
                                                {t === "light" ? "☀️" : t === "dark" ? "🌙" : "💻"} {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-3" style={{ color: "#374151" }}>Interface Density</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(["compact", "comfortable", "spacious"] as const).map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setDensity(d)}
                                                className="py-3 rounded-xl border text-sm font-semibold capitalize transition-all"
                                                style={{
                                                    borderColor: density === d ? "#0052cc" : "#e2e8f0",
                                                    background: density === d ? "#e6f0ff" : "#f8fafc",
                                                    color: density === d ? "#0052cc" : "#64748b",
                                                }}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs font-semibold" style={{ color: "#374151" }}>Font Size</label>
                                        <span className="text-xs font-bold" style={{ color: "#0052cc" }}>{fontSize}px</span>
                                    </div>
                                    <input type="range" min="12" max="18" value={fontSize} onChange={e => setFontSize(e.target.value)} className="w-full accent-blue-600" />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-2" style={{ color: "#374151" }}>Accent Color</label>
                                    <div className="flex gap-3">
                                        {["#0052cc", "#7c3aed", "#059669", "#dc2626", "#d97706"].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setAccentColor(c)}
                                                className="w-8 h-8 rounded-full border-2 transition-all"
                                                style={{ background: c, borderColor: accentColor === c ? "#0a2540" : "transparent", transform: accentColor === c ? "scale(1.2)" : "scale(1)" }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #0052cc, #1a73e8)" }}>
                                    Apply Settings
                                </button>
                            </div>
                        </SectionCard>
                    )}

                    {/* ── Danger Zone ── */}
                    {section === "danger" && (
                        <div className="rounded-2xl border p-5" style={{ background: "#fff", borderColor: "#ffccc7" }}>
                            <h3 className="font-bold mb-1" style={{ color: "#ff4d4f" }}>Danger Zone</h3>
                            <p className="text-xs mb-5" style={{ color: "#94a3b8" }}>These actions are irreversible. Please proceed with caution.</p>
                            <div className="space-y-4">
                                {[
                                    { label: "Export All Data", desc: "Download all your patient records and reports as a ZIP archive.", btn: "Export", danger: false },
                                    { label: "Deactivate Account", desc: "Temporarily suspend your account. You can reactivate at any time.", btn: "Deactivate", danger: true },
                                    { label: "Delete Account", desc: "Permanently delete your account and all associated data. This cannot be undone.", btn: "Delete Account", danger: true },
                                ].map(a => (
                                    <div key={a.label} className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: "#0a2540" }}>{a.label}</p>
                                            <p className="text-xs" style={{ color: "#94a3b8" }}>{a.desc}</p>
                                        </div>
                                        <button
                                            className="px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:opacity-80"
                                            style={{
                                                borderColor: a.danger ? "#ffccc7" : "#e2e8f0",
                                                background: a.danger ? "#fff1f0" : "#f8fafc",
                                                color: a.danger ? "#ff4d4f" : "#64748b",
                                            }}
                                        >
                                            {a.btn}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
