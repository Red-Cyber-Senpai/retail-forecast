import { useState, useEffect } from "react";
import {
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  UserCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("color-scheme") || "light";
  });

  useEffect(() => {
    // Sync initial theme
    const savedTheme = localStorage.getItem("color-scheme");
    if (savedTheme) {
      document.querySelector('meta[name="color-scheme"]').content = savedTheme;
      document.documentElement.style.colorScheme = savedTheme;
      setTheme(savedTheme);
    } else {
      // Fallback/detect system theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      document.querySelector('meta[name="color-scheme"]').content = "light dark";
      document.documentElement.style.colorScheme = initial;
      setTheme(initial);
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.querySelector('meta[name="color-scheme"]').content = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("color-scheme", nextTheme);
    setTheme(nextTheme);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const role = user?.role || "guest";
  const roleLabel =
    role === "superadmin"
      ? "Super Admin"
      : role === "admin"
      ? "Administrator"
      : role === "manager"
      ? "Manager"
      : role === "employee"
      ? "Employee"
      : "Guest";

  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        backgroundColor: "var(--bg-navbar)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-color)",
        position: "sticky",
        top: 0,
        zIndex: 90,
        transition: "background-color var(--transition-normal)",
      }}
    >
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: "600", fontFamily: "var(--font-display)" }}>
          Management Console
        </h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border-color)",
            backgroundColor: "light-dark(rgba(0,0,0,0.02), rgba(255,255,255,0.03))",
            color: "var(--text-primary)",
            transition: "all var(--transition-fast)",
          }}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Account Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 12px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              backgroundColor: "light-dark(#ffffff, #0d111a)",
              transition: "all var(--transition-fast)",
            }}
          >
            <UserCircle2 size={20} style={{ color: "var(--text-secondary)" }} />
            <div style={{ textAlign: "left", display: "none" }} className="sm-profile-text">
              <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)" }}>
                {user?.full_name || "User"}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {roleLabel}
              </p>
            </div>
            <ChevronDown size={14} style={{ color: "var(--text-secondary)" }} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                marginTop: "8px",
                width: "280px",
                backgroundColor: "var(--bg-modal)",
                border: "1px solid var(--border-color)",
                borderRadius: "16px",
                boxShadow: "var(--shadow-xl)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border-color)",
                  marginBottom: "4px",
                }}
              >
                <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" }}>
                  {user?.full_name || "SelfStack User"}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {user?.email || ""}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "8px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    backgroundColor: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  {roleLabel}
                </span>
              </div>

              {role === "superadmin" && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/settings");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    color: "var(--text-primary)",
                    textAlign: "left",
                    width: "100%",
                  }}
                  className="dropdown-item-hover"
                >
                  <SettingsIcon size={16} />
                  System Settings
                </button>
              )}

              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "var(--color-danger)",
                  textAlign: "left",
                  width: "100%",
                }}
                className="dropdown-item-hover"
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Add stylesheet rules for dynamic dropdown hover
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    .dropdown-item-hover:hover {
      background-color: light-dark(rgba(0, 0, 0, 0.02), rgba(255, 255, 255, 0.03)) !important;
    }
    @media (min-width: 640px) {
      .sm-profile-text {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

export default Navbar;
