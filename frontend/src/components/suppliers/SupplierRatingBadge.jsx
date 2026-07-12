function SupplierRatingBadge({ rating = 0 }) {
  const value = Number(rating);

  let color = "bg-red-100 text-red-700";

  if (value >= 4.5) {
    color = "bg-green-100 text-green-700";
  } else if (value >= 3.5) {
    color = "bg-yellow-100 text-yellow-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      ⭐ {value.toFixed(1)}
    </span>
  );
}

export default SupplierRatingBadge;