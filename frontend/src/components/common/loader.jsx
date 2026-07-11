function Loader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-72 rounded-lg bg-gray-200" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-36 rounded-2xl bg-gray-200" />
        <div className="h-36 rounded-2xl bg-gray-200" />
        <div className="h-36 rounded-2xl bg-gray-200" />
        <div className="h-36 rounded-2xl bg-gray-200" />
      </div>

      <div className="h-96 rounded-2xl bg-gray-200" />
      <div className="h-80 rounded-2xl bg-gray-200" />
    </div>
  );
}

export default Loader;