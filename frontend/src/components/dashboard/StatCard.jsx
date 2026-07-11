import { motion } from "framer-motion";
import CountUp from "react-countup";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  bgColor = "bg-blue-600",
}) {
  const isNumeric =
    typeof value === "number" ||
    (typeof value === "string" &&
      /^\s*-?\d+(\.\d+)?\s*$/.test(value));

  const numericValue = Number(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {isNumeric ? (
              <CountUp end={numericValue} duration={1.6} separator="," />
            ) : (
              value
            )}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-xl text-white shadow-md ${bgColor}`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;