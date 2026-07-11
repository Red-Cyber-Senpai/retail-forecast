import { useState } from "react";

function PreferencesCard() {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-6 text-2xl font-bold">
        Preferences
      </h2>

      <div className="space-y-5">

        <label className="flex items-center justify-between">

          <span>Enable Notifications</span>

          <input
            type="checkbox"
            checked={notifications}
            onChange={() =>
              setNotifications(!notifications)
            }
          />

        </label>

        <label className="flex items-center justify-between">

          <span>Auto Refresh Dashboard</span>

          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() =>
              setAutoRefresh(!autoRefresh)
            }
          />

        </label>

      </div>

    </div>
  );
}

export default PreferencesCard;