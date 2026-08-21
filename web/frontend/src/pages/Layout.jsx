import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import hambuger from '../assets/hambuger.svg';
import close from '../assets/close.svg';

export default function Layout({ onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Configuration array to prevent repeating <NavLink> code
  const navLinks = [
    { path: '/overview', label: 'Overview' },
    { path: '/backups', label: 'Backups' },
    { path: '/admin', label: 'Admin' },
  ];

  // Extracted styling logic for cleaner JSX below
  const getNavStyle = ({ isActive }) =>
    `transition-colors text-sm font-medium sm:text-base px-3 py-2 rounded-md block w-full sm:w-auto ${
      isActive 
        ? 'text-tokyo-bg bg-tokyo-accent' 
        : 'text-tokyo-fg/70 hover:text-tokyo-accent hover:bg-tokyo-surface'
    }`;

  return (
    <div className="flex flex-col h-svh bg-tokyo-bg">
      <nav className="border-b border-tokyo-border bg-tokyo-surface px-4 py-4 sm:px-8 transition-all flex items-center flex-col">

        <div className="flex items-center justify-between w-full max-w-480">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tokyo-border bg-tokyo-bg font-bold text-tokyo-accent">
              A
            </div>
            <span className="font-bold tracking-wide text-tokyo-fg">Atlantis Control</span>
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
            className="cursor-pointer p-2 font-bold text-tokyo-fg hover:text-tokyo-accent sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {
              isMobileMenuOpen ?
              <img src={close} className="h-8 w-full object-cover"/>
              :
              <img src={hambuger} className="h-8 w-full object-cover"/>
            }
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="mt-4 flex flex-col gap-2 w-full border-t border-tokyo-border pt-4 sm:hidden">
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
            <button onClick={onLogout} className="w-full cursor-pointer rounded border border-tokyo-error/30 px-4 py-2 text-left text-sm text-tokyo-error transition-colors hover:bg-tokyo-error/20">
              Logout
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1 min-h-0 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
