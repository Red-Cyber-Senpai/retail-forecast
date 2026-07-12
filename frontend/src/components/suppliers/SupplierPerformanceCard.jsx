function SupplierPerformanceCard({
  suppliers = [],
}) {
  const highestRated =
    suppliers.reduce(
      (best, supplier) =>
        (supplier.rating || 0) >
        (best.rating || 0)
          ? supplier
          : best,
      {}
    );

  const fastest =
    suppliers.reduce(
      (best, supplier) =>
        (supplier.lead_time_days ||
          999) <
        (best.lead_time_days ||
          999)
          ? supplier
          : best,
      {}
    );

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-xl font-semibold">
        Supplier Performance
      </h2>

      <div className="space-y-5">

        <div>

          <p className="text-sm text-gray-500">
            Highest Rated Supplier
          </p>

          <h3 className="text-lg font-semibold">
            {highestRated.company_name ||
              "-"}
          </h3>

          <p className="text-green-600">
            ⭐ {highestRated.rating || 0}/5
          </p>

        </div>

        <hr />

        <div>

          <p className="text-sm text-gray-500">
            Fastest Delivery
          </p>

          <h3 className="text-lg font-semibold">
            {fastest.company_name ||
              "-"}
          </h3>

          <p className="text-blue-600">
            {fastest.lead_time_days || 0}
            {" "}Days
          </p>

        </div>

      </div>

    </div>
  );
}

export default SupplierPerformanceCard;