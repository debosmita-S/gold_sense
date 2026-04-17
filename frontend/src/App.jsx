import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Assess from "./pages/Assess.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Demo from "./pages/Demo.jsx";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-0)" }}>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/assess"    element={<Assess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/demo"      element={<Demo />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
