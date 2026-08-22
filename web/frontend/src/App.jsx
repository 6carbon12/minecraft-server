import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Overview from "./pages/Overview";
import Backups from "./pages/Backups";
import Admin from "./pages/Admin";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch("/api/me");

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  // Guard clause: if not logged in, only show the Login component
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-lvh bg-tokyo-bg text-tokyo-fg text-lg animate-pulse bg-radial">
        Authenticating...
      </div>
    );
  }

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
