import {
  Users,
  UserCheck,
  Shield,
  Briefcase,
} from "lucide-react";

import StatCard from "../dashboard/StatCard";

function UserStats({ users = [] }) {
  const totalUsers = users.length;

  const activeUsers = users.filter(
    (u) => u.is_active
  ).length;

  const admins = users.filter((u) =>
    ["admin", "superadmin"].includes(
      u.role
    )
  ).length;

  const employees = users.filter(
    (u) => u.role === "employee"
  ).length;

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <StatCard
        title="Users"
        value={totalUsers}
        subtitle="Registered Users"
        icon={<Users size={28} />}
        bgColor="bg-blue-600"
      />

      <StatCard
        title="Active"
        value={activeUsers}
        subtitle="Currently Active"
        icon={<UserCheck size={28} />}
        bgColor="bg-green-600"
      />

      <StatCard
        title="Admins"
        value={admins}
        subtitle="Admin Accounts"
        icon={<Shield size={28} />}
        bgColor="bg-purple-600"
      />

      <StatCard
        title="Employees"
        value={employees}
        subtitle="Employees"
        icon={<Briefcase size={28} />}
        bgColor="bg-orange-600"
      />
    </div>
  );
}

export default UserStats;