import { PackageOpen } from "lucide-react";

function EmptyState({ message, description }) {
  return (
    <div className="rounded-2xl bg-white p-12 shadow-md">
      <div className="flex flex-col items-center text-center">
        <PackageOpen size={72} className="text-gray-300" />

        <h2 className="mt-5 text-2xl font-bold text-gray-700">
          {message}
        </h2>

        <p className="mt-2 max-w-md text-gray-500">
          {description || "There is currently no data available."}
        </p>
      </div>
    </div>
  );
}

export default EmptyState;