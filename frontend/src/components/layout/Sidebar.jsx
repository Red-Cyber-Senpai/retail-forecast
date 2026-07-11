import {
  LayoutDashboard,
  Package,
  Boxes,
  ScanLine,
  TrendingUp,
  ShoppingCart,
  Truck,
  FileText,
  Settings,
  CircleUserRound,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function Sidebar() {
  const { user } = useAuth();

  const role = user?.role || "guest";

  const menu = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
      roles: [
        "employee",
        "manager",
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Products",
      icon: <Package size={20} />,
      path: "/products",
      roles: [
        "employee",
        "manager",
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Inventory",
      icon: <Boxes size={20} />,
      path: "/inventory",
      roles: [
        "employee",
        "manager",
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Scanner",
      icon: <ScanLine size={20} />,
      path: "/scanner",
      roles: [
        "employee",
        "manager",
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Forecast",
      icon: <TrendingUp size={20} />,
      path: "/forecast",
      roles: [
        "employee",
        "manager",
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Orders",
      icon: <ShoppingCart size={20} />,
      path: "/orders",
      roles: [
        "manager",
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Suppliers",
      icon: <Truck size={20} />,
      path: "/suppliers",
      roles: [
        "manager",
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Reports",
      icon: <FileText size={20} />,
      path: "/reports",
      roles: [
        "manager",
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Users",
      icon: <Users size={20} />,
      path: "/users",
      roles: [
        "admin",
        "superadmin",
      ],
    },
    {
      title: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
      roles: [
        "admin",
        "superadmin",
      ],
    },
  ];

  const roleStyles = {
    employee:
      "bg-slate-500/15 text-slate-300 ring-slate-500/20",

    manager:
      "bg-blue-500/15 text-blue-300 ring-blue-500/20",

    admin:
      "bg-purple-500/15 text-purple-300 ring-purple-500/20",

    superadmin:
      "bg-red-500/15 text-red-300 ring-red-500/20",

    guest:
      "bg-slate-500/15 text-slate-300 ring-slate-500/20",
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white">

      <div className="border-b border-slate-700 p-6">

        <h1 className="text-2xl font-bold">
          SelfStack
        </h1>

        <div className="mt-4 flex items-center gap-3">

          <CircleUserRound
            size={18}
            className="text-slate-400"
          />

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ${
              roleStyles[role] ||
              roleStyles.guest
            }`}
          >
            {role}
          </span>

        </div>

      </div>

      <nav className="mt-6 flex-1 px-3">

        {menu
          .filter((item) =>
            item.roles.includes(role)
          )
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.icon}

              <span>{item.title}</span>
            </NavLink>
          ))}

      </nav>

    </aside>
  );
}

export default Sidebar;