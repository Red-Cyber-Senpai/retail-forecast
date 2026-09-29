import {
  LayoutDashboard,
  Package,
  Boxes,
  ScanLine,
  TrendingUp,
  ShoppingCart,
  Truck,
  PackageCheck,
  FileText,
  Settings,
  CircleUserRound,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

function Sidebar() {
  const { user } = useAuthContext();
  const role = user?.role || "guest";

  const menu = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/dashboard",
      roles: ["employee", "manager", "admin", "superadmin"],
    },
    {
      title: "Products",
      icon: <Package size={18} />,
      path: "/products",
      roles: ["employee", "manager", "admin", "superadmin"],
    },
    {
      title: "Inventory",
      icon: <Boxes size={18} />,
      path: "/inventory",
      roles: ["employee", "manager", "admin", "superadmin"],
    },
    {
      title: "Scanner",
      icon: <ScanLine size={18} />,
      path: "/scanner",
      roles: ["employee", "manager", "admin", "superadmin"],
    },
    {
      title: "Forecast",
      icon: <TrendingUp size={18} />,
      path: "/forecast",
      roles: ["employee", "manager", "admin", "superadmin"],
    },
    {
      title: "Orders",
      icon: <ShoppingCart size={18} />,
      path: "/orders",
      roles: ["manager", "admin", "superadmin"],
    },
    {
      title: "Suppliers",
      icon: <Truck size={18} />,
      path: "/suppliers",
      roles: ["manager", "admin", "superadmin"],
    },
    {
      title: "Distributors",
      icon: <PackageCheck size={18} />,
      path: "/distributors",
      roles: ["manager", "admin", "superadmin"],
    },
    {
      title: "Reports",
      icon: <FileText size={18} />,
      path: "/reports",
      roles: ["manager", "admin", "superadmin"],
    },
    {
      title: "Users",
      icon: <Users size={18} />,
      path: "/users",
      roles: ["admin", "superadmin"],
    },
    {
      title: "Settings",
      icon: <Settings size={18} />,
      path: "/settings",
      roles: ["superadmin"],
    },
  ];

  return (
    <aside
      style={{
        width: "260px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        transition: "background-color var(--transition-normal)",
      }}
    >
      <div
        style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justify: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.1rem",
              fontFamily: "var(--font-display)",
              justifyContent: "center",
            }}
          >
            S
          </div>
          <h1
            style={{
              fontSize: "1.3rem",
              fontFamily: "var(--font-display)",
              fontWeight: "800",
              background: "linear-gradient(135deg, var(--color-primary), #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SelfStack
          </h1>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>
          AI-POWERED SUPPLY CHAIN
        </p>

        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "12px",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "var(--color-primary-light)",
              width: "fit-content",
            }}
          >
            <CircleUserRound size={14} style={{ color: "var(--color-primary)" }} />
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-primary)",
              }}
            >
              {role}
            </span>
          </div>
        )}
      </div>

      <nav
        style={{
          flex: 1,
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          overflowY: "auto",
        }}
      >
        {menu
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
                borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
                transition: "all var(--transition-fast)",
              })}
              className={({ isActive }) => (isActive ? "" : "sidebar-link-hover")}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "inherit",
                }}
              >
                {item.icon}
              </span>
              <span>{item.title}</span>
            </NavLink>
          ))}
      </nav>

      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-color)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        SelfStack ERP &copy; 2026
      </div>
    </aside>
  );
}

// Add stylesheet rules for sidebar link hover dynamically
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = `
    .sidebar-link-hover:hover {
      background-color: light-dark(rgba(0, 0, 0, 0.02), rgba(255, 255, 255, 0.03)) !important;
      color: var(--text-primary) !important;
      transform: translateX(2px);
    }
  `;
  document.head.appendChild(styleEl);
}

export default Sidebar;
