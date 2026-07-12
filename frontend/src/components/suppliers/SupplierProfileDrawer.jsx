import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  X,
} from "lucide-react";

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b py-3">
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

function SupplierProfileDrawer({
  open,
  supplier,
  onClose,
}) {
  if (!open || !supplier) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-lg flex-col bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b p-6">

          <div>
            <h2 className="text-2xl font-bold">
              Supplier Profile
            </h2>

            <p className="text-gray-500">
              Complete supplier information
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
            value={supplier.company_name}
          />

          <InfoRow
            icon={<User size={18} />}
            label="Contact Person"
            value={supplier.contact_person}
          />

          <InfoRow
            icon={<Mail size={18} />}
            label="Email"
            value={supplier.email}
          />

          <InfoRow
            icon={<Phone size={18} />}
            label="Phone"
            value={supplier.phone}
          />

          <InfoRow
            icon={<MapPin size={18} />}
            label="Address"
            value={`${supplier.address || ""} ${supplier.city || ""} ${supplier.state || ""} ${supplier.country || ""}`}
          />

          <InfoRow
            icon={<Clock size={18} />}
            label="Lead Time"
            value={`${supplier.lead_time_days} Days`}
          />

          <InfoRow
            icon={<Star size={18} />}
            label="Rating"
            value={`${supplier.rating}/5`}
          />

        </div>
      </div>
    </>
  );
}

export default SupplierProfileDrawer;