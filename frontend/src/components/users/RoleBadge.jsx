function RoleBadge({ role }) {
  const styles = {
    employee:
      "bg-green-100 text-green-700",

    manager:
      "bg-blue-100 text-blue-700",

    admin:
      "bg-purple-100 text-purple-700",

    superadmin:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
        styles[role] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {role}
    </span>
  );
}

export default RoleBadge;