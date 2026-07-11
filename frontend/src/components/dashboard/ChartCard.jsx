function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-md ${className}`}>
      <h2 className="mb-5 text-xl font-semibold text-gray-800">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default ChartCard;