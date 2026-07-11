import useAuth from "../../hooks/useAuth";

function ProfileCard() {
  const { user } = useAuth();

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold">
        Profile
      </h2>

      <div className="grid gap-5 md:grid-cols-2">

        <div>
          <label className="text-sm text-gray-500">
            Full Name
          </label>

          <p className="mt-1 font-semibold">
            {user?.full_name || "-"}
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Email
          </label>

          <p className="mt-1 font-semibold">
            {user?.email || "-"}
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Phone
          </label>

          <p className="mt-1 font-semibold">
            {user?.phone || "-"}
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Role
          </label>

          <p className="mt-1 capitalize font-semibold">
            {user?.role || "-"}
          </p>
        </div>

      </div>

    </div>
  );
}

export default ProfileCard;