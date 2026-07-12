function StatCard({
  title,
  value,
  color,
}) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-md text-white ${color}`}
    >
      <p className="text-sm opacity-90">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>
    </div>
  );
}

function DistributorStats({
  distributors = [],
}) {
  const totalDistributors =
    distributors.length;

  const totalRegions = new Set(
    distributors
      .map((d) => d.region)
      .filter(Boolean)
  ).size;

  const totalEmails = distributors.filter(
    (d) => d.email
  ).length;

  const totalPhones = distributors.filter(
    (d) => d.phone
  ).length;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Total Distributors"
        value={totalDistributors}
        color="bg-blue-600"
      />

      <StatCard
        title="Regions Covered"
        value={totalRegions}
        color="bg-green-600"
      />

      <StatCard
        title="Email Registered"
        value={totalEmails}
        color="bg-orange-500"
      />

      <StatCard
        title="Phone Registered"
        value={totalPhones}
        color="bg-purple-600"
      />

    </div>
  );
}

export default DistributorStats;