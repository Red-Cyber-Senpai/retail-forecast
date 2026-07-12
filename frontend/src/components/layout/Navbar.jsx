import { useState } from "react";
import {
  ChevronDown,
  LogOut,
  Settings,
  UserCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleSettings() {
    setOpen(false);
    navigate("/settings");
  }

  const role = user?.role || "guest";

  const roleLabel =
  role === "superadmin"
    ? "Super Administrator"
    : role === "admin"
    ? "Administrator"
    : role === "manager"
    ? "Manager"
    : role === "employee"
    ? "Employee"
    : "Guest";

  const roleStyle =
  role === "superadmin"
    ? "bg-yellow-100 text-yellow-700"
    : role === "admin"
    ? "bg-red-100 text-red-700"
    : role === "manager"
    ? "bg-blue-100 text-blue-700"
    : role === "employee"
    ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-700";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          SelfStack
        </h1>
        <p className="text-xs text-gray-500">
          AI Retail Supply Chain
        </p>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-100"
        >
          <UserCircle2 size={22} className="text-gray-600" />

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-gray-800">
              {user?.full_name || user?.email || "User"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || ""}
            </p>
          </div>

          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl border bg-white p-2 shadow-xl">
            <div className="border-b px-3 py-3">
              <div className="flex items-center gap-3">
                <UserCircle2 size={28} className="text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || ""}
                  </p>
                </div>
              </div>

              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${roleStyle}`}
              >
                {roleLabel}
              </span>
            </div>

            <button
              onClick={handleSettings}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              <Settings size={16} />
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;