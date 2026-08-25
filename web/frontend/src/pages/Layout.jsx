import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import hambuger from "../assets/hambuger.svg";
import close from "../assets/close.svg";
import siteLogo from "../assets/logo.png";

export default function Layout({ onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currectLocation = location.pathname;

  // Configuration array to prevent repeating <NavLink> code
  const navLinks = [
    { path: "/overview", label: "Overview" },
    { path: "/backups", label: "Backups" },
    { path: "/admin", label: "Admin" },
  ];

  // Extracted styling logic for cleaner JSX below
  const getNavStyle = ({ isActive }) =>
    `transition-colors text-sm font-medium sm:text-base px-3 py-2 rounded-md block w-full sm:w-auto ${
      isActive
        ? "text-tokyo-bg bg-tokyo-accent"
        : "text-tokyo-fg/70 hover:text-tokyo-accent hover:bg-tokyo-surface"
    }`;

  return (
    <div className="bg-tokyo-bg flex h-svh flex-col">
      <nav className="border-tokyo-border bg-tokyo-surface flex flex-col items-center border-b px-4 py-4 transition-all sm:px-8 z-100">
        <div className="flex w-full max-w-480 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
        <div className="flex flex-0.9 items-center justify-start sm:flex-none">
          <img
            src={siteLogo}
            alt="Minecraft Logo"
            className={`h-10 w-10`}
          />
        </div>
            <span className="text-tokyo-fg font-bold tracking-wide">
              <p className="text-tokyo-fg hidden font-bold tracking-wide sm:block">
                Atlantis Control
              </p>
              <p className="text-tokyo-accent font-bold tracking-wide sm:hidden">
                {currectLocation.toUpperCase().replace("/", "")}
              </p>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-2 sm:flex">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={getNavStyle}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            className="text-tokyo-fg hover:text-tokyo-accent cursor-pointer p-2 font-bold sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <img src={close} className="h-8 w-full object-cover" />
            ) : (
              <img src={hambuger} className="h-8 w-full object-cover" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="border-tokyo-border mt-4 flex w-full flex-col gap-2 border-t pt-4 sm:hidden">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={getNavStyle}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={onLogout}
              className="border-tokyo-error/30 text-tokyo-error hover:bg-tokyo-error/20 w-full cursor-pointer rounded border px-4 py-2 text-left text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <main className="min-h-0 flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
