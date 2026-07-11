import { Shield, LogOut, Lock } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function SecurityCard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <div className="mb-6 flex items-center gap-3">

        <Shield className="text-blue-600" />

        <h2 className="text-xl font-semibold">
          Security
        </h2>

      </div>

      <div className="space-y-5">

        <div className="rounded-lg bg-gray-50 p-4">

          <p className="text-sm text-gray-500">
            Logged in as
          </p>

          <h3 className="font-semibold">
            {user?.email}
          </h3>

        </div>

        <div className="rounded-lg bg-gray-50 p-4">

          <p className="text-sm text-gray-500">
            Role
          </p>

          <h3 className="font-semibold capitalize">
            {user?.role}
          </h3>

        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 py-3 text-white hover:bg-yellow-600"
          disabled
        >
          <Lock size={18} />
          Change Password (Coming Soon)
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-white hover:bg-red-700"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </div>
  );
}

export default SecurityCard;