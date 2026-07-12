function RegionBadge({ region }) {
  const colors = {
    North: "bg-blue-100 text-blue-700",
    South: "bg-green-100 text-green-700",
    East: "bg-yellow-100 text-yellow-700",
    West: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[region] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {region || "Unknown"}
    </span>
  );
}

export default RegionBadge;