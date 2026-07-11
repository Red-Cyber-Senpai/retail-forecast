import { useState } from "react";

function NotificationCard() {
  const [email, setEmail] = useState(true);
  const [inventory, setInventory] = useState(true);
  const [forecast, setForecast] = useState(true);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold">
        Notifications
      </h2>

      <div className="space-y-5">

        <label className="flex items-center justify-between">

          Email Notifications

          <input
            type="checkbox"
            checked={email}
            onChange={() =>
              setEmail(!email)
            }
          />

        </label>

        <label className="flex items-center justify-between">

          Inventory Alerts

          <input
            type="checkbox"
            checked={inventory}
            onChange={() =>
              setInventory(!inventory)
            }
          />

        </label>

        <label className="flex items-center justify-between">

          Forecast Alerts

          <input
            type="checkbox"
            checked={forecast}
            onChange={() =>
              setForecast(!forecast)
            }
          />

        </label>

      </div>

    </div>
  );
}

export default NotificationCard;