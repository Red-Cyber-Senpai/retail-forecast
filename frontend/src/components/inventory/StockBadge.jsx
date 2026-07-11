function StockBadge({ stock }) {
  if (stock > 50) {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
        In Stock
      </span>
    );
  }

  if (stock > 20) {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
        Medium
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      Low Stock
    </span>
  );
}

export default StockBadge;