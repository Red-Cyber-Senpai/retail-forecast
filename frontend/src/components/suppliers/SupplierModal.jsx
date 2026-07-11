import { useEffect, useState } from "react";

function SupplierModal({
  open,
  onClose,
  onSave,
  supplier,
}) {
  const emptySupplier = {
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    lead_time_days: 7,
  };

  const [form, setForm] = useState(emptySupplier);

  useEffect(() => {
    if (supplier) {
      setForm(supplier);
    } else {
      setForm(emptySupplier);
    }
  }, [supplier, open]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "lead_time_days"
          ? Number(value)
          : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
          {supplier ? "Edit Supplier" : "Add Supplier"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >

          <input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            placeholder="Company Name"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="contact_person"
            value={form.contact_person}
            onChange={handleChange}
            placeholder="Contact Person"
            className="rounded-lg border p-3"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="rounded-lg border p-3"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="rounded-lg border p-3"
          />

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="col-span-2 rounded-lg border p-3"
          />

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            className="rounded-lg border p-3"
          />

          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State"
            className="rounded-lg border p-3"
          />

          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="Country"
            className="rounded-lg border p-3"
          />

          <input
            type="number"
            name="lead_time_days"
            value={form.lead_time_days}
            onChange={handleChange}
            placeholder="Lead Time (Days)"
            className="rounded-lg border p-3"
          />

          <div className="col-span-2 mt-4 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-300 px-5 py-2 hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              {supplier ? "Update" : "Save"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default SupplierModal;