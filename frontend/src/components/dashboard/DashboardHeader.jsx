import useAuth from "../../hooks/useAuth";

function DashboardHeader() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-md">

      <div>

        <h1 className="text-3xl font-bold">
          Welcome back,
          {" "}
          {user?.full_name || "User"}
        </h1>

        <p className="mt-2 text-gray-500">
          Monitor your retail operations in real time.
        </p>

      </div>

      <div className="text-right">

        <p className="font-semibold">
          {today}
        </p>

        <p className="text-sm text-gray-500">
          SelfStack Dashboard
        </p>

      </div>

    </div>
  );
}

export default DashboardHeader;