import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Overview from "./pages/Overview";
import Backups from "./pages/Backups";
import Admin from "./pages/Admin";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Guard clause: if not logged in, only show the Login component
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // If logged in, render the router
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Layout onLogout={() => setIsAuthenticated(false)} />}
        >
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="backups" element={<Backups />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
