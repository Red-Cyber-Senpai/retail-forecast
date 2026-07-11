function StatusBadge({ status }) {
  let color =
    "bg-gray-100 text-gray-700";

  switch (status) {
    case "PENDING":
      color =
        "bg-yellow-100 text-yellow-700";
      break;

    case "CONFIRMED":
      color =
        "bg-blue-100 text-blue-700";
      break;

    case "SHIPPED":
      color =
        "bg-purple-100 text-purple-700";
      break;

    case "DELIVERED":
      color =
        "bg-green-100 text-green-700";
      break;

    case "CANCELLED":
      color =
        "bg-red-100 text-red-700";
      break;

    default:
      break;
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold ${color}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;