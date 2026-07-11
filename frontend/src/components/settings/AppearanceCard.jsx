import { useEffect, useState } from "react";

function AppearanceCard() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-5 text-xl font-semibold">
        Appearance
      </h2>

      <div className="flex gap-4">

        <button
          onClick={() => setTheme("light")}
          className={`rounded-lg px-6 py-3 ${
            theme === "light"
              ? "bg-blue-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Light
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`rounded-lg px-6 py-3 ${
            theme === "dark"
              ? "bg-blue-600 text-white"
              : "bg-gray-100"
          }`}
        >
          Dark
        </button>

      </div>

    </div>
  );
}

export default AppearanceCard;