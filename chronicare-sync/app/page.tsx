"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DoctorDashboard from "@/components/DoctorDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import LoginPage from "@/components/LoginPage";
import MyPatientsPage from "@/components/MyPatientsPage";
import AppointmentsPage from "@/components/AppointmentsPage";
import HealthMonitoringPage from "@/components/HealthMonitoringPage";
import DiseaseTrendsPage from "@/components/DiseaseTrendsPage";
import AlertManagementPage from "@/components/AlertManagementPage";
import SettingsPage from "@/components/SettingsPage";
import PrescriptionsPage from "@/components/PrescriptionsPage";
import AIIntelligenceDashboard from "@/components/AIIntelligenceDashboard";
import ConsentManagementPage from "@/components/ConsentManagementPage";
import PatientCompanionDashboard from "@/components/PatientCompanionDashboard";
import PHRNSearchModal from "@/components/PHRNSearchModal";
import { Shield } from "lucide-react";

export type ViewKey =
  | "overview"
  | "myPatients"
  | "appointments"
  | "healthMonitoring"
  | "prescriptions"
  | "alertManagement"
  | "regionalAnalytics"
  | "diseaseTrends"
  | "settings"
  | "aiIntelligence"
  | "consentManagement";

// Pages that require admin role
const ADMIN_ONLY_VIEWS: ViewKey[] = ["regionalAnalytics", "diseaseTrends"];

function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "#fee2e2" }}>
        <Shield size={36} style={{ color: "#ef4444" }} />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="text-2xl font-black mb-2" style={{ color: "#1a1f36" }}>Access Restricted</h2>
        <p className="text-sm" style={{ color: "#64748b" }}>
          This page is restricted to Government Administrators only.
          Doctors can access Patient Overview, My Patients, Appointments,
          Health Monitoring, Prescriptions, Alert Management, and AI Intelligence.
        </p>
      </div>
      <button onClick={onBack}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
        style={{ background: "linear-gradient(135deg, #4c6ef5, #7c3aed)" }}>
        Go back to Dashboard
      </button>
    </div>
  );
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"doctor" | "admin" | "patient">("doctor");
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [showPHRNSearch, setShowPHRNSearch] = useState(false);

  // Global PHRN search keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && userRole === "doctor") {
        e.preventDefault();
        setShowPHRNSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userRole]);

  const handleLogin = (role: "doctor" | "admin" | "patient") => {
    setUserRole(role);
    if (role === "admin") setActiveView("regionalAnalytics");
    else if (role === "doctor") setActiveView("overview");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveView("overview");
    setShowPHRNSearch(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Patient portal — renders its own full-screen layout
  if (userRole === "patient") {
    return <PatientCompanionDashboard />;
  }

  // RBAC guard: block doctor from admin-only pages
  const isAccessDenied = userRole === "doctor" && ADMIN_ONLY_VIEWS.includes(activeView);

  const renderPage = () => {
    if (isAccessDenied) return <AccessDenied onBack={() => setActiveView("overview")} />;

    switch (activeView) {
      case "overview": return <DoctorDashboard />;
      case "myPatients": return <MyPatientsPage />;
      case "appointments": return <AppointmentsPage />;
      case "healthMonitoring": return <HealthMonitoringPage />;
      case "prescriptions": return <PrescriptionsPage />;
      case "alertManagement": return <AlertManagementPage />;
      case "regionalAnalytics": return <AdminDashboard />;
      case "diseaseTrends": return <DiseaseTrendsPage />;
      case "settings": return <SettingsPage />;
      case "aiIntelligence": return <AIIntelligenceDashboard />;
      case "consentManagement": return <ConsentManagementPage />;
      default: return <DoctorDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f0f4f8" }}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        userRole={userRole as "doctor" | "admin"}
        onPHRNSearch={() => setShowPHRNSearch(true)}
      />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>

      {/* PHRN Search Modal */}
      {showPHRNSearch && (
        <PHRNSearchModal
          onClose={() => setShowPHRNSearch(false)}
          onPatientFound={(patient) => {
            // Navigate to My Patients with the found patient highlighted
            setActiveView("myPatients");
          }}
        />
      )}
    </div>
  );
}
