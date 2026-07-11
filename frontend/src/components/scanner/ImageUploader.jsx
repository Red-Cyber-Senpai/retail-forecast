function ImageUploader({
  onImageSelect,
  disabled,
}) {
  function handleChange(e) {
    const file = e.target.files[0];

    if (file) {
      onImageSelect(file);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <h2 className="mb-4 text-xl font-semibold">
        Upload Product Image
      </h2>

      <input
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={handleChange}
        className="w-full rounded-lg border p-4 disabled:bg-gray-100"
      />

    </div>
  );
}

export default ImageUploader;