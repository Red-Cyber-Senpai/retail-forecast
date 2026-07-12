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

function SupplierStats({
  suppliers = [],
}) {
  const totalSuppliers =
    suppliers.length;

  const avgRating =
    suppliers.length === 0
      ? 0
      : (
          suppliers.reduce(
            (sum, supplier) =>
              sum +
              Number(
                supplier.rating || 5
              ),
            0
          ) / suppliers.length
        ).toFixed(1);

  const avgLeadTime =
    suppliers.length === 0
      ? 0
      : Math.round(
          suppliers.reduce(
            (sum, supplier) =>
              sum +
              Number(
                supplier.lead_time_days ||
                  7
              ),
            0
          ) / suppliers.length
        );

  const cities =
    new Set(
      suppliers.map(
        (supplier) =>
          supplier.city
      )
    ).size;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Total Suppliers"
        value={totalSuppliers}
        color="bg-blue-600"
      />

      <StatCard
        title="Average Rating"
        value={`${avgRating} / 5`}
        color="bg-green-600"
      />

      <StatCard
        title="Average Lead Time"
        value={`${avgLeadTime} Days`}
        color="bg-orange-500"
      />

      <StatCard
        title="Cities Covered"
        value={cities}
        color="bg-purple-600"
      />

    </div>
  );
}

export default SupplierStats;