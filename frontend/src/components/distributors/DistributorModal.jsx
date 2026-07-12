import { useEffect, useState } from "react";

function DistributorModal({
  open,
  distributor,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    company_name: "",
    email: "",
    phone: "",
    region: "",
  });

  useEffect(() => {
    if (distributor) {
      setForm(distributor);
    } else {
      setForm({
        company_name: "",
        email: "",
        phone: "",
        region: "",
      });
    }
  }, [distributor]);

  if (!open) return null;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

        <h2 className="mb-6 text-2xl font-bold">
          {distributor
            ? "Edit Distributor"
            : "Add Distributor"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            placeholder="Company Name"
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full rounded-lg border p-3"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full rounded-lg border p-3"
          />

          <input
            name="region"
            value={form.region}
            onChange={handleChange}
            placeholder="Region"
            className="w-full rounded-lg border p-3"
          />

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white"
            >
              Save
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default DistributorModal;