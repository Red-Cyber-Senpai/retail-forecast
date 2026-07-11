import ExportButton from "./ExportButton";

function ReportsToolbar({ data }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md lg:flex-row lg:items-center lg:justify-between">

      <div>

        <h1 className="text-3xl font-bold">
          Business Reports
        </h1>

        <p className="mt-1 text-gray-500">
          Executive overview of sales, inventory,
          revenue and operational performance.
        </p>

      </div>

      <ExportButton data={data} />

    </div>
  );
}

export default ReportsToolbar;