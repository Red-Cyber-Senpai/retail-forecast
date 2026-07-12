import {
  Building2,
  Mail,
  Phone,
  MapPin,
  X,
} from "lucide-react";

function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3 border-b py-4">

      <div className="text-blue-600">
        {icon}
      </div>

      <div>

        <p className="text-xs uppercase text-gray-500">
          {label}
        </p>

        <p className="font-medium text-gray-800">
          {value || "-"}
        </p>

      </div>

    </div>
  );
}

function DistributorProfileDrawer({
  open,
  distributor,
  onClose,
}) {
  if (!open || !distributor) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-lg flex-col bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b p-6">

          <div>
            <h2 className="text-2xl font-bold">
              Distributor Profile
            </h2>

            <p className="text-gray-500">
              Distribution Partner Information
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={22} />
          </button>

        </div>

        <div className="flex-1 overflow-y-auto p-6">

          <InfoRow
            icon={<Building2 size={18} />}
            label="Company"
            value={distributor.company_name}
          />

          <InfoRow
            icon={<Mail size={18} />}
            label="Email"
            value={distributor.email}
          />

          <InfoRow
            icon={<Phone size={18} />}
            label="Phone"
            value={distributor.phone}
          />

          <InfoRow
            icon={<MapPin size={18} />}
            label="Region"
            value={distributor.region}
          />

        </div>

      </div>
    </>
  );
}

export default DistributorProfileDrawer;